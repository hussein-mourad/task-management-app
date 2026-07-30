import { useCallback } from "react";
import { useAuth } from "@/features/auth/auth-context";

const BASE_URL = "http://localhost:8000";

export function useApi() {
	const { token, logout } = useAuth();

	const apiCall = useCallback(
		async (path: string, options: RequestInit = {}) => {
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
				...(options.headers as Record<string, string>),
			};
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}
			const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
			if (res.status === 401) {
				logout();
				throw new Error("Unauthorized");
			}
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || `Request failed (${res.status})`);
			}
			if (res.status === 204) return null;
			return res.json();
		},
		[token, logout],
	);

	return apiCall;
}
