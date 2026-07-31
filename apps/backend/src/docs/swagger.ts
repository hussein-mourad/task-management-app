export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Task Management API",
    version: "1.0.0",
    description:
      "REST API for a team task board. Authenticate via JWT and send it as a `Bearer` token. Global admins can access every project (list, view, and modify) even without a project membership; members are restricted to projects they belong to.",
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          role: { type: "string", enum: ["admin", "member"] },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          token: { type: "string" },
        },
      },
      Project: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          createdBy: { type: "string" },
          ownerName: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProjectMembersResponse: {
        type: "object",
        properties: {
          members: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string", format: "email" },
                role: { type: "string", enum: ["admin", "member"] },
              },
            },
          },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "string" },
          projectId: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          status: {
            type: "string",
            enum: ["todo", "in_progress", "done"],
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
          dueDate: { type: "string", format: "date-time", nullable: true },
          createdBy: { type: "string" },
          assignedTo: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Register a new user",
        security: [],
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "409": {
            description: "Email already registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Log in and get a JWT",
        security: [],
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Get the current user",
        tags: ["Auth"],
        responses: {
          "200": {
            description: "Current user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/users": {
      get: {
        summary: "List all users (for adding project members)",
        tags: ["Users"],
        responses: {
          "200": {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    users: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/projects": {
      get: {
        summary: "List projects accessible to the current user",
        tags: ["Projects"],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "sortBy",
            in: "query",
            schema: { type: "string", enum: ["name", "createdAt", "updatedAt"] },
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"] },
          },
        ],
        responses: {
          "200": {
            description: "Paginated projects",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    projects: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Project" },
                    },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    total: { type: "integer" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Create a project",
        tags: ["Projects"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", minLength: 1 },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Project created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    project: { $ref: "#/components/schemas/Project" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/projects/{id}": {
      get: {
        summary: "Get a project",
        tags: ["Projects"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Project",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    project: { $ref: "#/components/schemas/Project" },
                  },
                },
              },
            },
          },
          "403": { description: "Not a project member" },
          "404": { description: "Project not found" },
        },
      },
      put: {
        summary: "Update a project (admin only)",
        tags: ["Projects"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated project",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    project: { $ref: "#/components/schemas/Project" },
                  },
                },
              },
            },
          },
          "403": { description: "Project admin required" },
        },
      },
      delete: {
        summary: "Delete a project and its tasks (admin only)",
        tags: ["Projects"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": { description: "Project deleted" },
          "403": { description: "Project admin required" },
        },
      },
    },
    "/api/projects/{id}/members": {
      get: {
        summary: "List project members",
        tags: ["Projects"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Members",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectMembersResponse" },
              },
            },
          },
        },
      },
      post: {
        summary: "Add a member (admin only)",
        tags: ["Projects"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: { userId: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "201": { description: "Member added" },
          "409": { description: "User is already a member" },
        },
      },
    },
    "/api/projects/{id}/members/{userId}": {
      delete: {
        summary: "Remove a member (admin only)",
        tags: ["Projects"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": { description: "Member removed" },
          "400": { description: "Cannot remove the last admin" },
        },
      },
    },
    "/api/projects/{projectId}/tasks": {
      get: {
        summary: "List tasks in a project",
        tags: ["Tasks"],
        parameters: [
          {
            name: "projectId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 500 },
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["todo", "in_progress", "done"] },
          },
          {
            name: "priority",
            in: "query",
            schema: { type: "string", enum: ["low", "medium", "high", "critical"] },
          },
          { name: "assignee", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["title", "priority", "dueDate", "createdAt"],
            },
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"] },
          },
        ],
        responses: {
          "200": {
            description: "Paginated tasks",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tasks: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Task" },
                    },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    total: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a task",
        tags: ["Tasks"],
        parameters: [
          {
            name: "projectId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", minLength: 1 },
                  description: { type: "string" },
                  priority: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                    default: "medium",
                  },
                  dueDate: { type: "string", format: "date-time" },
                  assignedTo: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Task created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    task: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          "403": { description: "Not a project member" },
        },
      },
    },
    "/api/projects/{projectId}/tasks/{taskId}": {
      get: {
        summary: "Get a task",
        tags: ["Tasks"],
        parameters: [
          {
            name: "projectId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "taskId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Task",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    task: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          "404": { description: "Task not found" },
        },
      },
      put: {
        summary: "Update a task",
        tags: ["Tasks"],
        parameters: [
          {
            name: "projectId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "taskId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string", nullable: true },
                  status: {
                    type: "string",
                    enum: ["todo", "in_progress", "done"],
                  },
                  priority: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                  },
                  dueDate: { type: "string", format: "date-time", nullable: true },
                  assignedTo: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated task",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    task: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete a task",
        tags: ["Tasks"],
        parameters: [
          {
            name: "projectId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "taskId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": { description: "Task deleted" },
        },
      },
    },
  },
};
