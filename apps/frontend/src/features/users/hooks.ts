import { useQuery } from "@tanstack/react-query";
import { getProjectMembers, getUsers } from "./api";

export function useUsers() {
	return useQuery({
		queryKey: ["users"],
		queryFn: () => getUsers().then((d) => d.users),
	});
}

export function useProjectMembers(projectId: string) {
	return useQuery({
		queryKey: ["project-members", projectId],
		queryFn: () => getProjectMembers(projectId).then((d) => d.members),
		enabled: !!projectId,
	});
}
