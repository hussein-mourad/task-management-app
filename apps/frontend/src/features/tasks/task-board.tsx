import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";

type Task = {
	id: string;
	title: string;
	description: string | null;
	status: string;
	priority: string;
	dueDate: string | null;
	createdBy: string;
	assignedTo: string | null;
};

type Project = {
	id: string;
	name: string;
	description: string | null;
};

export function TaskBoard({ projectId }: { projectId: string }) {
	const [project, setProject] = useState<Project | null>(null);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [showForm, setShowForm] = useState(false);
	const [filter, setFilter] = useState({
		status: "",
		priority: "",
		assignee: "",
	});
	const { token, logout } = useAuth();
	const navigate = useNavigate();

	const fetchData = useCallback(async () => {
		const headers = { Authorization: `Bearer ${token}` };
		setLoading(true);
		try {
			const [projectRes, tasksRes] = await Promise.all([
				fetch(`http://localhost:8000/api/projects/${projectId}`, { headers }),
				fetch(
					`http://localhost:8000/api/projects/${projectId}/tasks?${new URLSearchParams(filter)}`,
					{ headers },
				),
			]);
			if (projectRes.status === 401) {
				logout();
				navigate({ to: "/login" });
				return;
			}
			const pData = await projectRes.json();
			const tData = await tasksRes.json();
			setProject(pData.project);
			setTasks(tData.tasks);
		} catch {
			setError("Failed to load project");
		} finally {
			setLoading(false);
		}
	}, [projectId, filter, token, logout, navigate]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
	if (error) return <div className="p-8 text-red-600">{error}</div>;
	if (!project)
		return <div className="p-8 text-red-600">Project not found</div>;

	const columns = ["todo", "in_progress", "done"];
	const columnLabels: Record<string, string> = {
		todo: "To Do",
		in_progress: "In Progress",
		done: "Done",
	};

	return (
		<div className="p-8">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">{project.name}</h1>
					{project.description && (
						<p className="text-gray-600">{project.description}</p>
					)}
				</div>
				<button
					type="button"
					onClick={() => setShowForm(true)}
					className="rounded bg-blue-600 px-4 py-2 text-white"
				>
					New Task
				</button>
			</div>

			<div className="mb-4 flex gap-2">
				<select
					className="rounded border px-2 py-1 text-sm"
					value={filter.status}
					onChange={(e) => setFilter({ ...filter, status: e.target.value })}
				>
					<option value="">All statuses</option>
					<option value="todo">To Do</option>
					<option value="in_progress">In Progress</option>
					<option value="done">Done</option>
				</select>
				<select
					className="rounded border px-2 py-1 text-sm"
					value={filter.priority}
					onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
				>
					<option value="">All priorities</option>
					<option value="low">Low</option>
					<option value="medium">Medium</option>
					<option value="high">High</option>
					<option value="critical">Critical</option>
				</select>
			</div>

			{showForm && (
				<TaskForm
					projectId={projectId}
					onClose={() => setShowForm(false)}
					onCreated={() => {
						setShowForm(false);
						fetchData();
					}}
				/>
			)}

			{tasks.length === 0 ? (
				<div className="rounded-lg border border-dashed p-12 text-center text-gray-500">
					No tasks yet
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-3">
					{columns.map((col) => (
						<div key={col} className="rounded-lg border bg-gray-50 p-4">
							<h2 className="mb-3 font-semibold text-gray-700">
								{columnLabels[col]}
							</h2>
							<div className="space-y-2">
								{tasks
									.filter((t) => t.status === col)
									.map((task) => (
										<TaskCard key={task.id} task={task} />
									))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function TaskCard({ task }: { task: Task }) {
	const priorityColors: Record<string, string> = {
		low: "bg-gray-200",
		medium: "bg-blue-200",
		high: "bg-orange-200",
		critical: "bg-red-200",
	};

	return (
		<div className="rounded border bg-white p-3 shadow-sm">
			<h3 className="font-medium">{task.title}</h3>
			{task.description && (
				<p className="mt-1 text-xs text-gray-600">{task.description}</p>
			)}
			<div className="mt-2 flex items-center gap-2">
				<span
					className={`rounded px-2 py-0.5 text-xs ${priorityColors[task.priority] || "bg-gray-200"}`}
				>
					{task.priority}
				</span>
				{task.dueDate && (
					<span className="text-xs text-gray-500">
						{new Date(task.dueDate).toLocaleDateString()}
					</span>
				)}
			</div>
		</div>
	);
}

function TaskForm({
	projectId,
	onClose,
	onCreated,
}: {
	projectId: string;
	onClose: () => void;
	onCreated: () => void;
}) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState("medium");
	const [dueDate, setDueDate] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const { token } = useAuth();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!title.trim()) {
			setError("Title is required");
			return;
		}
		setError("");
		setSubmitting(true);
		try {
			const body: Record<string, unknown> = { title, priority };
			if (description.trim()) body.description = description;
			if (dueDate) body.dueDate = new Date(dueDate).toISOString();
			const res = await fetch(
				`http://localhost:8000/api/projects/${projectId}/tasks`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(body),
				},
			);
			if (!res.ok) throw new Error("Failed to create task");
			onCreated();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create task");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="mb-6 space-y-3 rounded-lg border p-4"
		>
			<h2 className="font-semibold">New Task</h2>
			{error && <p className="text-sm text-red-600">{error}</p>}
			<input
				className="w-full rounded border px-3 py-2"
				placeholder="Task title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				required
			/>
			<textarea
				className="w-full rounded border px-3 py-2"
				placeholder="Description (optional)"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
			/>
			<div className="flex gap-2">
				<select
					className="rounded border px-3 py-2"
					value={priority}
					onChange={(e) => setPriority(e.target.value)}
				>
					<option value="low">Low</option>
					<option value="medium">Medium</option>
					<option value="high">High</option>
					<option value="critical">Critical</option>
				</select>
				<input
					className="rounded border px-3 py-2"
					type="date"
					value={dueDate}
					onChange={(e) => setDueDate(e.target.value)}
				/>
			</div>
			<div className="flex gap-2">
				<button
					type="submit"
					className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
					disabled={submitting}
				>
					Create
				</button>
				<button
					type="button"
					onClick={onClose}
					className="rounded border px-4 py-2"
				>
					Cancel
				</button>
			</div>
		</form>
	);
}
