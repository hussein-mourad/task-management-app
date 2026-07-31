import express, { type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "@/lib/env";
import { errorHandler } from "@/middleware/errors";
import { authRouter } from "@/features/auth/auth.routes";
import { projectsRouter } from "@/features/projects/projects.routes";
import { tasksRouter } from "@/features/tasks/tasks.routes";
import { usersRouter } from "@/features/users/users.routes";
import { swaggerSpec } from "@/docs/swagger";

export const app = express();

app.use(helmet() as any);
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }) as any);
app.use(morgan("dev") as any);
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/users", usersRouter);
app.use("/api/projects/:projectId/tasks", tasksRouter);

app.get("/api-docs/openapi.json", (_req, res) => {
  res.json(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_, res: Response) => {
  res.send("ok");
});

app.use(errorHandler);
