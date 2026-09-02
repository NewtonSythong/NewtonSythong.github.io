#!/usr/bin/env node
// Drives OBS Studio over obs-websocket to capture the project screenshots
// and the ANDIE screen recording that ticket 14 still needs, saving each one
// straight into public/images/projects/ and writing the matching `image:`
// block back into the project's front matter.
//
// What this automates, and what it deliberately does not:
//
//   Automated — identical framing for every capture (each shot is taken of
//   the OBS *scene*, so all four come out at the same aspect ratio and size
//   however the underlying window is sized), the file naming, the save
//   location, the recording start/stop, the GIF conversion, and the
//   front-matter edit that is easy to forget afterwards.
//
//   Not automated — navigating to the app, logging in, and clicking through
//   it. OBS captures a window; it cannot drive one. The script therefore
//   stops before each capture and waits for you to get the screen into the
//   state you want, which is the part only a human can do here.
//
// One-time setup:
//   1. In OBS: Tools -> WebSocket Server Settings -> Enable WebSocket server.
//      Leave the port at 4455. Copy the password, or turn authentication off
//      if you would rather not deal with it.
//   2. In OBS: add a source to a scene that shows what you want to capture —
//      "Window Capture" for a single app window, or "Display Capture" for the
//      whole screen — and size it to fill the canvas (right-click the source
//      -> Transform -> Fit to screen).
//   3. Optionally `winget install Gyan.FFmpeg` so the ANDIE recording can be
//      converted to a GIF automatically. Without it the recording is still
//      made and left in place for conversion later.
//
// Usage:
//   node scripts/capture-project-media.mjs            # everything outstanding
//   node scripts/capture-project-media.mjs --list     # show what is outstanding
//   node scripts/capture-project-media.mjs --only fresh-flat
//   node scripts/capture-project-media.mjs --only basic-image-editor --force
//
// The websocket password is read from OBS_WEBSOCKET_PASSWORD if set, and
// otherwise from OBS's own config file, so it never has to be typed here.

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { insertImageFrontmatter } from "./lib/frontmatter.mjs";
import { readObsWebsocketConfig } from "./lib/obs-config.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const projectsDir = path.join(root, "src/content/projects");
const imagesDir = path.join(root, "public/images/projects");

const DEFAULT_PORT = 4455;
// The card thumbnails crop to 16:9 and the detail pages show the image at its
// natural size, so a 16:9 capture at a sane width suits both. Anything larger
// is wasted bytes on a page that serves these unoptimised out of public/.
const STILL_WIDTH = 1600;
const STILL_HEIGHT = 900;
// GIFs are enormous compared to a still. Halving the width and dropping to
// 12fps keeps a short ANDIE clip in the low megabytes.
const GIF_WIDTH = 800;
const GIF_FPS = 12;

// Per-project capture guidance. Keyed by slug; every featured project in the
// content collection is expected to have an entry, and the script fails
// loudly rather than silently skipping if one is missing — a project added
// later should force a decision about how it gets shown, not default to
// having no image.
const GUIDANCE = {
	"fresh-flat": {
		kind: "still",
		show: "The shared pantry list with expiry dates, or an AI-generated recipe.",
		url: "https://fresh-flat-psi.vercel.app",
	},
	"note-pilot": {
		kind: "still",
		show: "A document turned into flashcards or a summary.",
		url: "https://note-pilot-sage.vercel.app",
	},
	"product-catalouge": {
		kind: "still",
		show: "The catalogue grid with category filtering, or the cart/checkout.",
		url: "https://productcatalouge.onrender.com",
		note: "Log in as demo / demo1234. Free Render tier — if it is asleep the first load takes 30-60s.",
	},
	"basic-image-editor": {
		kind: "clip",
		show: "Rotate an image, then block-average it — the two features that are Newton's own contribution.",
		note: "Run the Swing app locally. Keep it to a few seconds; the GIF is served unoptimised.",
	},
};

/* ---------------------------------------------------------------- content -- */

function readFrontmatter(filePath) {
	const raw = readFileSync(filePath, "utf-8");
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) throw new Error(`No frontmatter found in ${filePath}`);
	return { raw, body: match[1], data: yaml.load(match[1]) };
}

function loadProjects() {
	return readdirSync(projectsDir)
		.filter((file) => file.endsWith(".md"))
		.map((file) => {
			const filePath = path.join(projectsDir, file);
			const { data } = readFrontmatter(filePath);
			return { filePath, data, status: data.status ?? "featured" };
		})
		.filter((project) => project.status === "featured");
}

function writeImageFrontmatter(filePath, src, alt) {
	const raw = readFileSync(filePath, "utf-8");
	writeFileSync(filePath, insertImageFrontmatter(raw, src, alt), "utf-8");
}

/* -------------------------------------------------------------- websocket -- */

/**
 * Minimal obs-websocket 5.x client over Node's built-in WebSocket, which is
 * why this script has no dependencies of its own beyond js-yaml (already a
 * devDependency). The protocol only needs three opcodes here: Hello (0),
 * Identify (1) / Identified (2), and Request (6) / RequestResponse (7).
 */
async function connectToObs(port, password) {
	const socket = new WebSocket(`ws://127.0.0.1:${port}`);
	const pending = new Map();
	let nextRequestId = 0;

	await new Promise((resolve, reject) => {
		socket.addEventListener("error", () =>
			reject(
				new Error(
					`Could not reach OBS on ws://127.0.0.1:${port}.\n` +
						`  Is OBS running, and is the websocket server enabled?\n` +
						`  OBS -> Tools -> WebSocket Server Settings -> Enable WebSocket server.`,
				),
			),
		);

		socket.addEventListener("message", (event) => {
			const { op, d } = JSON.parse(event.data);

			if (op === 0) {
				const identify = { rpcVersion: 1, eventSubscriptions: 0 };

				if (d.authentication) {
					if (!password) {
						reject(
							new Error(
								"OBS requires a websocket password but none was found.\n" +
									"  Set OBS_WEBSOCKET_PASSWORD, or disable authentication in\n" +
									"  OBS -> Tools -> WebSocket Server Settings.",
							),
						);
						return;
					}
					const secret = createHash("sha256")
						.update(password + d.authentication.salt)
						.digest("base64");
					identify.authentication = createHash("sha256")
						.update(secret + d.authentication.challenge)
						.digest("base64");
				}

				socket.send(JSON.stringify({ op: 1, d: identify }));
				return;
			}

			if (op === 2) {
				resolve();
				return;
			}

			if (op === 7) {
				const entry = pending.get(d.requestId);
				if (!entry) return;
				pending.delete(d.requestId);
				if (d.requestStatus.result) entry.resolve(d.responseData ?? {});
				else
					entry.reject(
						new Error(`OBS rejected ${d.requestType}: ${d.requestStatus.comment ?? "unknown error"}`),
					);
			}
		});
	});

	const request = (requestType, requestData = {}) =>
		new Promise((resolve, reject) => {
			const requestId = String(nextRequestId++);
			pending.set(requestId, { resolve, reject });
			socket.send(JSON.stringify({ op: 6, d: { requestType, requestId, requestData } }));
		});

	return { request, close: () => socket.close() };
}

/* ------------------------------------------------------------------ media -- */

// No `shell: true` here: Node resolves a bare "ffmpeg" to ffmpeg.exe on
// Windows on its own, and going through the shell would concatenate rather
// than escape the arguments (Node's DEP0190) — which matters because one of
// them is a filter string full of shell metacharacters.
function findFfmpeg() {
	const probe = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
	return probe.status === 0 ? "ffmpeg" : null;
}

/**
 * Single-command palette GIF: palettegen builds an optimal 256-colour table
 * for this specific clip and paletteuse applies it, which is the difference
 * between a clean screen capture and a dithered mess. The `split` filter
 * feeds both from one decode pass.
 */
function convertToGif(ffmpeg, input, output) {
	const filter =
		`fps=${GIF_FPS},scale=${GIF_WIDTH}:-1:flags=lanczos,` +
		`split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3`;

	const result = spawnSync(ffmpeg, ["-y", "-i", input, "-vf", filter, "-loop", "0", output], {
		stdio: "inherit",
	});
	return result.status === 0;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------- main -- */

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const sceneOverride = args.includes("--scene") ? args[args.indexOf("--scene") + 1] : null;
const force = args.includes("--force");
const listOnly = args.includes("--list");

// OBS's own config is the best source for both of these: whatever port and
// password are set in the WebSocket Server Settings dialog are the ones that
// will actually work, so neither has to be passed in by hand.
const obsConfig = readObsWebsocketConfig();
const password = process.env.OBS_WEBSOCKET_PASSWORD ?? obsConfig.password;
const port = args.includes("--port")
	? Number(args[args.indexOf("--port") + 1])
	: (obsConfig.port ?? DEFAULT_PORT);

const projects = loadProjects();

const missingGuidance = projects.filter((project) => !GUIDANCE[project.data.slug]);
if (missingGuidance.length > 0) {
	console.error(
		`✗ No capture guidance for: ${missingGuidance.map((p) => p.data.slug).join(", ")}.\n` +
			`  Add an entry to GUIDANCE in this script so the new project gets an image too.`,
	);
	process.exit(1);
}

let targets = projects.filter((project) => force || !project.data.image);
if (only) {
	targets = projects.filter((project) => project.data.slug === only);
	if (targets.length === 0) {
		console.error(`✗ No featured project with slug "${only}".`);
		process.exit(1);
	}
	if (targets[0].data.image && !force) {
		console.error(`✗ "${only}" already has an image. Re-run with --force to replace it.`);
		process.exit(1);
	}
}

if (listOnly || targets.length === 0) {
	for (const project of projects) {
		const state = project.data.image ? `✓ ${project.data.image.src}` : "✗ no image";
		console.log(`  ${project.data.slug.padEnd(20)} ${state}`);
	}
	console.log(targets.length === 0 ? "\nNothing outstanding." : `\n${targets.length} outstanding.`);
	process.exit(0);
}

const ffmpeg = findFfmpeg();

// Failing to reach OBS is the ordinary case when the websocket server has not
// been switched on yet, so it gets the instructions and an exit code rather
// than a stack trace.
let obs;
try {
	obs = await connectToObs(port, password);
} catch (error) {
	console.error(`✗ ${error.message}`);
	process.exit(1);
}

const { currentProgramSceneName } = await obs.request("GetCurrentProgramScene");
const scene = sceneOverride ?? currentProgramSceneName;

// Screenshotting the *scene* rather than an individual source is what makes
// every capture come out identically framed: the scene is the OBS canvas, so
// whatever the source's own resolution is, the result is the same 16:9 crop.
console.log(`\nConnected to OBS. Capturing from scene "${scene}".`);
if (!ffmpeg) {
	console.log("Note: ffmpeg not found — recordings will be left unconverted.");
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

try {
	for (const project of targets) {
		const { slug, name } = project.data;
		const guidance = GUIDANCE[slug];
		const isClip = guidance.kind === "clip";
		const outputPath = path.join(imagesDir, `${slug}.${isClip ? "gif" : "png"}`);

		console.log(`\n${"─".repeat(64)}\n${name}`);
		console.log(`  Show: ${guidance.show}`);
		if (guidance.url) console.log(`  URL:  ${guidance.url}`);
		if (guidance.note) console.log(`  Note: ${guidance.note}`);
		console.log(`  Save: ${path.relative(root, outputPath)}`);

		const answer = await rl.question(
			isClip
				? "\n  Set the screen up, then press Enter to start a 3s countdown (s to skip): "
				: "\n  Set the screen up, then press Enter to capture (s to skip): ",
		);
		if (answer.trim().toLowerCase() === "s") {
			console.log("  Skipped.");
			continue;
		}

		let captured = outputPath;

		if (isClip) {
			for (let n = 3; n > 0; n--) {
				process.stdout.write(`  ${n}... `);
				await sleep(1000);
			}
			await obs.request("StartRecord");
			console.log("\n  ● Recording.");

			await rl.question("  Press Enter to stop: ");
			const { outputPath: recordedPath } = await obs.request("StopRecord");

			// Older obs-websocket builds stop the recording without reporting
			// where it landed. Nothing is lost when that happens — the file is
			// in OBS's configured recording folder — but there is no path to
			// hand to ffmpeg, so say so instead of failing obscurely.
			if (!recordedPath) {
				console.log(
					"  ! OBS did not report the recording path. The clip is in your OBS\n" +
						"    recording folder (Settings -> Output -> Recording Path);\n" +
						"    convert it by hand, or drop it in as the GIF yourself.",
				);
				continue;
			}

			console.log(`  ■ Stopped: ${recordedPath}`);

			if (!ffmpeg) {
				console.log(
					`  ! ffmpeg not found, so no GIF was made. Install it with\n` +
						`      winget install Gyan.FFmpeg\n` +
						`    then re-run with --only ${slug} --force, or convert the file above by hand.`,
				);
				continue;
			}

			console.log("  Converting to GIF...");
			if (!convertToGif(ffmpeg, recordedPath, outputPath)) {
				console.log("  ✗ ffmpeg failed; the raw recording is still at the path above.");
				continue;
			}
			captured = outputPath;
		} else {
			await obs.request("SaveSourceScreenshot", {
				sourceName: scene,
				imageFormat: "png",
				imageFilePath: outputPath,
				imageWidth: STILL_WIDTH,
				imageHeight: STILL_HEIGHT,
			});
		}

		console.log(`  ✓ Saved ${path.relative(root, captured)}`);

		// The schema requires alt text whenever an image is present, so it is
		// asked for here rather than left as a follow-up that gets forgotten
		// and then filled in with something useless like "screenshot".
		let alt = "";
		while (alt.trim() === "") {
			alt = await rl.question("  Alt text (what the image shows, required): ");
			if (alt.trim() === "") console.log("  Alt text cannot be empty — the schema rejects it.");
		}

		writeImageFrontmatter(project.filePath, `/images/projects/${path.basename(captured)}`, alt.trim());
		console.log(`  ✓ Wrote image front matter into ${path.relative(root, project.filePath)}`);
	}
} finally {
	rl.close();
	obs.close();
}

console.log("\nDone. Run `npm run build` to confirm the images resolve.");
