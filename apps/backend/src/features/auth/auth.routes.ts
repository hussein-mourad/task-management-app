import { Router } from "express";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword, signToken } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.validator";
import { requireAuth } from "./auth.middleware";
import { AppError } from "@/middleware/errors";
import { eq } from "drizzle-orm";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (existing.length) throw new AppError(409, "Email already registered");

    const passwordHash = await hashPassword(data.password);
    const [user] = await db
      .insert(users)
      .values({ email: data.email, passwordHash, name: data.name })
      .returning();

    const token = signToken({ userId: user.id, role: user.role });
    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (!user) throw new AppError(401, "Invalid credentials");

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) throw new AppError(401, "Invalid credentials");

    const token = signToken({ userId: user.id, role: user.role });
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (e) {
    next(e);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
    if (!user) throw new AppError(404, "User not found");
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    next(e);
  }
});