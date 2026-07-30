import z from "zod";

export const envSchema = z.object({
  // General
  PORT: z.coerce.number().default(8000),
  BASE_URL: z.string().optional(),

  // Database
  DATABASE_URL: z.string(),

  // Auth
  JWT_SECRET: z.string().min(32),

  // Frontend
  FRONTEND_URL: z.string().default("http://localhost:3000"),
});

export function validateEnv(config: Record<string, unknown>) {
  try {
    return envSchema.parse(config);
  } catch (error) {
    const issues = (error as z.ZodError).issues.map(
      (issue) => `Field: ${issue.path.join(".")} - ${issue.message}`,
    );
    throw new Error(`Env validation error:\n${issues.join("\n")}`);
  }
}

export const env = validateEnv(process.env);

export type Env = z.infer<typeof envSchema>;
export type EnvKeys = keyof Env;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env { }
  }
}
