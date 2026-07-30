import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { DeleteProjectDialog } from "@/features/projects/components/delete-project-dialog";
import { EditProjectDialog } from "@/features/projects/components/edit-project-dialog";
import { useDeleteProject, useProject } from "@/features/projects/hooks";
import { TaskBoard } from "@/features/tasks/task-board";
import { useProjectMembers } from "@/features/users/hooks";

function ProjectDetail() {
	const { projectId } = Route.useParams();
	const { user, isLoading: authLoading } = useAuth();
	const navigate = useNavigate();
	const { data: project, isLoading: projectLoading } = useProject(projectId);
	const { data: members } = useProjectMembers(projectId);
	const deleteMutation = useDeleteProject(projectId);

	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	useEffect(() => {
		if (!authLoading && !user) navigate({ to: "/login" });
	}, [user, authLoading, navigate]);

	if (!user) return null;
	if (projectLoading)
		return <div className="p-8 text-muted-foreground">Loading...</div>;
	if (!project)
		return <div className="p-8 text-destructive">Project not found</div>;

	const currentMember = members?.find((m) => m.id === user.id);
	const isAdmin = currentMember?.role === "admin";

	return (
		<div>
			<div className="border-b px-8 py-4">
				<div className="flex items-start justify-between">
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-bold">{project.name}</h1>
							{isAdmin ? (
								<Badge>admin</Badge>
							) : (
								<Badge variant="secondary">member</Badge>
							)}
						</div>
						{project.description && (
							<p className="mt-1 text-muted-foreground">
								{project.description}
							</p>
						)}
					</div>
					{isAdmin && (
						<div className="flex gap-2">
							<Button variant="outline" onClick={() => setEditOpen(true)}>
								Edit
							</Button>
							<Button variant="destructive" onClick={() => setDeleteOpen(true)}>
								Delete
							</Button>
						</div>
					)}
				</div>
				<nav className="mt-3 flex gap-4">
					<Link
						to="/projects/$projectId"
						params={{ projectId }}
						className="text-sm font-medium text-foreground border-b-2 border-foreground pb-1"
					>
						Tasks
					</Link>
					<Link
						to="/projects/$projectId/members"
						params={{ projectId }}
						className="text-sm font-medium text-muted-foreground hover:text-foreground pb-1"
					>
						Members
					</Link>
				</nav>
			</div>
			<TaskBoard projectId={projectId} />

			<EditProjectDialog
				project={project}
				open={editOpen}
				onOpenChange={setEditOpen}
			/>
			<DeleteProjectDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				onConfirm={() =>
					deleteMutation.mutate(undefined, {
						onSuccess: () => navigate({ to: "/projects" }),
					})
				}
				isPending={deleteMutation.isPending}
			/>
		</div>
	);
}

export const Route = createFileRoute("/projects/$projectId/")({
	component: ProjectDetail,
});
