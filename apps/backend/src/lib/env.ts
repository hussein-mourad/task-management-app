import z from "zod";

export const envSchema = z.object({
  // General
  PORT: z.string().optional().default("8000"),
  BASE_URL: z.string().optional(),

  // Database
  DATABASE_URL: z.string(),

  // Frontend
  FRONTEND_URL: z.string(),
});

export function validateEnv(config: Record<string, any>) {
  try {
    const result = envSchema.parse(config);
    return result;
  } catch (error) {
    const issues = (error as z.ZodError).issues.map((issue) => {
      return `Field: ${issue.path.join(".")} - ${issue.message}`;
    });
    throw new Error(`Env validation error: \n${issues.join("\n")}`);
  }
}

const env = validateEnv(process.env);

export type Env = z.infer<typeof envSchema>;
export type EnvKeys = keyof Env;

export default env;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env { }
  }
}
