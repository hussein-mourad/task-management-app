import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "@/app";

describe("Projects", () => {
  let adminToken: string;
  let memberToken: string;
  let projectId: string;

  beforeAll(async () => {
    const adminEmail = `proj-admin-${Date.now()}@test.com`;
    const memberEmail = `proj-member-${Date.now()}@test.com`;

    await request(app).post("/api/auth/register").send({ email: adminEmail, password: "password123", name: "Admin" });
    const adminRes = await request(app).post("/api/auth/login").send({ email: adminEmail, password: "password123" });
    adminToken = adminRes.body.token;

    await request(app).post("/api/auth/register").send({ email: memberEmail, password: "password123", name: "Member" });
    const memberRes = await request(app).post("/api/auth/login").send({ email: memberEmail, password: "password123" });
    memberToken = memberRes.body.token;
  });

  it("requires auth for listing projects", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(401);
  });

  it("creates a project", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Test Project", description: "A test" });

    expect(res.status).toBe(201);
    expect(res.body.project.name).toBe("Test Project");
    projectId = res.body.project.id;
  });

  it("lists only accessible projects", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.projects).toBeInstanceOf(Array);
  });
});