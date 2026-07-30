import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	login as apiLogin,
	register as apiRegister,
} from "@/features/auth/api";

type User = {
	id: string;
	email: string;
	name: string;
	role: string;
};

type AuthContextType = {
	user: User | null;
	token: string | null;
	login: (email: string, password: string) => Promise<void>;
	register: (name: string, email: string, password: string) => Promise<void>;
	logout: () => void;
	isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

function loadAuth(): { user: User | null; token: string | null } {
	if (typeof window === "undefined") return { user: null, token: null };
	try {
		const user = localStorage.getItem("user");
		const token = localStorage.getItem("token");
		return { user: user ? JSON.parse(user) : null, token };
	} catch {
		return { user: null, token: null };
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(loadAuth().user);
	const [token, setToken] = useState<string | null>(loadAuth().token);
	const [isLoading, setIsLoading] = useState(false);

	const setAuth = useCallback((user: User, token: string) => {
		setUser(user);
		setToken(token);
		localStorage.setItem("user", JSON.stringify(user));
		localStorage.setItem("token", token);
	}, []);

	const logout = useCallback(() => {
		setUser(null);
		setToken(null);
		localStorage.removeItem("user");
		localStorage.removeItem("token");
	}, []);

	const login = useCallback(
		async (email: string, password: string) => {
			setIsLoading(true);
			try {
				const data = await apiLogin(email, password);
				setAuth(data.user, data.token);
			} finally {
				setIsLoading(false);
			}
		},
		[setAuth],
	);

	const register = useCallback(
		async (name: string, email: string, password: string) => {
			setIsLoading(true);
			try {
				const data = await apiRegister(name, email, password);
				setAuth(data.user, data.token);
			} finally {
				setIsLoading(false);
			}
		},
		[setAuth],
	);

	useEffect(() => {
		const onForceLogout = () => logout();
		window.addEventListener("auth:logout", onForceLogout);
		return () => window.removeEventListener("auth:logout", onForceLogout);
	}, [logout]);

	return (
		<AuthContext.Provider
			value={{ user, token, login, register, logout, isLoading }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
