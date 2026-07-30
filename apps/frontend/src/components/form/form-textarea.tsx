import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

type FormTextareaProps = {
	name: string;
	placeholder?: string;
};

export function FormTextarea({ name, placeholder }: FormTextareaProps) {
	const { register } = useFormContext();
	return (
		<textarea
			id={name}
			placeholder={placeholder}
			className={cn(
				"flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
			)}
			{...register(name)}
		/>
	);
}
