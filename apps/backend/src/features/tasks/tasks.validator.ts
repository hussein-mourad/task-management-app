import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { tasks } from "@/db/schema";

export const createTaskSchema = createInsertSchema(tasks, {
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.string().optional(),
}).omit({
  id: true,
  projectId: true,
  status: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTaskSchema = createInsertSchema(tasks, {
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  dueDate: z.string().datetime().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
}).omit({
  id: true,
  projectId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
}).partial();
