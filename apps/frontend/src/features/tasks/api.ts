import api from "@/lib/api";

type Task = {
	id: string;
	projectId: string;
	title: string;
	description: string | null;
	status: string;
	priority: string;
	dueDate: string | null;
	createdBy: string;
	assignedTo: string | null;
};

type TaskFilters = {
	status?: string;
	priority?: string;
	assignee?: string;
	page?: number;
	limit?: number;
};

export async function listTasks(projectId: string, filters?: TaskFilters) {
	const params = new URLSearchParams();
	if (filters?.status) params.set("status", filters.status);
	if (filters?.priority) params.set("priority", filters.priority);
	if (filters?.assignee) params.set("assignee", filters.assignee);
	if (filters?.page) params.set("page", String(filters.page));
	if (filters?.limit) params.set("limit", String(filters.limit));
	const qs = params.toString();
	const path = `/api/projects/${projectId}/tasks${qs ? `?${qs}` : ""}`;
	const { data } = await api.get<{
		tasks: Task[];
		page: number;
		limit: number;
		total: number;
	}>(path);
	return data;
}

export async function getTask(projectId: string, taskId: string) {
	const { data } = await api.get<{ task: Task }>(
		`/api/projects/${projectId}/tasks/${taskId}`,
	);
	return data;
}

export async function createTask(
	projectId: string,
	fields: {
		title: string;
		description?: string;
		priority?: string;
		dueDate?: string | null;
		assignedTo?: string;
	},
) {
	const { data } = await api.post<{ task: Task }>(
		`/api/projects/${projectId}/tasks`,
		fields,
	);
	return data;
}

export async function updateTask(
	projectId: string,
	taskId: string,
	fields: Partial<{
		title: string;
		description: string | null;
		status: string;
		priority: string;
		dueDate: string | null;
		assignedTo: string | null;
	}>,
) {
	const { data } = await api.put<{ task: Task }>(
		`/api/projects/${projectId}/tasks/${taskId}`,
		fields,
	);
	return data;
}

export async function deleteTask(projectId: string, taskId: string) {
	await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
}
