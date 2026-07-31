import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getProject } from "@/features/projects/api";
import {
	deleteTask as apiDeleteTask,
	updateTask as apiUpdateTask,
	listTasks,
} from "@/features/tasks/api";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import { EditTaskDialog } from "@/features/tasks/components/edit-task-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

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

const boardSortOptions = [
	{ value: "createdAt-desc", label: "Newest" },
	{ value: "createdAt-asc", label: "Oldest" },
	{ value: "priority-asc", label: "Priority (high → low)" },
	{ value: "dueDate-asc", label: "Due date (soonest)" },
	{ value: "title-asc", label: "Title (A–Z)" },
];

export function TaskBoard({ projectId }: { projectId: string }) {
	const queryClient = useQueryClient();
	const [filter, setFilter] = useState({
		status: "",
		priority: "",
		assignee: "",
		sortBy: "createdAt",
		order: "desc",
	});
	const [searchInput, setSearchInput] = useState("");
	const debouncedSearch = useDebouncedValue(searchInput);
	const [showForm, setShowForm] = useState(false);
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const [dragError, setDragError] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
	);

	const projectQuery = useQuery({
		queryKey: ["project", projectId],
		queryFn: () => getProject(projectId).then((d) => d.project),
	});

	const tasksQuery = useQuery({
		queryKey: ["tasks", projectId, filter, debouncedSearch],
		queryFn: () =>
			listTasks(projectId, {
				status: filter.status || undefined,
				priority: filter.priority || undefined,
				assignee: filter.assignee || undefined,
				search: debouncedSearch || undefined,
				sortBy: filter.sortBy
					? (filter.sortBy as "title" | "priority" | "dueDate" | "createdAt")
					: undefined,
				order: filter.order ? (filter.order as "asc" | "desc") : undefined,
				limit: 500,
			}).then((d) => d.tasks),
	});

	const invalidate = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
	}, [queryClient, projectId]);

	const deleteMutation = useMutation({
		mutationFn: (taskId: string) => apiDeleteTask(projectId, taskId),
		onSuccess: () => invalidate(),
	});

	const dragMutation = useMutation({
		mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
			apiUpdateTask(projectId, taskId, { status }),
		onMutate: async ({ taskId, status }) => {
			await queryClient.cancelQueries({
				queryKey: ["tasks", projectId],
			});
			const prevData = queryClient.getQueryData<Task[]>([
				"tasks",
				projectId,
				filter,
			]);
			queryClient.setQueryData<Task[]>(["tasks", projectId, filter], (old) =>
				old?.map((t) => (t.id === taskId ? { ...t, status } : t)),
			);
			return { prevData };
		},
		onError: (_err, _vars, context) => {
			if (context?.prevData) {
				queryClient.setQueryData(
					["tasks", projectId, filter],
					context.prevData,
				);
			}
			setDragError("Failed to update task status");
			setTimeout(() => setDragError(null), 3000);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
		},
	});

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const task = tasksQuery.data?.find((t: Task) => t.id === event.active.id);
			setActiveTask(task ?? null);
		},
		[tasksQuery.data],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			setActiveTask(null);
			const { active, over } = event;
			if (!over || active.id === over.id) return;
			const taskStatus = active.data.current?.status as string;
			const newStatus = over.id as string;
			if (taskStatus === newStatus) return;
			dragMutation.mutate({
				taskId: active.id as string,
				status: newStatus,
			});
		},
		[dragMutation],
	);

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
			<div className="mb-4 flex items-center justify-between gap-2">
				<div className="flex gap-2">
					<Select
						value={filter.status}
						onValueChange={(value) =>
							setFilter((f) => ({ ...f, status: value ?? "" }))
						}
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
							setFilter((f) => ({ ...f, priority: value ?? "" }))
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
					<Input
						type="search"
						placeholder="Search tasks..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="w-56"
					/>
					<Select
						value={`${filter.sortBy}-${filter.order}`}
						onValueChange={(value) => {
							const [sortBy, order] = (value ?? "createdAt-desc").split("-");
							setFilter((f) => ({ ...f, sortBy, order }));
						}}
					>
						<SelectTrigger className="w-[170px]">
							<SelectValue>
								{(value: string) =>
									boardSortOptions.find((o) => o.value === value)?.label ??
									"Sort"
								}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{boardSortOptions.map((o) => (
								<SelectItem key={o.value} value={o.value}>
									{o.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<Button onClick={() => setShowForm(true)}>New Task</Button>
			</div>

			<CreateTaskDialog
				projectId={projectId}
				open={showForm}
				onOpenChange={setShowForm}
			/>

			{dragError && (
				<div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					{dragError}
				</div>
			)}

			{tasks.length === 0 ? (
				<div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
					No tasks yet
				</div>
			) : (
				<DndContext
					sensors={sensors}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
				>
					<div className="grid gap-4 md:grid-cols-3">
						{columns.map((col) => (
							<DroppableColumn
								key={col}
								id={col}
								label={columnLabels[col]}
								tasks={tasks.filter((t) => t.status === col)}
								projectId={projectId}
								onDelete={(taskId) => deleteMutation.mutate(taskId)}
							/>
						))}
					</div>
					<DragOverlay>
						{activeTask ? (
							<div className="opacity-80">
								<TaskCard
									task={activeTask}
									projectId={projectId}
									onDelete={() => {}}
								/>
							</div>
						) : null}
					</DragOverlay>
				</DndContext>
			)}
		</div>
	);
}

function DroppableColumn({
	id,
	label,
	tasks,
	projectId,
	onDelete,
}: {
	id: string;
	label: string;
	tasks: Task[];
	projectId: string;
	onDelete: (taskId: string) => void;
}) {
	const { setNodeRef, isOver } = useDroppable({ id });

	return (
		<div
			ref={setNodeRef}
			className={`rounded-lg border p-4 ${isOver ? "bg-accent ring-2 ring-primary" : "bg-muted/50"}`}
		>
			<h2 className="mb-3 font-semibold text-muted-foreground">{label}</h2>
			<div className="space-y-2">
				{tasks.map((task) => (
					<DraggableTaskCard
						key={task.id}
						task={task}
						projectId={projectId}
						onDelete={() => onDelete(task.id)}
					/>
				))}
			</div>
		</div>
	);
}

function DraggableTaskCard({
	task,
	projectId,
	onDelete,
}: {
	task: Task;
	projectId: string;
	onDelete: () => void;
}) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: task.id,
		data: { task, status: task.status },
	});

	return (
		<div
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
		>
			<TaskCard task={task} projectId={projectId} onDelete={onDelete} />
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
						onValueChange={(value) =>
							updateMutation.mutate({ status: value ?? task.status })
						}
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
