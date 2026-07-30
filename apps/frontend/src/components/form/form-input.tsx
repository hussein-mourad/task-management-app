import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";

type FormInputProps = {
	name: string;
	type?: string;
	placeholder?: string;
	required?: boolean;
	minLength?: number;
};

export function FormInput({
	name,
	type,
	placeholder,
	required,
	minLength,
}: FormInputProps) {
	const { register } = useFormContext();
	return (
		<Input
			id={name}
			type={type}
			placeholder={placeholder}
			required={required}
			minLength={minLength}
			{...register(name)}
		/>
	);
}
