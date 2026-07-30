import api from "@/lib/api";

type LoginData = {
	user: { id: string; email: string; name: string; role: string };
	token: string;
};

export async function login(email: string, password: string) {
	const { data } = await api.post<LoginData>("/api/auth/login", {
		email,
		password,
	});
	return data;
}

export async function register(name: string, email: string, password: string) {
	const { data } = await api.post<LoginData>("/api/auth/register", {
		name,
		email,
		password,
	});
	return data;
}

export async function getMe() {
	const { data } = await api.get<{ user: LoginData["user"] }>("/api/auth/me");
	return data;
}
