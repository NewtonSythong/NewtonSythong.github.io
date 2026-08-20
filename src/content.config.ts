import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { withUniqueSlugs } from "./content/collections";
import { experienceSchema, projectSchema } from "./content/schemas";

const experience = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/experience" }),
	schema: experienceSchema,
});

const projects = defineCollection({
	loader: withUniqueSlugs(
		glob({ pattern: "**/*.md", base: "./src/content/projects" }),
	),
	schema: projectSchema,
});

export const collections = { experience, projects };
