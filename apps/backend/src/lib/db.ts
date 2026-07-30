import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../config";
import * as authSchema from "../features/auth/auth.schema";
import * as projectsSchema from "../features/projects/projects.schema";
import * as tasksSchema from "../features/tasks/tasks.schema";

const schema = { ...authSchema, ...projectsSchema, ...tasksSchema };

export const db = drizzle(env.DATABASE_URL, { schema });