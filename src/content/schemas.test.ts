import { describe, expect, it } from "vitest";
import { experienceSchema, projectSchema } from "./schemas";

// See the comment at the top of ./schemas.ts for why these are
// plain-Vitest-testable without any Astro-specific test setup.

describe("experienceSchema", () => {
	it("accepts a valid entry", () => {
		const result = experienceSchema.safeParse({
			organization: "University of Otago",
			title: "Software Engineering Student",
			startDate: "2023-02",
			description: "Studying towards a BSc in Computer Science.",
			tags: ["Java", "TypeScript"],
		});

		expect(result.success).toBe(true);
	});

	it("rejects an entry missing a required field", () => {
		const result = experienceSchema.safeParse({
			organization: "University of Otago",
			// title is missing
			startDate: "2023-02",
			description: "Studying towards a BSc in Computer Science.",
		});

		expect(result.success).toBe(false);
	});
});

describe("projectSchema", () => {
	const validProject = {
		name: "Fresh-Flat",
		slug: "fresh-flat",
		tags: ["Next.js", "Supabase"],
		description: "A flat-sharing and roommate management app.",
		contribution:
			"Built the flat/invite CRUD API and join/leave-flat features.",
		liveDemoUrl: "https://fresh-flat.vercel.app/",
	};

	it("accepts a valid entry", () => {
		const result = projectSchema.safeParse(validProject);
		expect(result.success).toBe(true);
	});

	it("rejects an entry missing `contribution`", () => {
		const { contribution: _contribution, ...withoutContribution } =
			validProject;
		const result = projectSchema.safeParse(withoutContribution);
		expect(result.success).toBe(false);
	});

	it("rejects an entry where `contribution` just repeats `description`", () => {
		const result = projectSchema.safeParse({
			...validProject,
			contribution: validProject.description,
		});
		expect(result.success).toBe(false);
	});

	it("accepts a held-back entry with no live demo URL", () => {
		const result = projectSchema.safeParse({
			name: "BasicImageEditor",
			slug: "basic-image-editor",
			tags: ["Java"],
			description: "A non-destructive desktop image editor.",
			contribution: "Implemented rotate/flip and block averaging filters.",
			status: "held-back",
		});

		expect(result.success).toBe(true);
	});

	it("defaults `status` to \"featured\" when omitted", () => {
		const result = projectSchema.safeParse(validProject);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe("featured");
		}
	});
});
