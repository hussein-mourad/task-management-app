import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAuth } from "@/features/auth/auth.middleware";

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users);
    res.json({ users: rows });
  } catch (e) {
    next(e);
  }
});
