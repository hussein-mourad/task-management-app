import api from "@/lib/api";

type User = {
	id: string;
	name: string;
	email: string;
};

type Member = User & {
	role: string;
};

export async function getUsers() {
	const { data } = await api.get<{ users: User[] }>("/api/users");
	return data;
}

export async function getProjectMembers(projectId: string) {
	const { data } = await api.get<{ members: Member[] }>(
		`/api/projects/${projectId}/members`,
	);
	return data;
}
