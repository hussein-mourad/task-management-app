import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../app";

describe("Auth", () => {
  const testEmail = `test-${Date.now()}@test.com`;
  let token: string;

  it("registers a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, password: "password123", name: "Test User" });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: testEmail, name: "Test User" });
    expect(res.body.token).toBeTruthy();
    token = res.body.token;
  });

  it("rejects duplicate registration", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, password: "password123", name: "Test User" });

    expect(res.status).toBe(409);
  });

  it("logs in with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it("rejects invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("returns current user with valid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
  });

  it("rejects /me without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});