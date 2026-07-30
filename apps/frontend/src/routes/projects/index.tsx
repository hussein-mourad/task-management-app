import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { ProjectList } from "@/features/projects/project-list";

function ProjectsPage() {
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !user) navigate({ to: "/login" });
	}, [user, isLoading, navigate]);

	if (!user) return null;

	return <ProjectList />;
}

export const Route = createFileRoute("/projects/")({
	component: ProjectsPage,
});
