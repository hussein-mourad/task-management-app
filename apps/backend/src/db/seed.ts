import { faker } from "@faker-js/faker";
import { db } from ".";
import { users, projects, projectMembers, tasks } from "./schema";
import { hashPassword } from "@/features/auth/auth.service";

// Seed configuration
const PROJECTS_PER_USER = 15;
const TASKS_PER_PROJECT = 15;
const BATCH_SIZE = 500;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d;
}

const statuses = ["todo", "in_progress", "done"] as const;
const priorities = ["low", "medium", "high", "critical"] as const;

async function seed() {
  const passwordHash = await hashPassword("password123");

  console.log("Clearing existing data...");
  await db.delete(tasks);
  await db.delete(projectMembers);
  await db.delete(projects);
  await db.delete(users);

  const userData = [
    { email: "admin@test.com", name: "Admin User", role: "admin" as const },
    { email: "alice@test.com", name: "Alice Johnson", role: "member" as const },
    { email: "bob@test.com", name: "Bob Martinez", role: "member" as const },
  ];
  console.log(`Creating ${userData.length} users...`);

  const createdUsers = await db
    .insert(users)
    .values(
      userData.map((u) => ({
        email: u.email,
        passwordHash,
        name: u.name,
        role: u.role,
      })),
    )
    .returning();

  console.log(`  ✓ ${createdUsers.length} users created`);

  console.log(
    `Creating ${createdUsers.length * PROJECTS_PER_USER} projects (${PROJECTS_PER_USER} per user)...`,
  );
  const projectValues = [];
  const memberValues: { projectId: string; userId: string; role: string }[] =
    [];

  for (const user of createdUsers) {
    for (let i = 0; i < PROJECTS_PER_USER; i++) {
      projectValues.push({
        name: `${faker.company.buzzNoun()} ${faker.company.buzzVerb()} ${faker.company.buzzAdjective()}`,
        description: faker.company.catchPhrase(),
        createdBy: user.id,
      });
    }
  }

  const createdProjects = await db
    .insert(projects)
    .values(projectValues)
    .returning();
  console.log(`  ✓ ${createdProjects.length} projects created`);

  let projectIdx = 0;
  for (const user of createdUsers) {
    const otherUsers = createdUsers.filter((u) => u.id !== user.id);

    for (let i = 0; i < PROJECTS_PER_USER; i++) {
      const project = createdProjects[projectIdx]!;
      memberValues.push({
        projectId: project.id,
        userId: user.id,
        role: "admin",
      });
      for (const other of otherUsers) {
        memberValues.push({
          projectId: project.id,
          userId: other.id,
          role: "member",
        });
      }
      projectIdx++;
    }
  }

  await db.insert(projectMembers).values(memberValues);
  console.log(`  ✓ ${memberValues.length} memberships created`);

  console.log(
    `Creating ${createdProjects.length * TASKS_PER_PROJECT} tasks (${TASKS_PER_PROJECT} per project)...`,
  );
  const taskValues: (typeof tasks.$inferInsert)[] = [];

  const taskTemplates = [
    () => `Implement ${faker.hacker.verb()} for ${faker.hacker.noun()}`,
    () =>
      `Review ${faker.hacker.adjective()} ${faker.hacker.noun()} integration`,
    () =>
      `Fix ${faker.hacker.adjective()} ${faker.hacker.noun()} issue in ${faker.hacker.verb()} module`,
    () =>
      `Refactor ${faker.hacker.noun()} to support ${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    () => `Add ${faker.hacker.verb()} functionality to ${faker.hacker.noun()}`,
    () => `Write tests for ${faker.hacker.noun()} ${faker.hacker.verb()}`,
    () => `Optimize ${faker.hacker.noun()} query performance`,
    () => `Document ${faker.hacker.adjective()} ${faker.hacker.noun()} API`,
    () => `Migrate ${faker.hacker.noun()} to ${faker.hacker.adjective()} stack`,
    () => `Update ${faker.hacker.noun()} dependency to latest version`,
  ];

  const descriptionTemplates = [
    () =>
      `As a user, I want to ${faker.hacker.verb()} the ${faker.hacker.noun()} so that I can ${faker.hacker.verb()} more efficiently. The current approach using ${faker.hacker.adjective()} patterns is not ${faker.hacker.adjective()} enough.`,
    () =>
      `This involves updating the ${faker.hacker.noun()} layer to handle ${faker.hacker.adjective()} edge cases. Need to ensure ${faker.hacker.noun()} compatibility with existing ${faker.hacker.noun()} interfaces.`,
    () =>
      `After investigating the ${faker.hacker.noun()} performance, we found that the ${faker.hacker.adjective()} bottleneck is in the ${faker.hacker.verb()} routine. Moving to a ${faker.hacker.adjective()} approach should resolve the issue.`,
    () =>
      `This task covers: (1) ${faker.hacker.verb()} the ${faker.hacker.noun()}, (2) adding ${faker.hacker.noun()} support, and (3) validating against ${faker.hacker.adjective()} scenarios.`,
    () =>
      `Required for the upcoming ${faker.hacker.adjective()} release. The ${faker.hacker.noun()} team has requested ${faker.hacker.verb()} capabilities to be added before the ${faker.hacker.adjective()} deadline.`,
  ];

  const assignees = createdUsers.map((u) => u.id);
  for (const project of createdProjects) {
    const creator = pick(createdUsers);

    for (let i = 0; i < TASKS_PER_PROJECT; i++) {
      const status = (() => {
        const r = Math.random();
        if (r < 0.4) return statuses[0];
        if (r < 0.75) return statuses[1];
        return statuses[2];
      })();

      taskValues.push({
        projectId: project.id,
        title: pick(taskTemplates)(),
        description: Math.random() > 0.2 ? pick(descriptionTemplates)() : null,
        status,
        priority: pick(priorities),
        dueDate: Math.random() > 0.3 ? randomDate(30) : null,
        createdBy: creator.id,
        assignedTo: Math.random() > 0.15 ? pick(assignees) : null,
      });
    }
  }

  for (let i = 0; i < taskValues.length; i += BATCH_SIZE) {
    const batch = taskValues.slice(i, i + BATCH_SIZE);
    await db.insert(tasks).values(batch);
    if ((i / BATCH_SIZE) % 5 === 0) {
      process.stdout.write(
        `  ${Math.min(i + BATCH_SIZE, taskValues.length)}/${taskValues.length} tasks...\r`,
      );
    }
  }
  console.log(`  ✓ ${taskValues.length} tasks created`);

  console.log("\nSeed complete! Credentials: all users use password123");
  for (const u of createdUsers) {
    console.log(`  ${u.email} (${u.role})`);
  }
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
