import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@/db";
import { projects, projectMembers, tasks, users } from "@/db/schema";
import { createProjectSchema, updateProjectSchema, addMemberSchema } from "./projects.validator";
import { requireAuth } from "@/features/auth/auth.middleware";
import { AppError } from "@/middleware/errors";
import { eq, and, inArray, count, desc } from "drizzle-orm";

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string, 10) || 20, 1),
      100,
    );
    const offset = (page - 1) * limit;

    const memberProjectIds = db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, req.userId!));

    const where = inArray(projects.id, memberProjectIds);

    const [countRow] = await db
      .select({ count: count() })
      .from(projects)
      .where(where);
    const total = countRow?.count ?? 0;

    const rows = await db
      .select()
      .from(projects)
      .where(where)
      .orderBy(desc(projects.createdAt), desc(projects.id))
      .limit(limit)
      .offset(offset);

    res.json({ projects: rows, page, limit, total });
  } catch (e) {
    next(e);
  }
});

projectsRouter.post("/", async (req, res, next) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const [project] = await db.insert(projects).values({ name: data.name, description: data.description, createdBy: req.userId! }).returning();
    await db.insert(projectMembers).values({ projectId: project!.id, userId: req.userId!, role: "admin" });
    res.status(201).json({ project });
  } catch (e) {
    next(e);
  }
});

async function requireProjectAccess(req: Request, _res: Response, next: NextFunction) {
  try {
    const [member] = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, req.params.id as string), eq(projectMembers.userId, req.userId!)))
      .limit(1);
    if (!member) throw new AppError(403, "Not a project member");
    req.memberRole = member.role;
    next();
  } catch (e) {
    next(e);
  }
}

async function requireProjectAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const [member] = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, req.params.id as string), eq(projectMembers.userId, req.userId!)))
      .limit(1);
    if (!member || member.role !== "admin") throw new AppError(403, "Project admin required");
    next();
  } catch (e) {
    next(e);
  }
}

projectsRouter.get("/:id", requireProjectAccess, async (req, res, next) => {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id as string)).limit(1);
    if (!project) throw new AppError(404, "Project not found");
    res.json({ project });
  } catch (e) {
    next(e);
  }
});

projectsRouter.get("/:id/members", requireProjectAccess, async (req, res, next) => {
  try {
    const rows = await db
      .select({ id: users.id, name: users.name, email: users.email, role: projectMembers.role })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, req.params.id as string));
    res.json({ members: rows });
  } catch (e) {
    next(e);
  }
});

projectsRouter.put("/:id", requireProjectAdmin, async (req, res, next) => {
  try {
    const data = updateProjectSchema.parse(req.body);
    const [project] = await db.update(projects).set(data).where(eq(projects.id, req.params.id as string)).returning();
    res.json({ project });
  } catch (e) {
    next(e);
  }
});

projectsRouter.delete("/:id", requireProjectAdmin, async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    await db.delete(projectMembers).where(eq(projectMembers.projectId, projectId));
    await db.delete(tasks).where(eq(tasks.projectId, projectId));
    await db.delete(projects).where(eq(projects.id, projectId));
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

projectsRouter.post("/:id/members", requireProjectAdmin, async (req, res, next) => {
  try {
    const data = addMemberSchema.parse(req.body);
    const projectId = req.params.id as string;
    const [existing] = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, data.userId)))
      .limit(1);
    if (existing) throw new AppError(409, "User is already a member of this project");
    await db.insert(projectMembers).values({ projectId, userId: data.userId });
    res.status(201).json({ message: "Member added" });
  } catch (e) {
    next(e);
  }
});

projectsRouter.delete("/:id/members/:userId", requireProjectAdmin, async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const userId = req.params.userId as string;
    const admins = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.role, "admin")));
    if (admins.length <= 1 && admins.some((a) => a.userId === userId)) {
      throw new AppError(400, "Cannot remove the last admin from the project");
    }
    await db
      .delete(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});