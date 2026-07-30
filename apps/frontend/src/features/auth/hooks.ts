import { useMutation } from "@tanstack/react-query";
import {
	login as apiLogin,
	register as apiRegister,
} from "@/features/auth/api";
import { useAuth } from "@/features/auth/auth-context";

export function useLogin() {
	const { setAuth } = useAuth();
	return useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) =>
			apiLogin(email, password),
		onSuccess: (data) => {
			setAuth(data.user, data.token);
		},
	});
}

export function useRegister() {
	const { setAuth } = useAuth();
	return useMutation({
		mutationFn: ({
			name,
			email,
			password,
		}: {
			name: string;
			email: string;
			password: string;
		}) => apiRegister(name, email, password),
		onSuccess: (data) => {
			setAuth(data.user, data.token);
		},
	});
}
