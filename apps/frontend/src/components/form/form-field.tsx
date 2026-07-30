import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
	name: string;
	label: string;
	children: ReactNode;
};

export function FormField({ name, label, children }: FormFieldProps) {
	const {
		formState: { errors },
	} = useFormContext();
	const error = errors[name];

	return (
		<div className="space-y-1">
			<Label htmlFor={name}>{label}</Label>
			{children}
			{error && (
				<p className="text-sm text-destructive">{error.message as string}</p>
			)}
		</div>
	);
}
