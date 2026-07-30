import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@/db";
import { tasks, projectMembers } from "@/db/schema";
import { createTaskSchema, updateTaskSchema } from "./tasks.validator";
import { requireAuth } from "@/features/auth/auth.middleware";
import { AppError } from "@/middleware/errors";
import { eq, and } from "drizzle-orm";

export const tasksRouter = Router({ mergeParams: true });

tasksRouter.use(requireAuth);

async function requireMember(req: Request, _res: Response, next: NextFunction) {
  try {
    const [member] = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, req.params.projectId), eq(projectMembers.userId, req.userId!)))
      .limit(1);
    if (!member) throw new AppError(403, "Not a project member");
    next();
  } catch (e) {
    next(e);
  }
}

tasksRouter.get("/", requireMember, async (req, res, next) => {
  try {
    const conditions: any[] = [eq(tasks.projectId, req.params.projectId)];
    if (req.query.status) conditions.push(eq(tasks.status, req.query.status as string));
    if (req.query.priority) conditions.push(eq(tasks.priority, req.query.priority as string));
    if (req.query.assignee) conditions.push(eq(tasks.assignedTo, req.query.assignee as string));

    const rows = await db.select().from(tasks).where(and(...conditions));
    res.json({ tasks: rows });
  } catch (e) {
    next(e);
  }
});

tasksRouter.post("/", requireMember, async (req, res, next) => {
  try {
    const data = createTaskSchema.parse(req.body);
    const [task] = await db
      .insert(tasks)
      .values({
        projectId: req.params.projectId,
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
      .where(and(eq(tasks.id, req.params.taskId), eq(tasks.projectId, req.params.projectId)))
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
    const updateData: any = { ...data };
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    const [task] = await db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, req.params.taskId), eq(tasks.projectId, req.params.projectId)))
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
      .where(and(eq(tasks.id, req.params.taskId), eq(tasks.projectId, req.params.projectId)));
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});