import express from "express";
import cors from "cors";
import { env } from "@/lib/env";
import { errorHandler } from "@/middleware/errors";
import { authRouter } from "@/features/auth/auth.routes";
import { projectsRouter } from "@/features/projects/projects.routes";
import { tasksRouter } from "@/features/tasks/tasks.routes";
import { usersRouter } from "@/features/users/users.routes";

export const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/users", usersRouter);
app.use("/api/projects/:projectId/tasks", tasksRouter);

app.use(errorHandler);