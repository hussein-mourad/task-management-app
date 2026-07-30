import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/features/users/hooks";

export function AddMemberDialog({
	projectId: _projectId,
	open,
	onOpenChange,
	onAdd,
	isPending,
}: {
	projectId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAdd: (userId: string) => void;
	isPending: boolean;
}) {
	const { data: users } = useUsers();
	const [selectedUserId, setSelectedUserId] = useState("");

	function handleSubmit() {
		if (!selectedUserId) return;
		onAdd(selectedUserId);
		setSelectedUserId("");
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) setSelectedUserId("");
				onOpenChange(next);
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Member</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					<div className="space-y-1">
						<Label htmlFor="add-member-user">User</Label>
						<Select value={selectedUserId} onValueChange={setSelectedUserId}>
							<SelectTrigger id="add-member-user" className="w-full">
								<SelectValue placeholder="Select a user">
									{(value: string) => {
										if (!value) return "Select a user";
										const user = users?.find((u) => u.id === value);
										return user ? `${user.name} (${user.email})` : value;
									}}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{users?.map((u) => (
									<SelectItem key={u.id} value={u.id}>
										{u.name} ({u.email})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex gap-2 justify-end">
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DialogClose>
						<Button
							type="button"
							disabled={!selectedUserId || isPending}
							onClick={handleSubmit}
						>
							{isPending ? "Adding..." : "Add"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
