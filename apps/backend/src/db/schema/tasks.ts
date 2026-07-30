import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./auth";
import { projects } from "./projects";

export const tasks = pgTable("tasks", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text().notNull(),
  description: text(),
  status: text().notNull().default("todo"),
  priority: text().notNull().default("medium"),
  dueDate: timestamp("due_date"),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  assignedTo: text("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
