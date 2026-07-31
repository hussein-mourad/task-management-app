import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@/db";
import { tasks, projectMembers } from "@/db/schema";
import { createTaskSchema, updateTaskSchema } from "./tasks.validator";
import { requireAuth } from "@/features/auth/auth.middleware";
import { AppError } from "@/middleware/errors";
import { eq, and, or, count, asc, desc, ilike, sql, type SQL } from "drizzle-orm";

export const tasksRouter = Router({ mergeParams: true });

tasksRouter.use(requireAuth);

async function requireMember(req: Request, _res: Response, next: NextFunction) {
  try {
    const [member] = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, req.params.projectId as string), eq(projectMembers.userId, req.userId!)))
      .limit(1);
    if (!member) throw new AppError(403, "Not a project member");
    next();
  } catch (e) {
    next(e);
  }
}

async function validateAssignee(projectId: string, assignedTo?: string | null) {
  if (!assignedTo) return;
  const [member] = await db
    .select()
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, assignedTo)))
    .limit(1);
  if (!member) throw new AppError(400, "Assigned user is not a project member");
}

tasksRouter.get("/", requireMember, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string, 10) || 50, 1),
      500,
    );
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(tasks.projectId, req.params.projectId as string)];
    if (req.query.status) conditions.push(eq(tasks.status, req.query.status as string));
    if (req.query.priority) conditions.push(eq(tasks.priority, req.query.priority as string));
    if (req.query.assignee) conditions.push(eq(tasks.assignedTo, req.query.assignee as string));
    if (req.query.search) {
      const pattern = `%${req.query.search as string}%`;
      conditions.push(
        or(ilike(tasks.title, pattern), ilike(tasks.description, pattern))!,
      );
    }

    const where = and(...conditions);

    const sortBy = (req.query.sortBy as string) || "createdAt";
    const order = (req.query.order as string) || "desc";
    const dir = order === "asc" ? asc : desc;
    const sortColumn =
      sortBy === "title"
        ? tasks.title
        : sortBy === "priority"
          ? sql`CASE ${tasks.priority} WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END`
          : sortBy === "dueDate"
            ? tasks.dueDate
            : tasks.createdAt;

    const [countRow] = await db
      .select({ count: count() })
      .from(tasks)
      .where(where);
    const total = countRow?.count ?? 0;

    const rows = await db
      .select()
      .from(tasks)
      .where(where)
      .orderBy(dir(sortColumn), dir(tasks.id))
      .limit(limit)
      .offset(offset);

    res.json({ tasks: rows, page, limit, total });
  } catch (e) {
    next(e);
  }
});

tasksRouter.post("/", requireMember, async (req, res, next) => {
  try {
    const data = createTaskSchema.parse(req.body);
    await validateAssignee(req.params.projectId as string, data.assignedTo);
    const [task] = await db
      .insert(tasks)
      .values({
        projectId: req.params.projectId as string,
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        createdBy: req.userId!,
        assignedTo: data.assignedTo,
      })
      .returning();
    res.status(201).json({ task });
  } catch (e) {
    next(e);
  }
});

tasksRouter.get("/:taskId", requireMember, async (req, res, next) => {
  try {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, req.params.taskId as string), eq(tasks.projectId, req.params.projectId as string)))
      .limit(1);
    if (!task) throw new AppError(404, "Task not found");
    res.json({ task });
  } catch (e) {
    next(e);
  }
});

tasksRouter.put("/:taskId", requireMember, async (req, res, next) => {
  try {
    const data = updateTaskSchema.parse(req.body);
    await validateAssignee(req.params.projectId as string, data.assignedTo);
    const { dueDate, ...rest } = data;
    const updateData: Partial<typeof tasks.$inferInsert> = { ...rest };
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }
    const [task] = await db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, req.params.taskId as string), eq(tasks.projectId, req.params.projectId as string)))
      .returning();
    res.json({ task });
  } catch (e) {
    next(e);
  }
});

tasksRouter.delete("/:taskId", requireMember, async (req, res, next) => {
  try {
    await db
      .delete(tasks)
      .where(and(eq(tasks.id, req.params.taskId as string), eq(tasks.projectId, req.params.projectId as string)));
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});