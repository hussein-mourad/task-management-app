import { Controller, useFormContext } from "react-hook-form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type FormSelectProps = {
	name: string;
	placeholder?: string;
	options: { value: string; label: string }[];
};

export function FormSelect({ name, placeholder, options }: FormSelectProps) {
	const { control } = useFormContext();
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<Select value={field.value} onValueChange={field.onChange}>
					<SelectTrigger id={name} className="w-full">
						<SelectValue placeholder={placeholder} />
					</SelectTrigger>
					<SelectContent>
						{options.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
		/>
	);
}
