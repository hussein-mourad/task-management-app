import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "@/app";

describe("API docs", () => {
  it("serves the Swagger UI page", async () => {
    const res = await request(app).get("/api-docs/");

    expect(res.status).toBe(200);
    expect(res.text).toContain("swagger");
  });

  it("serves the OpenAPI JSON spec", async () => {
    const res = await request(app).get("/api-docs/openapi.json");

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.paths["/api/auth/login"]).toBeDefined();
    expect(res.body.paths["/api/projects"]).toBeDefined();
  });
});
