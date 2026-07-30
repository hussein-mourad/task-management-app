import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "./auth-context";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const res = await fetch("http://localhost:8000/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			login(data.user, data.token);
			navigate({ to: "/projects" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<form
				onSubmit={handleSubmit}
				className="w-full max-w-sm space-y-4 rounded-lg border p-6"
			>
				<h1 className="text-2xl font-bold">Login</h1>
				{error && <p className="text-sm text-red-600">{error}</p>}
				<input
					className="w-full rounded border px-3 py-2"
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<input
					className="w-full rounded border px-3 py-2"
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button
					type="submit"
					className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
					disabled={loading}
				>
					{loading ? "Logging in..." : "Login"}
				</button>
				<p className="text-sm text-gray-600">
					Don't have an account?{" "}
					<Link to="/register" className="text-blue-600">
						Register
					</Link>
				</p>
			</form>
		</div>
	);
}
