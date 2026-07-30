import api from "@/lib/api";

type Project = {
	id: string;
	name: string;
	description: string | null;
	createdBy: string;
};

export async function listProjects() {
	const { data } = await api.get<{ projects: Project[] }>("/api/projects");
	return data;
}

export async function getProject(id: string) {
	const { data } = await api.get<{ project: Project }>(`/api/projects/${id}`);
	return data;
}

export async function createProject(name: string, description?: string) {
	const { data } = await api.post<{ project: Project }>("/api/projects", {
		name,
		description,
	});
	return data;
}

export async function updateProject(
	id: string,
	fields: Partial<Pick<Project, "name" | "description">>,
) {
	const { data } = await api.put<{ project: Project }>(
		`/api/projects/${id}`,
		fields,
	);
	return data;
}

export async function deleteProject(id: string) {
	await api.delete(`/api/projects/${id}`);
}

export async function addMember(projectId: string, userId: string) {
	const { data } = await api.post<{ message: string }>(
		`/api/projects/${projectId}/members`,
		{ userId },
	);
	return data;
}

export async function removeMember(projectId: string, userId: string) {
	await api.delete(`/api/projects/${projectId}/members/${userId}`);
}
