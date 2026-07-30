import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { FormField, FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogin } from "@/features/auth/hooks";

const loginSchema = z.object({
	email: z.string().email("Invalid email"),
	password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

export function LoginForm() {
	const form = useForm<LoginData>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});
	const loginMutation = useLogin();
	const navigate = useNavigate();

	function onSubmit(data: LoginData) {
		loginMutation.mutate(data, {
			onSuccess: () => navigate({ to: "/projects" }),
		});
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Login</CardTitle>
				</CardHeader>
				<CardContent>
					<FormProvider {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							{loginMutation.error && (
								<p className="text-sm text-destructive">
									{loginMutation.error.message}
								</p>
							)}
							<FormField name="email" label="Email">
								<FormInput
									name="email"
									type="email"
									placeholder="Email"
									required
								/>
							</FormField>
							<FormField name="password" label="Password">
								<FormInput
									name="password"
									type="password"
									placeholder="Password"
									required
								/>
							</FormField>
							<Button
								type="submit"
								className="w-full"
								disabled={loginMutation.isPending}
							>
								{loginMutation.isPending ? "Logging in..." : "Login"}
							</Button>
							<p className="text-center text-sm text-muted-foreground">
								Don't have an account?{" "}
								<Link
									to="/register"
									className="text-primary underline-offset-4 hover:underline"
								>
									Register
								</Link>
							</p>
						</form>
					</FormProvider>
				</CardContent>
			</Card>
		</div>
	);
}
