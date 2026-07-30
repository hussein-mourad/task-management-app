import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { projects } from "@/db/schema";

export const createProjectSchema = createInsertSchema(projects, {
  name: z.string().min(1),
  description: z.string().optional(),
}).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProjectSchema = createInsertSchema(projects, {
  name: z.string().min(1),
  description: z.string().optional(),
}).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const addMemberSchema = z.object({
  userId: z.string(),
});
