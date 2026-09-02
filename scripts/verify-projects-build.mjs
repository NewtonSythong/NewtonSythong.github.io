#!/usr/bin/env node
// Lightweight build verification (see .scratch/portfolio-site/spec.md's
// Testing Decisions): after `astro build`, confirm every non-held-back
// entry in the `projects` content collection produced its
// /projects/[slug] route, and that no held-back entry did. This is a
// smoke check, not a dedicated test suite — rendered markup/visual output
// is not asserted here.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const root = fileURLToPath(new URL("..", import.meta.url));
const projectsDir = path.join(root, "src/content/projects");
const distDir = path.join(root, "dist");
const distProjectsDir = path.join(distDir, "projects");

function readFrontmatter(filePath) {
	const raw = readFileSync(filePath, "utf-8");
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) {
		throw new Error(`No frontmatter found in ${filePath}`);
	}
	return yaml.load(match[1]);
}

const entries = readdirSync(projectsDir)
	.filter((file) => file.endsWith(".md"))
	.map((file) => readFrontmatter(path.join(projectsDir, file)));

let failures = 0;

for (const entry of entries) {
	const status = entry.status ?? "featured";
	const routeExists = existsSync(path.join(distProjectsDir, entry.slug, "index.html"));

	if (status === "featured" && !routeExists) {
		console.error(
			`✗ Expected a route for featured project "${entry.slug}" but dist/projects/${entry.slug}/index.html is missing.`,
		);
		failures++;
	} else if (status === "held-back" && routeExists) {
		console.error(`✗ Held-back project "${entry.slug}" unexpectedly produced a public route.`);
		failures++;
	} else {
		console.log(`✓ ${entry.slug} (${status})`);
	}

	// Project imagery is referenced by hand-written root-relative path and is
	// served straight from public/ rather than imported as a build asset, so
	// nothing else would catch a typo or a file that never got copied across —
	// it would simply ship as a broken image. The schema can only check the
	// path's shape; this checks the file is actually there.
	const images = [entry.image, ...(entry.gallery ?? [])].filter(Boolean);

	for (const image of images) {
		if (!existsSync(path.join(distDir, image.src))) {
			console.error(`✗ "${entry.slug}" references ${image.src}, which is not in dist/.`);
			failures++;
		}
	}

	if (images.length > 0 && failures === 0) {
		console.log(`  ${images.length} image(s) present`);
	}
}

if (failures > 0) {
	console.error(`\n${failures} project check(s) failed.`);
	process.exit(1);
}

console.log(`\nAll ${entries.length} project route(s) and their imagery verified.`);
