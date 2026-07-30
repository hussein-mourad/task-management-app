import api from "@/lib/api";

type User = {
	id: string;
	name: string;
	email: string;
};

export async function getUsers() {
	const { data } = await api.get<{ users: User[] }>("/api/users");
	return data;
}

export async function getProjectMembers(projectId: string) {
	const { data } = await api.get<{ members: User[] }>(
		`/api/projects/${projectId}/members`,
	);
	return data;
}
