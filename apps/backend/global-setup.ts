import { createId } from "@paralleldrive/cuid2";
import bcrypt from "bcryptjs";
import path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";

export const TEST_DATABASE_URL =
  "postgres://postgres:postgres@localhost:5432/task_app_test";

export default async function globalSetup() {
  const admin = new Client({
    connectionString: "postgres://postgres:postgres@localhost:5432/postgres",
  });
  await admin.connect();
  const exists = await admin.query(
    "SELECT 1 FROM pg_database WHERE datname = 'task_app_test'",
  );
  if (exists.rowCount === 0) {
    await admin.query('CREATE DATABASE "task_app_test"');
  }
  await admin.end();

  const client = new Client({ connectionString: TEST_DATABASE_URL });
  await client.connect();

  await migrate(drizzle(client), {
    migrationsFolder: path.join(__dirname, "src/db/migrations"),
  });

  await client.query(
    "TRUNCATE tasks, project_members, projects, users RESTART IDENTITY CASCADE",
  );

  const passwordHash = await bcrypt.hash("password123", 10);
  const adminId = createId();
  const aliceId = createId();
  const bobId = createId();
  await client.query(
    `INSERT INTO users (id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10), ($11, $12, $13, $14, $15)
     ON CONFLICT (email) DO NOTHING`,
    [
      adminId,
      "admin@test.com",
      passwordHash,
      "Admin User",
      "admin",
      aliceId,
      "alice@test.com",
      passwordHash,
      "Alice Johnson",
      "member",
      bobId,
      "bob@test.com",
      passwordHash,
      "Bob Martinez",
      "member",
    ],
  );

  await client.end();
}
