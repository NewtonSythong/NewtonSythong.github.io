import { describe, expect, it } from "vitest";
import yaml from "js-yaml";
import { insertImageFrontmatter } from "./frontmatter.mjs";

// Behaviour under test: given a project markdown file, does the result still
// parse as YAML, carry the image the caller asked for, and leave everything
// else alone? Assertions go through js-yaml rather than string matching
// wherever possible, since what matters is what Astro will parse, not the
// exact bytes.

const parseFrontmatter = (raw) => yaml.load(raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);

const sample = [
	"---",
	'name: "Fresh-Flat"',
	'slug: "fresh-flat"',
	'tags: ["Next.js", "Supabase"]',
	'description: "A full-stack household management app."',
	'contribution: "Built the flat and invite CRUD API."',
	'liveDemoUrl: "https://fresh-flat-psi.vercel.app"',
	"---",
	"",
	"Body text stays put.",
	"",
].join("\n");

describe("insertImageFrontmatter", () => {
	it("adds an image block that parses back to the given src and alt", () => {
		const result = insertImageFrontmatter(sample, "/images/projects/fresh-flat.png", "The pantry list");

		expect(parseFrontmatter(result).image).toEqual({
			src: "/images/projects/fresh-flat.png",
			alt: "The pantry list",
		});
	});

	it("leaves the other front-matter fields untouched", () => {
		const before = parseFrontmatter(sample);
		const after = parseFrontmatter(insertImageFrontmatter(sample, "/images/projects/x.png", "alt"));

		for (const key of Object.keys(before)) {
			expect(after[key]).toEqual(before[key]);
		}
	});

	it("preserves the markdown body", () => {
		const result = insertImageFrontmatter(sample, "/images/projects/x.png", "alt");
		expect(result).toContain("Body text stays put.");
		expect(result.split("---").length).toBe(sample.split("---").length);
	});

	it("replaces an existing image block rather than adding a second one", () => {
		const once = insertImageFrontmatter(sample, "/images/projects/old.png", "Old alt");
		const twice = insertImageFrontmatter(once, "/images/projects/new.png", "New alt");

		expect(twice.match(/^image:/gm)).toHaveLength(1);
		expect(parseFrontmatter(twice).image).toEqual({
			src: "/images/projects/new.png",
			alt: "New alt",
		});
	});

	it("escapes quotes and colons in alt text", () => {
		const alt = 'ANDIE\'s "rotate: 90°" dialog, open over a photograph';
		const result = insertImageFrontmatter(sample, "/images/projects/andie.gif", alt);

		expect(parseFrontmatter(result).image.alt).toBe(alt);
	});

	// A `$&` in the alt text would be a replacement pattern if the rebuild
	// used String.replace, silently duplicating the whole matched region.
	it("treats replacement-pattern syntax in alt text as literal", () => {
		const alt = "Cost breakdown showing $& and $1 line items";
		const result = insertImageFrontmatter(sample, "/images/projects/x.png", alt);

		expect(parseFrontmatter(result).image.alt).toBe(alt);
	});

	it("keeps CRLF files on CRLF", () => {
		const crlf = sample.replace(/\n/g, "\r\n");
		const result = insertImageFrontmatter(crlf, "/images/projects/x.png", "alt");

		expect(result).not.toMatch(/(?<!\r)\n/);
		expect(parseFrontmatter(result).image.src).toBe("/images/projects/x.png");
	});

	it("rejects empty alt text, which the projects schema would reject too", () => {
		expect(() => insertImageFrontmatter(sample, "/images/projects/x.png", "   ")).toThrow(
			/Alt text is required/,
		);
	});

	it("throws when there is no front matter to edit", () => {
		expect(() => insertImageFrontmatter("Just a body.\n", "/x.png", "alt")).toThrow(
			/No frontmatter/,
		);
	});
});
