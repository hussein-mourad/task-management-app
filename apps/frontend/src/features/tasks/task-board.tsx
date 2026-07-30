import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
			const params = new URLSearchParams();
			if (filter.status) params.set("status", filter.status);
			if (filter.priority) params.set("priority", filter.priority);
			if (filter.assignee) params.set("assignee", filter.assignee);

			const [projectRes, tasksRes] = await Promise.all([
				fetch(`http://localhost:8000/api/projects/${projectId}`, { headers }),
				fetch(
					`http://localhost:8000/api/projects/${projectId}/tasks?${params}`,
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

	if (loading)
		return <div className="p-8 text-muted-foreground">Loading...</div>;
	if (error) return <div className="p-8 text-destructive">{error}</div>;
	if (!project)
		return <div className="p-8 text-destructive">Project not found</div>;

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
						<p className="text-muted-foreground">{project.description}</p>
					)}
				</div>
				<Button onClick={() => setShowForm(true)}>New Task</Button>
			</div>

			<div className="mb-4 flex gap-2">
				<Select
					value={filter.status}
					onValueChange={(value) => setFilter({ ...filter, status: value })}
				>
					<SelectTrigger className="w-[150px]">
						<SelectValue placeholder="All statuses" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All statuses</SelectItem>
						<SelectItem value="todo">To Do</SelectItem>
						<SelectItem value="in_progress">In Progress</SelectItem>
						<SelectItem value="done">Done</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={filter.priority}
					onValueChange={(value) => setFilter({ ...filter, priority: value })}
				>
					<SelectTrigger className="w-[150px]">
						<SelectValue placeholder="All priorities" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All priorities</SelectItem>
						<SelectItem value="low">Low</SelectItem>
						<SelectItem value="medium">Medium</SelectItem>
						<SelectItem value="high">High</SelectItem>
						<SelectItem value="critical">Critical</SelectItem>
					</SelectContent>
				</Select>
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
				<div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
					No tasks yet
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-3">
					{columns.map((col) => (
						<div key={col} className="rounded-lg border bg-muted/50 p-4">
							<h2 className="mb-3 font-semibold text-muted-foreground">
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
	const priorityVariants: Record<
		string,
		"default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
	> = {
		low: "secondary",
		medium: "outline",
		high: "default",
		critical: "destructive",
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{task.title}</CardTitle>
			</CardHeader>
			<CardContent>
				{task.description && (
					<p className="mb-2 text-xs text-muted-foreground">
						{task.description}
					</p>
				)}
				<div className="flex items-center gap-2">
					<Badge variant={priorityVariants[task.priority] || "secondary"}>
						{task.priority}
					</Badge>
					{task.dueDate && (
						<span className="text-xs text-muted-foreground">
							{new Date(task.dueDate).toLocaleDateString()}
						</span>
					)}
				</div>
			</CardContent>
		</Card>
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
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>New Task</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-3">
					{error && <p className="text-sm text-destructive">{error}</p>}
					<div className="space-y-1">
						<Label htmlFor="task-title">Task title</Label>
						<Input
							id="task-title"
							placeholder="Task title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="task-desc">Description (optional)</Label>
						<textarea
							id="task-desc"
							className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Description (optional)"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					<Select value={priority} onValueChange={setPriority}>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="low">Low</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="high">High</SelectItem>
							<SelectItem value="critical">Critical</SelectItem>
						</SelectContent>
					</Select>
					<Input
						type="date"
						value={dueDate}
						onChange={(e) => setDueDate(e.target.value)}
					/>
					<div className="flex gap-2">
						<Button type="submit" disabled={submitting}>
							{submitting ? "Creating..." : "Create"}
						</Button>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
