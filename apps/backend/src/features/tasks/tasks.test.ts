import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "@/app";

describe("Tasks", () => {
  let token: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "password123" });
    token = login.body.token;
  });

  it("creates a task", async () => {
    const project = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Task Test Project" });
    projectId = project.body.project.id;

    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Task", priority: "high" });

    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe("Test Task");
    taskId = res.body.task.id;
  });

  it("filters tasks by status", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks?status=todo`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.every((t: any) => t.status === "todo")).toBe(true);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBeGreaterThan(0);
    expect(res.body.total).toBeTypeOf("number");
  });

  it("rejects non-members", async () => {
    const login = await request(app)
      .post("/api/auth/register")
      .send({ email: `outsider-${Date.now()}@test.com`, password: "password123", name: "Outsider" });
    const outsiderToken = login.body.token;

    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({ title: "Should not work" });

    expect(res.status).toBe(403);
  });

  it("updates a task", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "in_progress" });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe("in_progress");
  });

  it("searches tasks by title", async () => {
    const created = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Handle the zebra migration" });

    expect(created.status).toBe(201);

    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks?search=zebra`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThan(0);
    expect(
      res.body.tasks.every((t: any) =>
        t.title.toLowerCase().includes("zebra"),
      ),
    ).toBe(true);
  });

  it("sorts tasks by priority", async () => {
    await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Critical priority task", priority: "critical" });

    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks?sortBy=priority&order=asc`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const priorities = res.body.tasks.map((t: any) => t.priority);
    const rank = (p: string) =>
      ["critical", "high", "medium", "low"].indexOf(p);
    const sorted = [...priorities].sort((a, b) => rank(a) - rank(b));
    expect(priorities).toEqual(sorted);
  });
});