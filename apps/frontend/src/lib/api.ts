import axios from "axios";
import { env } from "@/lib/env";

const api = axios.create({
	baseURL: env.VITE_BACKEND_URL,
	headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("user");
			localStorage.removeItem("token");
			window.dispatchEvent(new Event("auth:logout"));
		}
		const message =
			error.response?.data?.error || error.message || "Request failed";
		return Promise.reject(new Error(message));
	},
);

export default api;
