import { z } from "zod";

export const envSchema = z.object({
	VITE_BACKEND_URL: z.string().url().default("http://localhost:8000"),
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

export const env = validateEnv(import.meta.env);

export type Env = z.infer<typeof envSchema>;

declare global {
	interface ImportMetaEnv extends Env {}
}
