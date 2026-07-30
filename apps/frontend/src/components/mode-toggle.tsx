import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();

	const next =
		theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
	const label =
		theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(next)}
			aria-label={`Theme: ${label}. Click for ${next}.`}
		>
			{theme === "dark" ? <MoonIcon /> : <SunIcon />}
		</Button>
	);
}
