import { useState } from "react";
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
import { useAddMember, useRemoveMember } from "@/features/projects/hooks";
import { useProjectMembers } from "@/features/users/hooks";
import { AddMemberDialog } from "./add-member-dialog";

type Member = {
	id: string;
	name: string;
	email: string;
};

export function MemberList({
	projectId,
	isAdmin,
}: {
	projectId: string;
	isAdmin: boolean;
}) {
	const { data: members, isLoading } = useProjectMembers(projectId);
	const [addMemberOpen, setAddMemberOpen] = useState(false);
	const addMemberMutation = useAddMember(projectId);

	const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
	const removeMemberMutation = useRemoveMember(projectId);

	if (isLoading) return null;

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Members</CardTitle>
					{isAdmin && (
						<Button size="sm" onClick={() => setAddMemberOpen(true)}>
							Add Member
						</Button>
					)}
				</CardHeader>
				<CardContent>
					{!members || members.length === 0 ? (
						<p className="text-sm text-muted-foreground">No members</p>
					) : (
						<div className="space-y-2">
							{members.map((m) => (
								<div
									key={m.id}
									className="flex items-center justify-between rounded-md border px-3 py-2"
								>
									<div>
										<p className="text-sm font-medium">{m.name}</p>
										<p className="text-xs text-muted-foreground">{m.email}</p>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="secondary">member</Badge>
										{isAdmin && (
											<Button
												variant="ghost"
												size="xs"
												onClick={() => setRemoveTarget(m)}
											>
												Remove
											</Button>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<AddMemberDialog
				projectId={projectId}
				open={addMemberOpen}
				onOpenChange={setAddMemberOpen}
				onAdd={(userId) =>
					addMemberMutation.mutate(userId, {
						onSuccess: () => setAddMemberOpen(false),
					})
				}
				isPending={addMemberMutation.isPending}
			/>

			<Dialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Remove Member</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						Are you sure you want to remove {removeTarget?.name} from this
						project?
					</p>
					<div className="flex gap-2 justify-end">
						<DialogClose render={<Button type="button" variant="outline" />}>
							Cancel
						</DialogClose>
						<Button
							type="button"
							variant="destructive"
							disabled={removeMemberMutation.isPending}
							onClick={() => {
								if (removeTarget) {
									removeMemberMutation.mutate(removeTarget.id, {
										onSuccess: () => setRemoveTarget(null),
									});
								}
							}}
						>
							{removeMemberMutation.isPending ? "Removing..." : "Remove"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
