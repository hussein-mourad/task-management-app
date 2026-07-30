import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { FormField, FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegister } from "@/features/auth/hooks";

const registerSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.email("Invalid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterData = z.infer<typeof registerSchema>;

export function RegisterForm() {
	const form = useForm<RegisterData>({
		resolver: zodResolver(registerSchema),
		defaultValues: { name: "", email: "", password: "" },
	});
	const registerMutation = useRegister();
	const navigate = useNavigate();

	function onSubmit(data: RegisterData) {
		registerMutation.mutate(data, {
			onSuccess: () => navigate({ to: "/projects" }),
		});
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Register</CardTitle>
				</CardHeader>
				<CardContent>
					<FormProvider {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							{registerMutation.error && (
								<p className="text-sm text-destructive">
									{registerMutation.error.message}
								</p>
							)}
							<FormField name="name" label="Name">
								<FormInput
									name="name"
									placeholder="Your name"
									required
									minLength={2}
								/>
							</FormField>
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
									placeholder="Password (min 8 chars)"
									required
									minLength={8}
								/>
							</FormField>
							<Button
								type="submit"
								className="w-full"
								disabled={registerMutation.isPending}
							>
								{registerMutation.isPending ? "Registering..." : "Register"}
							</Button>
							<p className="text-center text-sm text-muted-foreground">
								Already have an account?{" "}
								<Link
									to="/login"
									className="text-primary underline-offset-4 hover:underline"
								>
									Login
								</Link>
							</p>
						</form>
					</FormProvider>
				</CardContent>
			</Card>
		</div>
	);
}
