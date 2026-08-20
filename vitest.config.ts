import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// This ticket only sets up the tooling — no tests exist yet, and an
		// empty suite should still be a successful `npm test` run rather than
		// a failure. Later tickets (content collections, theme module) add
		// real coverage.
		passWithNoTests: true,
	},
});
