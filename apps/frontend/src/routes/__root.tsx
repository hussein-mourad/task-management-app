import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
	useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { AuthProvider, useAuth } from "@/features/auth/auth-context";

import appCss from "@/styles.css?url";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			retry: 1,
			refetchOnWindowFocus: true,
		},
	},
});

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Task Manager" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider defaultTheme="system" storageKey="theme">
					<QueryClientProvider client={queryClient}>
						<AuthProvider>
							<Layout>{children}</Layout>
						</AuthProvider>
					</QueryClientProvider>
				</ThemeProvider>
				<TanStackDevtools
					config={{ position: "bottom-right", hideUntilHover: true }}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

function Layout({ children }: { children: React.ReactNode }) {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	function handleLogout() {
		logout();
		navigate({ to: "/login" });
	}

	return (
		<div>
			{user && (
				<header className="flex items-center justify-between border-b px-8 py-3">
					<Link to="/projects" className="text-lg font-bold">
						Task Manager
					</Link>
					<div className="flex items-center gap-4">
						<span className="text-sm text-muted-foreground">
							{user.name} ({user.role})
						</span>
						<ModeToggle />
						<Button variant="destructive" onClick={handleLogout}>
							Logout
						</Button>
					</div>
				</header>
			)}
			<main>{children}</main>
		</div>
	);
}
