import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getProject } from "@/features/projects/api";
import {
	createTask as apiCreateTask,
	deleteTask as apiDeleteTask,
	updateTask as apiUpdateTask,
	listTasks,
} from "@/features/tasks/api";
import { useProjectMembers } from "@/features/users/hooks";

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

const statusOptions = [
	{ value: "todo", label: "To Do" },
	{ value: "in_progress", label: "In Progress" },
	{ value: "done", label: "Done" },
];

const priorityOptions = [
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" },
	{ value: "critical", label: "Critical" },
];

const createTaskFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	priority: z.string().default("medium"),
	dueDate: z.string().optional(),
	assignedTo: z.string().optional(),
});

const editTaskFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	status: z.string(),
	priority: z.string(),
	dueDate: z.string().optional(),
	assignedTo: z.string().optional().nullable(),
});

export function TaskBoard({ projectId }: { projectId: string }) {
	const queryClient = useQueryClient();
	const [filter, setFilter] = useState({
		status: "",
		priority: "",
		assignee: "",
	});
	const [showForm, setShowForm] = useState(false);

	const projectQuery = useQuery({
		queryKey: ["project", projectId],
		queryFn: () => getProject(projectId).then((d) => d.project),
	});

	const tasksQuery = useQuery({
		queryKey: ["tasks", projectId, filter],
		queryFn: () =>
			listTasks(projectId, {
				status: filter.status || undefined,
				priority: filter.priority || undefined,
				assignee: filter.assignee || undefined,
			}).then((d) => d.tasks),
	});

	const invalidate = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
	}, [queryClient, projectId]);

	const createMutation = useMutation({
		mutationFn: (data: z.infer<typeof createTaskFormSchema>) =>
			apiCreateTask(projectId, {
				title: data.title,
				description: data.description || undefined,
				priority: data.priority,
				dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
				assignedTo: data.assignedTo || undefined,
			}),
		onSuccess: () => {
			invalidate();
			setShowForm(false);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (taskId: string) => apiDeleteTask(projectId, taskId),
		onSuccess: () => invalidate(),
	});

	if (projectQuery.isLoading || tasksQuery.isLoading) {
		return <div className="p-8 text-muted-foreground">Loading...</div>;
	}
	if (projectQuery.error) {
		return (
			<div className="p-8 text-destructive">
				Failed to load project
				<Button
					variant="outline"
					className="ml-2"
					onClick={() => projectQuery.refetch()}
				>
					Retry
				</Button>
			</div>
		);
	}
	if (tasksQuery.error) {
		return (
			<div className="p-8 text-destructive">
				Failed to load tasks
				<Button
					variant="outline"
					className="ml-2"
					onClick={() => tasksQuery.refetch()}
				>
					Retry
				</Button>
			</div>
		);
	}
	const project = projectQuery.data;
	if (!project) {
		return <div className="p-8 text-destructive">Project not found</div>;
	}

	const tasks = tasksQuery.data ?? [];
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
					onValueChange={(value) => setFilter((f) => ({ ...f, status: value }))}
				>
					<SelectTrigger className="w-[150px]">
						<SelectValue placeholder="All statuses">
							{(value: string) =>
								value
									? (statusOptions.find((o) => o.value === value)?.label ??
										value)
									: "All statuses"
							}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All statuses</SelectItem>
						{statusOptions.map((o) => (
							<SelectItem key={o.value} value={o.value}>
								{o.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={filter.priority}
					onValueChange={(value) =>
						setFilter((f) => ({ ...f, priority: value }))
					}
				>
					<SelectTrigger className="w-[150px]">
						<SelectValue placeholder="All priorities">
							{(value: string) =>
								value
									? (priorityOptions.find((o) => o.value === value)?.label ??
										value)
									: "All priorities"
							}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All priorities</SelectItem>
						{priorityOptions.map((o) => (
							<SelectItem key={o.value} value={o.value}>
								{o.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{showForm && (
				<CreateTaskForm
					projectId={projectId}
					onClose={() => setShowForm(false)}
					onSubmit={(data) => createMutation.mutate(data)}
					isPending={createMutation.isPending}
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
										<TaskCard
											key={task.id}
											task={task}
											projectId={projectId}
											onDelete={() => deleteMutation.mutate(task.id)}
										/>
									))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function TaskCard({
	task,
	projectId,
	onDelete,
}: {
	task: Task;
	projectId: string;
	onDelete: () => void;
}) {
	const queryClient = useQueryClient();
	const [dialogOpen, setDialogOpen] = useState(false);

	const updateMutation = useMutation({
		mutationFn: (fields: Partial<Task>) =>
			apiUpdateTask(projectId, task.id, fields),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
		},
	});

	const priorityVariants: Record<
		string,
		"default" | "secondary" | "destructive" | "outline"
	> = {
		low: "secondary",
		medium: "outline",
		high: "default",
		critical: "destructive",
	};

	return (
		<>
			<Card>
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between gap-2">
						<CardTitle className="text-sm">{task.title}</CardTitle>
						<div className="flex shrink-0 gap-1">
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={() => setDialogOpen(true)}
							>
								<Pencil className="h-3.5 w-3.5" />
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{task.description && (
						<p className="mb-2 text-xs text-muted-foreground">
							{task.description}
						</p>
					)}
					<div className="mb-2 flex items-center gap-2">
						<Badge variant={priorityVariants[task.priority] || "secondary"}>
							{priorityOptions.find((o) => o.value === task.priority)?.label ??
								task.priority}
						</Badge>
						{task.dueDate && (
							<span className="text-xs text-muted-foreground">
								{new Date(task.dueDate).toLocaleDateString()}
							</span>
						)}
					</div>
					<Select
						value={task.status}
						onValueChange={(value) => updateMutation.mutate({ status: value })}
					>
						<SelectTrigger className="h-7 w-full text-xs">
							<SelectValue>
								{(value: string) =>
									statusOptions.find((o) => o.value === value)?.label ?? value
								}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{statusOptions.map((o) => (
								<SelectItem key={o.value} value={o.value}>
									{o.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>
			<EditTaskDialog
				task={task}
				projectId={projectId}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				onDelete={onDelete}
			/>
		</>
	);
}

function CreateTaskForm({
	projectId,
	onClose,
	onSubmit,
	isPending,
}: {
	projectId: string;
	onClose: () => void;
	onSubmit: (data: z.infer<typeof createTaskFormSchema>) => void;
	isPending: boolean;
}) {
	const form = useForm<z.infer<typeof createTaskFormSchema>>({
		resolver: zodResolver(createTaskFormSchema),
		defaultValues: {
			title: "",
			description: "",
			priority: "medium",
			dueDate: "",
			assignedTo: "",
		},
	});
	const { data: members } = useProjectMembers(projectId);

	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>New Task</CardTitle>
			</CardHeader>
			<CardContent>
				<FormProvider {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
						{form.formState.errors.root && (
							<p className="text-sm text-destructive">
								{form.formState.errors.root.message}
							</p>
						)}
						<div className="space-y-1">
							<Label htmlFor="title">Task title</Label>
							<Input
								id="title"
								placeholder="Task title"
								{...form.register("title")}
							/>
							{form.formState.errors.title && (
								<p className="text-sm text-destructive">
									{form.formState.errors.title.message}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label htmlFor="description">Description (optional)</Label>
							<Textarea
								id="description"
								placeholder="Description (optional)"
								{...form.register("description")}
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="create-priority">Priority</Label>
							<Select
								value={form.watch("priority")}
								onValueChange={(value) => form.setValue("priority", value)}
							>
								<SelectTrigger id="create-priority" className="w-full">
									<SelectValue>
										{(value: string) =>
											priorityOptions.find((o) => o.value === value)?.label ??
											value
										}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{priorityOptions.map((o) => (
										<SelectItem key={o.value} value={o.value}>
											{o.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label htmlFor="create-assignee">Assignee (optional)</Label>
							<Select
								value={form.watch("assignedTo")}
								onValueChange={(value) =>
									form.setValue(
										"assignedTo",
										value === "unassigned" ? "" : value,
									)
								}
							>
								<SelectTrigger id="create-assignee" className="w-full">
									<SelectValue placeholder="Unassigned">
										{(value: string | null) => {
											if (!value) return "Unassigned";
											const member = members?.find((m) => m.id === value);
											return member?.name ?? value;
										}}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="unassigned">Unassigned</SelectItem>
									{members?.map((m) => (
										<SelectItem key={m.id} value={m.id}>
											{m.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<Input type="date" {...form.register("dueDate")} />
						<div className="flex gap-2">
							<Button type="submit" disabled={isPending}>
								{isPending ? "Creating..." : "Create"}
							</Button>
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
						</div>
					</form>
				</FormProvider>
			</CardContent>
		</Card>
	);
}

function EditTaskDialog({
	task,
	projectId,
	open,
	onOpenChange,
	onDelete,
}: {
	task: Task;
	projectId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDelete: () => void;
}) {
	const queryClient = useQueryClient();
	const { data: members } = useProjectMembers(projectId);

	const form = useForm<z.infer<typeof editTaskFormSchema>>({
		resolver: zodResolver(editTaskFormSchema),
		values: {
			title: task.title,
			description: task.description ?? "",
			status: task.status,
			priority: task.priority,
			dueDate: task.dueDate
				? new Date(task.dueDate).toISOString().split("T")[0]
				: "",
			assignedTo: task.assignedTo,
		},
	});

	const updateMutation = useMutation({
		mutationFn: (data: z.infer<typeof editTaskFormSchema>) =>
			apiUpdateTask(projectId, task.id, {
				title: data.title,
				description: data.description || null,
				status: data.status,
				priority: data.priority,
				dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
				assignedTo: data.assignedTo || null,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
			onOpenChange(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Task</DialogTitle>
				</DialogHeader>
				<FormProvider {...form}>
					<form
						onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}
						className="space-y-3"
					>
						<div className="space-y-1">
							<Label htmlFor="edit-title">Title</Label>
							<Input id="edit-title" {...form.register("title")} />
							{form.formState.errors.title && (
								<p className="text-sm text-destructive">
									{form.formState.errors.title.message}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label htmlFor="edit-desc">Description</Label>
							<Textarea id="edit-desc" {...form.register("description")} />
						</div>
						<div className="space-y-1">
							<Label htmlFor="edit-status">Status</Label>
							<Select
								value={form.watch("status")}
								onValueChange={(value) => form.setValue("status", value)}
							>
								<SelectTrigger id="edit-status" className="w-full">
									<SelectValue>
										{(value: string) =>
											statusOptions.find((o) => o.value === value)?.label ??
											value
										}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{statusOptions.map((o) => (
										<SelectItem key={o.value} value={o.value}>
											{o.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label htmlFor="edit-priority">Priority</Label>
							<Select
								value={form.watch("priority")}
								onValueChange={(value) => form.setValue("priority", value)}
							>
								<SelectTrigger id="edit-priority" className="w-full">
									<SelectValue>
										{(value: string) =>
											priorityOptions.find((o) => o.value === value)?.label ??
											value
										}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{priorityOptions.map((o) => (
										<SelectItem key={o.value} value={o.value}>
											{o.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label htmlFor="edit-assignee">Assignee</Label>
							<Select
								value={form.watch("assignedTo") ?? ""}
								onValueChange={(value) =>
									form.setValue(
										"assignedTo",
										value === "unassigned" ? null : value,
									)
								}
							>
								<SelectTrigger id="edit-assignee" className="w-full">
									<SelectValue placeholder="Unassigned">
										{(value: string | null) => {
											if (!value) return "Unassigned";
											const member = members?.find((m) => m.id === value);
											return member?.name ?? value;
										}}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="unassigned">Unassigned</SelectItem>
									{members?.map((m) => (
										<SelectItem key={m.id} value={m.id}>
											{m.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<Input type="date" {...form.register("dueDate")} />
						<div className="flex gap-2">
							<Button type="submit" disabled={updateMutation.isPending}>
								{updateMutation.isPending ? "Saving..." : "Save"}
							</Button>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DialogClose>
							<Button
								type="button"
								variant="destructive"
								className="ml-auto"
								onClick={onDelete}
							>
								Delete
							</Button>
						</div>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}
