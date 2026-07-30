import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	createProject as apiCreateProject,
	listProjects,
} from "@/features/projects/api";

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

	const fetchProjects = useCallback(async () => {
		setLoading(true);
		try {
			const data = await listProjects();
			setProjects(data.projects);
		} catch {
			setError("Failed to load projects");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	if (loading)
		return <div className="p-8 text-muted-foreground">Loading projects...</div>;
	if (error) return <div className="p-8 text-destructive">{error}</div>;

	return (
		<div className="p-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">Projects</h1>
				<Button onClick={() => setShowForm(true)}>New Project</Button>
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
			to="/projects/$projectId"
			params={{
				projectId: project.id,
			}}
			className="block"
		>
			<Card className="transition-shadow hover:shadow-md">
				<CardHeader>
					<CardTitle>{project.name}</CardTitle>
				</CardHeader>
				{project.description && (
					<CardContent>
						<p className="text-sm text-muted-foreground">
							{project.description}
						</p>
					</CardContent>
				)}
			</Card>
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

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) {
			setError("Name is required");
			return;
		}
		setError("");
		setSubmitting(true);
		try {
			await apiCreateProject(name, description || undefined);
			onCreated();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create project");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>New Project</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-3">
					{error && <p className="text-sm text-destructive">{error}</p>}
					<div className="space-y-1">
						<Label htmlFor="project-name">Project name</Label>
						<Input
							id="project-name"
							placeholder="Project name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="project-desc">Description (optional)</Label>
						<textarea
							id="project-desc"
							className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Description (optional)"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					<div className="flex gap-2">
						<Button type="submit" disabled={submitting}>
							{submitting ? "Creating..." : "Create"}
						</Button>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

function EmptyState({ message }: { message: string }): ReactNode {
	return (
		<div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
			{message}
		</div>
	);
}
