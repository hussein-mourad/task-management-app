import { useCallback, useSyncExternalStore } from "react";

function getStorageKey() {
	return "theme-preference";
}

function getSnapshot(): boolean {
	if (typeof document === "undefined") return false;
	return document.documentElement.classList.contains("dark");
}

function subscribe(callback: () => void) {
	if (typeof window === "undefined") return () => {};
	const mq = window.matchMedia("(prefers-color-scheme: dark)");
	mq.addEventListener("change", callback);
	return () => mq.removeEventListener("change", callback);
}

function applyTheme(isDark: boolean) {
	if (typeof document === "undefined") return;
	document.documentElement.classList.toggle("dark", isDark);
}

export function useDarkMode() {
	const isDark = useSyncExternalStore(subscribe, getSnapshot, () => false);

	const setDark = useCallback((dark: boolean) => {
		applyTheme(dark);
		try {
			localStorage.setItem(getStorageKey(), dark ? "dark" : "light");
		} catch {}
	}, []);

	const toggle = useCallback(() => {
		setDark(!isDark);
	}, [isDark, setDark]);

	return { isDark, setDark, toggle };
}
