import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const users = pgTable("users", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text().notNull(),
  role: text().notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
