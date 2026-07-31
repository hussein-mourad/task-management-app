import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export function DeleteProjectDialog({
	open,
	onOpenChange,
	onConfirm,
	isPending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isPending: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Project</DialogTitle>
				</DialogHeader>
				<p className="text-sm text-muted-foreground">
					Are you sure you want to delete this project? This will remove all
					tasks and members. This action cannot be undone.
				</p>
				<div className="flex gap-2 justify-end">
					<DialogClose render={<Button type="button" variant="outline" />}>
						Cancel
					</DialogClose>
					<Button
						type="button"
						variant="destructive"
						disabled={isPending}
						onClick={onConfirm}
					>
						{isPending ? "Deleting..." : "Delete"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
