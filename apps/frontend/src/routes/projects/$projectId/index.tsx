import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { TaskBoard } from "@/features/tasks/task-board";

function ProjectDetail() {
	const { projectId } = Route.useParams();
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !user) navigate({ to: "/login" });
	}, [user, isLoading, navigate]);

	if (!user) return null;

	return <TaskBoard projectId={projectId} />;
}

export const Route = createFileRoute("/projects/$projectId/")({
	component: ProjectDetail,
});
