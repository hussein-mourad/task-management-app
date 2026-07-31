import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "@/app";

describe("Projects", () => {
  let adminToken: string;
  let memberToken: string;
  let globalAdminToken: string;
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

    const adminLogin = await request(app).post("/api/auth/login").send({ email: "admin@test.com", password: "password123" });
    globalAdminToken = adminLogin.body.token;
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
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBeGreaterThan(0);
    expect(res.body.total).toBeTypeOf("number");
  });

  it("paginates the project list", async () => {
    const res = await request(app)
      .get("/api/projects?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.projects.length).toBeLessThanOrEqual(5);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
    expect(res.body.total).toBeTypeOf("number");
  });

  it("searches projects by name", async () => {
    await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Alpha Marketing" });
    await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Beta Logistics" });

    const res = await request(app)
      .get("/api/projects?search=Alpha")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.projects.length).toBeGreaterThan(0);
    expect(
      res.body.projects.every((p: any) =>
        p.name.toLowerCase().includes("alpha"),
      ),
    ).toBe(true);
  });

  it("sorts projects by name ascending", async () => {
    const res = await request(app)
      .get("/api/projects?sortBy=name&order=asc")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const names = res.body.projects.map((p: any) => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("hides other members' projects from a member", async () => {
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Private Member Project" });
    expect(created.status).toBe(201);

    const res = await request(app)
      .get("/api/projects?search=Private Member Project")
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.projects).toEqual([]);
  });

  it("shows all projects to a global admin", async () => {
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ name: "Isolated Member Project" });
    const isolatedProjectId = created.body.project.id;

    const res = await request(app)
      .get("/api/projects?search=Isolated Member Project")
      .set("Authorization", `Bearer ${globalAdminToken}`);

    expect(res.status).toBe(200);
    expect(
      res.body.projects.some((p: any) => p.id === isolatedProjectId),
    ).toBe(true);
  });

  it("lets a global admin open a project they are not a member of", async () => {
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ name: "Admin Viewable Project" });
    const foreignProjectId = created.body.project.id;

    const res = await request(app)
      .get(`/api/projects/${foreignProjectId}`)
      .set("Authorization", `Bearer ${globalAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.project.id).toBe(foreignProjectId);
  });

  it("blocks a member from opening a foreign project", async () => {
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Admin Token Project" });
    const foreignProjectId = created.body.project.id;

    const res = await request(app)
      .get(`/api/projects/${foreignProjectId}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });
});