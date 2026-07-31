import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { MemberList } from "@/features/projects/components/member-list";
import { useProject } from "@/features/projects/hooks";
import { useProjectMembers } from "@/features/users/hooks";

function ProjectMembersPage() {
	const { projectId } = Route.useParams();
	const { user, isLoading: authLoading } = useAuth();
	const navigate = useNavigate();
	const { data: project, isLoading: projectLoading } = useProject(projectId);
	const { data: members } = useProjectMembers(projectId);

	useEffect(() => {
		if (!authLoading && !user) navigate({ to: "/login" });
	}, [user, authLoading, navigate]);

	if (!user) return null;
	if (projectLoading)
		return <div className="p-8 text-muted-foreground">Loading...</div>;
	if (!project)
		return <div className="p-8 text-destructive">Project not found</div>;

	const currentMember = members?.find((m) => m.id === user.id);
	const isAdmin = user.role === "admin" || currentMember?.role === "admin";

	return (
		<div>
			<div className="border-b px-8 py-4">
				<div className="flex items-start justify-between">
					<div>
						<div className="flex items-center gap-2">
							<Link
								to="/projects/$projectId"
								params={{ projectId }}
								className="text-xl font-bold text-muted-foreground hover:text-foreground"
							>
								{project.name}
							</Link>
							<span className="text-muted-foreground">/</span>
							<h1 className="text-xl font-bold">Members</h1>
						</div>
					</div>
					{isAdmin && (
						<div className="flex gap-2">
							<Link to="/projects/$projectId" params={{ projectId }}>
								<Button variant="outline">Back to Tasks</Button>
							</Link>
						</div>
					)}
				</div>
				{project.description && (
					<p className="text-sm mt-1 text-muted-foreground">
						{project.description}
					</p>
				)}
			</div>
			<div className="p-8">
				<MemberList projectId={projectId} isAdmin={isAdmin} />
			</div>
		</div>
	);
}

export const Route = createFileRoute("/projects/$projectId/members/")({
	component: ProjectMembersPage,
});
