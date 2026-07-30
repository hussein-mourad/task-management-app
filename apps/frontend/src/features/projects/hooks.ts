import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	addMember,
	deleteProject,
	getProject,
	listProjects,
	removeMember,
	updateProject,
} from "./api";

export function useProjects() {
	return useQuery({
		queryKey: ["projects"],
		queryFn: () => listProjects().then((d) => d.projects),
	});
}

export function useProject(projectId: string) {
	return useQuery({
		queryKey: ["project", projectId],
		queryFn: () => getProject(projectId).then((d) => d.project),
		enabled: !!projectId,
	});
}

export function useUpdateProject(projectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (fields: { name?: string; description?: string | null }) =>
			updateProject(projectId, fields),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["project", projectId] });
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}

export function useDeleteProject(projectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => deleteProject(projectId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}

export function useAddMember(projectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId: string) => addMember(projectId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["project-members", projectId],
			});
		},
	});
}

export function useRemoveMember(projectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId: string) => removeMember(projectId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["project-members", projectId],
			});
		},
	});
}
