import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config";
import * as authSchema from "../features/auth/auth.schema";
import * as projectsSchema from "../features/projects/projects.schema";
import * as tasksSchema from "../features/tasks/tasks.schema";

const schema = { ...authSchema, ...projectsSchema, ...tasksSchema };

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema });