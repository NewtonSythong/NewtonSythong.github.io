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

// A screenshot or capture of a project running. `alt` is required whenever
// `src` is, for the same reason `contribution` is required below: a
// decorative-only alt is a decision, not a default, and an image added in a
// hurry should not silently ship without one.
//
// `src` is a path under public/, e.g. "/images/projects/andie.gif", rather
// than an imported asset — these are captures dropped in by hand, and keeping
// them out of the build pipeline means adding one is a file copy plus a
// front-matter line.
const projectImageSchema = z.object({
	src: z.string().startsWith("/", "must be a root-relative path under public/"),
	alt: z.string().min(1),
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
		// The project's single headline capture — the card thumbnail and the
		// detail-page hero. Optional, because not every project has one yet.
		image: projectImageSchema.optional(),
		// Further screenshots, shown only on the project's detail page. The
		// card and the hero deliberately stay a single image: a recruiter
		// skimming the list should get one clear look per project, and the
		// rest of the tour is for whoever clicks through. Defaults to empty
		// so every existing entry stays valid without editing.
		gallery: z.array(projectImageSchema).default([]),
		status: z.enum(["featured", "held-back"]).default("featured"),
	})
	.refine((project) => project.contribution.trim() !== project.description.trim(), {
		message: "`contribution` must describe Newton's specific role and be distinct from `description`",
		path: ["contribution"],
	});
