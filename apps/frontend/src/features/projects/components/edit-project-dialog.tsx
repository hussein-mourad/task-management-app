import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProject } from "@/features/projects/hooks";

const schema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Project = {
	id: string;
	name: string;
	description: string | null;
};

export function EditProjectDialog({
	project,
	open,
	onOpenChange,
}: {
	project: Project;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const updateMutation = useUpdateProject(project.id);

	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		values: {
			name: project.name,
			description: project.description ?? "",
		},
	});

	function handleSubmit(data: FormData) {
		updateMutation.mutate(
			{
				name: data.name,
				description: data.description || null,
			},
			{
				onSuccess: () => onOpenChange(false),
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Project</DialogTitle>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
					<div className="space-y-1">
						<Label htmlFor="edit-project-name">Project name</Label>
						<Input id="edit-project-name" {...form.register("name")} />
						{form.formState.errors.name && (
							<p className="text-sm text-destructive">
								{form.formState.errors.name.message}
							</p>
						)}
					</div>
					<div className="space-y-1">
						<Label htmlFor="edit-project-desc">Description</Label>
						<Textarea
							id="edit-project-desc"
							{...form.register("description")}
						/>
					</div>
					<div className="flex gap-2">
						<Button type="submit" disabled={updateMutation.isPending}>
							{updateMutation.isPending ? "Saving..." : "Save"}
						</Button>
						<DialogClose render={<Button type="button" variant="outline" />}>
							Cancel
						</DialogClose>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
