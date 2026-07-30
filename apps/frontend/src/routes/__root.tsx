import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
	useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { AuthProvider, useAuth } from "@/features/auth/auth-context";

import appCss from "@/styles.css?url";

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

function ThemeScript() {
	return (
		<script
			// biome-ignore lint/security/noDangerouslySetInnerHtml: safe inline script for dark mode flash prevention
			dangerouslySetInnerHTML={{
				__html: `
          try {
            var theme = localStorage.getItem('theme-preference');
            if (!theme) {
              theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        `,
			}}
		/>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<ThemeScript />
				<HeadContent />
			</head>
			<body>
				<AuthProvider>
					<Layout>{children}</Layout>
				</AuthProvider>
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
						<ThemeToggle />
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
