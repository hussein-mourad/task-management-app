import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "./auth-context";

export function RegisterForm() {
	const [name, setName] = useState("");
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
			const res = await fetch("http://localhost:8000/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password, name }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			login(data.user, data.token);
			navigate({ to: "/projects" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Registration failed");
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
				<h1 className="text-2xl font-bold">Register</h1>
				{error && <p className="text-sm text-red-600">{error}</p>}
				<input
					className="w-full rounded border px-3 py-2"
					placeholder="Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
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
					placeholder="Password (min 8 chars)"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					minLength={8}
				/>
				<button
					type="submit"
					className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
					disabled={loading}
				>
					{loading ? "Registering..." : "Register"}
				</button>
				<p className="text-sm text-gray-600">
					Already have an account?{" "}
					<Link to="/login" className="text-blue-600">
						Login
					</Link>
				</p>
			</form>
		</div>
	);
}
