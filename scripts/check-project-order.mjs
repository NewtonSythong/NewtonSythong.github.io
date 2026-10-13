// Run after `npm run build`. Checks that the built home page lists the
// projects in rank order, so a component that forgets to sort fails CI
// even though the unit tests for the sort itself pass. Also checks the
// featured ranks run 1..n, since a gap would read as a missing entry.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

const dir = "src/content/projects";
const expected = readdirSync(dir)
	.filter((file) => file.endsWith(".md"))
	.map((file) => yaml.load(readFileSync(join(dir, file), "utf8").split(/^---$/m)[1]))
	.filter((data) => (data.status ?? "featured") === "featured")
	.sort((a, b) => a.rank - b.rank)
	.map((data) => data.slug);

const ranks = expected.length;
const featuredRanks = readdirSync(dir)
	.filter((file) => file.endsWith(".md"))
	.map((file) => yaml.load(readFileSync(join(dir, file), "utf8").split(/^---$/m)[1]))
	.filter((data) => (data.status ?? "featured") === "featured")
	.map((data) => data.rank)
	.sort((a, b) => a - b);
if (featuredRanks.some((rank, i) => rank !== i + 1)) {
	console.error(`Featured ranks must run 1..${ranks} with no gaps or repeats; found ${featuredRanks.join(", ")}`);
	process.exit(1);
}

const html = readFileSync("dist/index.html", "utf8");
const found = [...html.matchAll(/class="stretch"[^>]*href="\/projects\/([^"]+)"|href="\/projects\/([^"]+)"[^>]*class="stretch"/g)].map(
	(match) => match[1] ?? match[2],
);

if (JSON.stringify(found) !== JSON.stringify(expected)) {
	console.error(`Project order on the built home page is wrong.\n  expected: ${expected.join(", ")}\n  found:    ${found.join(", ")}`);
	process.exit(1);
}
console.log(`Project order OK: ${found.join(", ")}`);
