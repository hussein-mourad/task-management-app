import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

type User = {
	id: string;
	email: string;
	name: string;
	role: string;
};

type AuthContextType = {
	user: User | null;
	token: string | null;
	setAuth: (user: User, token: string) => void;
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
		setIsLoading(false);
		localStorage.setItem("user", JSON.stringify(user));
		localStorage.setItem("token", token);
	}, []);

	const logout = useCallback(() => {
		setUser(null);
		setToken(null);
		setIsLoading(false);
		localStorage.removeItem("user");
		localStorage.removeItem("token");
	}, []);

	useEffect(() => {
		const onForceLogout = () => logout();
		window.addEventListener("auth:logout", onForceLogout);
		return () => window.removeEventListener("auth:logout", onForceLogout);
	}, [logout]);

	return (
		<AuthContext.Provider value={{ user, token, setAuth, logout, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
