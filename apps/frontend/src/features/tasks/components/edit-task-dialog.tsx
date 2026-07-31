import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { updateTask as apiUpdateTask } from "@/features/tasks/api";
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

const editTaskFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	status: z.string(),
	priority: z.string(),
	dueDate: z.string().optional(),
	assignedTo: z.string().optional().nullable(),
});

export function EditTaskDialog({
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
								onValueChange={(value) => form.setValue("status", value ?? "")}
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
								onValueChange={(value) =>
									form.setValue("priority", value ?? "")
								}
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
										value === "unassigned" || value == null ? null : value,
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
							<DialogClose render={<Button type="button" variant="outline" />}>
								Cancel
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
