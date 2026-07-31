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
import { createTask as apiCreateTask } from "@/features/tasks/api";
import { useProjectMembers } from "@/features/users/hooks";

const createTaskFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	priority: z.string().default("medium"),
	dueDate: z.string().optional(),
	assignedTo: z.string().optional(),
});

const priorityOptions = [
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" },
	{ value: "critical", label: "Critical" },
];

export function CreateTaskDialog({
	projectId,
	open,
	onOpenChange,
}: {
	projectId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();
	const { data: members } = useProjectMembers(projectId);

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
			queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
			form.reset();
			onOpenChange(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New Task</DialogTitle>
				</DialogHeader>
				<FormProvider {...form}>
					<form
						onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
						className="space-y-3"
					>
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
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending ? "Creating..." : "Create"}
							</Button>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DialogClose>
						</div>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}
