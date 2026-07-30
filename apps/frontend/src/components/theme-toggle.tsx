import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/use-dark-mode";

export function ThemeToggle() {
	const { isDark, toggle } = useDarkMode();

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggle}
			aria-label="Toggle theme"
		>
			{isDark ? <SunIcon /> : <MoonIcon />}
		</Button>
	);
}
