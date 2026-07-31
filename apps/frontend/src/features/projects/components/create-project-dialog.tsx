import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { createProject as apiCreateProject } from "@/features/projects/api";

export function CreateProjectDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) {
			setError("Name is required");
			return;
		}
		setError("");
		setSubmitting(true);
		try {
			await apiCreateProject(name, description || undefined);
			setName("");
			setDescription("");
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			onOpenChange(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create project");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New Project</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-3">
					{error && <p className="text-sm text-destructive">{error}</p>}
					<div className="space-y-1">
						<Label htmlFor="project-name">Project name</Label>
						<Input
							id="project-name"
							placeholder="Project name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="project-desc">Description (optional)</Label>
						<Textarea
							id="project-desc"
							placeholder="Description (optional)"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					<div className="flex gap-2">
						<Button type="submit" disabled={submitting}>
							{submitting ? "Creating..." : "Create"}
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
