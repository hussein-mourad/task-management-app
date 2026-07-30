import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@/db";
import { projects, projectMembers } from "@/db/schema";
import { createProjectSchema, updateProjectSchema, addMemberSchema } from "./projects.validator";
import { requireAuth } from "@/features/auth/auth.middleware";
import { AppError } from "@/middleware/errors";
import { eq, and, inArray } from "drizzle-orm";

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.get("/", async (req, res, next) => {
  try {
    const memberProjectIds = db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, req.userId!));

    const rows = await db
      .select()
      .from(projects)
      .where(inArray(projects.id, memberProjectIds))
      .orderBy(projects.createdAt);

    res.json({ projects: rows });
  } catch (e) {
    next(e);
  }
});

projectsRouter.post("/", async (req, res, next) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const [project] = await db.insert(projects).values({ name: data.name, description: data.description, createdBy: req.userId! }).returning();
    await db.insert(projectMembers).values({ projectId: project.id, userId: req.userId!, role: "admin" });
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
      .where(and(eq(projectMembers.projectId, req.params.id), eq(projectMembers.userId, req.userId!)))
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
      .where(and(eq(projectMembers.projectId, req.params.id), eq(projectMembers.userId, req.userId!)))
      .limit(1);
    if (!member || member.role !== "admin") throw new AppError(403, "Project admin required");
    next();
  } catch (e) {
    next(e);
  }
}

projectsRouter.get("/:id", requireProjectAccess, async (req, res, next) => {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id)).limit(1);
    if (!project) throw new AppError(404, "Project not found");
    res.json({ project });
  } catch (e) {
    next(e);
  }
});

projectsRouter.put("/:id", requireProjectAdmin, async (req, res, next) => {
  try {
    const data = updateProjectSchema.parse(req.body);
    const [project] = await db.update(projects).set(data).where(eq(projects.id, req.params.id)).returning();
    res.json({ project });
  } catch (e) {
    next(e);
  }
});

projectsRouter.delete("/:id", requireProjectAdmin, async (req, res, next) => {
  try {
    await db.delete(projects).where(eq(projects.id, req.params.id));
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

projectsRouter.post("/:id/members", requireProjectAdmin, async (req, res, next) => {
  try {
    const data = addMemberSchema.parse(req.body);
    await db.insert(projectMembers).values({ projectId: req.params.id, userId: data.userId });
    res.status(201).json({ message: "Member added" });
  } catch (e) {
    next(e);
  }
});

projectsRouter.delete("/:id/members/:userId", requireProjectAdmin, async (req, res, next) => {
  try {
    await db
      .delete(projectMembers)
      .where(and(eq(projectMembers.projectId, req.params.id), eq(projectMembers.userId, req.params.userId)));
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});