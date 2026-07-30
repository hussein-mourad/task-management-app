import { db } from ".";
import { users, projects, projectMembers } from "./schema";
import { hashPassword } from "../features/auth/auth.service";

async function seed() {
  const adminHash = await hashPassword("admin123");
  const memberHash = await hashPassword("member123");

  const [admin] = await db
    .insert(users)
    .values({ email: "admin@test.com", passwordHash: adminHash, name: "Admin User", role: "admin" })
    .returning();

  const [member] = await db
    .insert(users)
    .values({ email: "member@test.com", passwordHash: memberHash, name: "Member User", role: "member" })
    .returning();

  const [project] = await db
    .insert(projects)
    .values({ name: "Sample Project", description: "A seeded sample project", createdBy: admin.id })
    .returning();

  await db.insert(projectMembers).values([
    { projectId: project.id, userId: admin.id, role: "admin" },
    { projectId: project.id, userId: member.id, role: "member" },
  ]);

  console.log("Seeded: admin@test.com / admin123, member@test.com / member123");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});