import { z } from "astro/zod";

// `astro/zod` (Astro's bundled zod, as opposed to the deprecated `z`
// re-export from the virtual "astro:content" module) is a plain,
// Node-resolvable export — so these schemas can be wired into Astro's
// content collections *and* imported directly in Vitest tests without
// any Astro-specific test setup.

export const experienceSchema = z.object({
	organization: z.string(),
	title: z.string(),
	startDate: z.string(),
	endDate: z.string().optional(),
	description: z.string(),
	tags: z.array(z.string()).default([]),
});

export const projectSchema = z
	.object({
		name: z.string(),
		slug: z.string(),
		tags: z.array(z.string()),
		description: z.string(),
		// Required and kept structurally distinct from `description` (see
		// the `.refine` below) so the honest team-project framing agreed
		// in CONTEXT.md is enforced by the schema, not just a writing
		// convention that could be forgotten later.
		contribution: z.string(),
		liveDemoUrl: z.url().optional(),
		status: z.enum(["featured", "held-back"]).default("featured"),
	})
	.refine((project) => project.contribution.trim() !== project.description.trim(), {
		message: "`contribution` must describe Newton's specific role and be distinct from `description`",
		path: ["contribution"],
	});
