import { describe, expect, it } from "vitest";
import {
	getStoredTheme,
	getSystemTheme,
	resolveInitialTheme,
	cycleTheme,
	type ThemeStorage,
} from "./theme";

// A minimal in-memory stand-in for `localStorage` — enough to satisfy
// `ThemeStorage` without touching the DOM/browser, per the module's design.
function createStorage(initial?: string): ThemeStorage {
	let value: string | null = initial ?? null;
	return {
		getItem: () => value,
		setItem: (_key, next) => {
			value = next;
		},
	};
}

describe("getStoredTheme", () => {
	it("returns null when nothing is stored", () => {
		expect(getStoredTheme(createStorage())).toBeNull();
	});

	it("returns the stored theme when a valid value is present", () => {
		expect(getStoredTheme(createStorage("dark"))).toBe("dark");
	});

	it("returns y2k when it was the stored choice", () => {
		expect(getStoredTheme(createStorage("y2k"))).toBe("y2k");
	});

	it("returns null when the stored value isn't a recognised theme", () => {
		expect(getStoredTheme(createStorage("solarized"))).toBeNull();
	});
});

describe("getSystemTheme", () => {
	it("returns \"dark\" when the media query matches", () => {
		expect(getSystemTheme({ matches: true })).toBe("dark");
	});

	it("returns \"light\" when the media query doesn't match", () => {
		expect(getSystemTheme({ matches: false })).toBe("light");
	});
});

describe("resolveInitialTheme", () => {
	it("prefers a stored override over the system preference", () => {
		const theme = resolveInitialTheme(createStorage("light"), { matches: true });
		expect(theme).toBe("light");
	});

	it("falls back to the system preference when nothing is stored", () => {
		const theme = resolveInitialTheme(createStorage(), { matches: true });
		expect(theme).toBe("dark");
	});
});

describe("cycleTheme", () => {
	it("goes light, dark, y2k, then back to light", () => {
		const storage = createStorage();
		expect(cycleTheme("light", storage)).toBe("dark");
		expect(cycleTheme("dark", storage)).toBe("y2k");
		expect(cycleTheme("y2k", storage)).toBe("light");
	});

	it("persists the new theme so it survives a reload", () => {
		const storage = createStorage("dark");
		cycleTheme("dark", storage);
		expect(getStoredTheme(storage)).toBe("y2k");
	});
});
