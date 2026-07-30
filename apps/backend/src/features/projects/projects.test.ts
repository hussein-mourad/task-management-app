import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../app";

describe("Projects", () => {
  let adminToken: string;
  let memberToken: string;
  let projectId: string;

  it("requires auth for listing projects", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(401);
  });

  it("creates a project", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "admin123" });
    adminToken = login.body.token;

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Test Project", description: "A test" });

    expect(res.status).toBe(201);
    expect(res.body.project.name).toBe("Test Project");
    projectId = res.body.project.id;
  });

  it("lists only accessible projects", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "member@test.com", password: "member123" });
    memberToken = login.body.token;

    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.projects).toBeInstanceOf(Array);
  });
});