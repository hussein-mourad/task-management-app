import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";

type Project = {
	id: string;
	name: string;
	description: string | null;
	createdBy: string;
};

export function ProjectList() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [showForm, setShowForm] = useState(false);
	const { token, logout } = useAuth();
	const navigate = useNavigate();

	const fetchProjects = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("http://localhost:8000/api/projects", {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.status === 401) {
				logout();
				navigate({ to: "/login" });
				return;
			}
			const data = await res.json();
			setProjects(data.projects);
		} catch {
			setError("Failed to load projects");
		} finally {
			setLoading(false);
		}
	}, [token, logout, navigate]);

	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	if (loading)
		return <div className="p-8 text-gray-500">Loading projects...</div>;
	if (error) return <div className="p-8 text-red-600">{error}</div>;

	return (
		<div className="p-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">Projects</h1>
				<button
					type="button"
					onClick={() => setShowForm(true)}
					className="rounded bg-blue-600 px-4 py-2 text-white"
				>
					New Project
				</button>
			</div>
			{showForm && (
				<ProjectForm
					onClose={() => setShowForm(false)}
					onCreated={() => {
						setShowForm(false);
						fetchProjects();
					}}
				/>
			)}
			{projects.length === 0 ? (
				<EmptyState message="No projects yet. Create your first project!" />
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{projects.map((p) => (
						<ProjectCard key={p.id} project={p} />
					))}
				</div>
			)}
		</div>
	);
}

function ProjectCard({ project }: { project: Project }) {
	return (
		<Link
			to={`/projects/${project.id}`}
			className="block rounded-lg border p-4 hover:shadow-md"
		>
			<h2 className="text-lg font-semibold">{project.name}</h2>
			{project.description && (
				<p className="mt-1 text-sm text-gray-600">{project.description}</p>
			)}
		</Link>
	);
}

function ProjectForm({
	onClose,
	onCreated,
}: {
	onClose: () => void;
	onCreated: () => void;
}) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const { token } = useAuth();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) {
			setError("Name is required");
			return;
		}
		setError("");
		setSubmitting(true);
		try {
			const res = await fetch("http://localhost:8000/api/projects", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ name, description: description || undefined }),
			});
			if (!res.ok) throw new Error("Failed to create project");
			onCreated();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create project");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="mb-6 space-y-3 rounded-lg border p-4"
		>
			<h2 className="font-semibold">New Project</h2>
			{error && <p className="text-sm text-red-600">{error}</p>}
			<input
				className="w-full rounded border px-3 py-2"
				placeholder="Project name"
				value={name}
				onChange={(e) => setName(e.target.value)}
				required
			/>
			<textarea
				className="w-full rounded border px-3 py-2"
				placeholder="Description (optional)"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
			/>
			<div className="flex gap-2">
				<button
					type="submit"
					className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
					disabled={submitting}
				>
					Create
				</button>
				<button
					type="button"
					onClick={onClose}
					className="rounded border px-4 py-2"
				>
					Cancel
				</button>
			</div>
		</form>
	);
}

function EmptyState({ message }: { message: string }): ReactNode {
	return (
		<div className="rounded-lg border border-dashed p-12 text-center text-gray-500">
			{message}
		</div>
	);
}
