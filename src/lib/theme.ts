// Framework-free theme module — no DOM, browser, or Astro import here on
// purpose. Every function takes its storage/media-query dependency as a
// plain argument, so this module is Vitest-testable in isolation (mocked
// media-query result, mocked/absent stored value, no jsdom required) and
// reusable from any DOM caller without adapting it first.
//
// `window.localStorage` and `window.matchMedia(query)` already satisfy the
// `ThemeStorage`/`SystemPreference` shapes below structurally, so callers in
// the browser can pass them straight through with no wrapper.

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export interface ThemeStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

export interface SystemPreference {
	matches: boolean;
}

function isTheme(value: string | null): value is Theme {
	return value === "light" || value === "dark";
}

/** Reads a manually-chosen theme override, if one was previously persisted. */
export function getStoredTheme(storage: ThemeStorage): Theme | null {
	const value = storage.getItem(STORAGE_KEY);
	return isTheme(value) ? value : null;
}

/** Resolves the visitor's OS-level `prefers-color-scheme` into a Theme. */
export function getSystemTheme(preference: SystemPreference): Theme {
	return preference.matches ? "dark" : "light";
}

/**
 * The theme to apply on load: a manually-chosen override takes priority,
 * falling back to the visitor's OS preference when no override is stored.
 */
export function resolveInitialTheme(storage: ThemeStorage, preference: SystemPreference): Theme {
	return getStoredTheme(storage) ?? getSystemTheme(preference);
}

/**
 * Flips the current theme, persists the choice as a manual override (so it
 * survives future reloads regardless of what the OS preference does), and
 * returns the new theme for the caller to apply.
 */
export function toggleTheme(current: Theme, storage: ThemeStorage): Theme {
	const next: Theme = current === "dark" ? "light" : "dark";
	storage.setItem(STORAGE_KEY, next);
	return next;
}
