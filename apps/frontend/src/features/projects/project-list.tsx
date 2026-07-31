import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import { useProjects } from "@/features/projects/hooks";

type Project = {
	id: string;
	name: string;
	description: string | null;
	createdBy: string;
};

const PAGE_SIZE = 12;

export function ProjectList() {
	const [page, setPage] = useState(1);
	const [dialogOpen, setDialogOpen] = useState(false);
	const { data, isLoading, error } = useProjects(page, PAGE_SIZE);
	const projects = data?.projects;
	const total = data?.total ?? 0;

	if (isLoading)
		return <div className="p-8 text-muted-foreground">Loading projects...</div>;
	if (error)
		return <div className="p-8 text-destructive">Failed to load projects</div>;

	return (
		<div className="p-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">Projects</h1>
				<Button onClick={() => setDialogOpen(true)}>New Project</Button>
			</div>
			<CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
			{!projects || projects.length === 0 ? (
				<EmptyState message="No projects yet. Create your first project!" />
			) : (
				<>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{projects.map((p) => (
							<ProjectCard key={p.id} project={p} />
						))}
					</div>
					<div className="mt-6">
						<Pagination
							page={page}
							total={total}
							pageSize={PAGE_SIZE}
							onPageChange={setPage}
						/>
					</div>
				</>
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

function EmptyState({ message }: { message: string }): ReactNode {
	return (
		<div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
			{message}
		</div>
	);
}
