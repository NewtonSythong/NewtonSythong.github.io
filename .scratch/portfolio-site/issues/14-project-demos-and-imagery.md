# 14 — Make ProductCatalouge and ANDIE viewable, and add project imagery

**What to build:** Two of the four featured projects have nothing a visitor can look at. ProductCatalouge and BasicImageEditor ("ANDIE") are both listed as "no live demo, localhost-only", so a recruiter reading those cards has only prose. Separately, the Projects section has no imagery at all, which Newton flagged as looking bland.

The two projects need different treatments, because only one of them is a web app:

- **ProductCatalouge** is a Jooby/Netty server that already serves its own frontend, so it can genuinely be deployed.
- **ANDIE** is a Java Swing desktop application (38 source files, `JFileChooser`/`ImageIO`/`File` throughout). It cannot become a web app without a rewrite, so the goal is to *show* it rather than host it — a screen capture, which doubles as the project imagery.

**Blocked by:** None.

**Status:** ready-for-human

- [x] ProductCatalouge runs without a lab H2 server — in-memory database, seeded at startup, `JDBC_URI` override retained
- [x] ProductCatalouge binds `$PORT` on `0.0.0.0` and ships a `Dockerfile`
- [x] Seed data written (9 products, 3 categories, a `demo`/`demo1234` account) so the deployed catalogue isn't empty
- [x] Verified by running the packaged app from a replica of the container's directory layout
- [x] `projects` collection accepts an optional `image` with a **required** `alt`, rendered as a 16:9 card thumbnail and an uncropped hero on detail pages
- [x] ProductCatalouge deployed to a free JVM host, and its `liveDemoUrl` + `CONTEXT.md` row updated
- [ ] ANDIE screen capture recorded and added as its project image
- [x] Screenshots captured for Fresh-Flat, Note-Pilot and ProductCatalouge

## Comments

### 2026-08-31 — the code work is done; the rest needs a human

Everything an agent can do without a browser or a GUI is committed (`ProductCatalouge` commit `0f0bcbd`, plus the schema and rendering changes here).

**Why ProductCatalouge could not previously be deployed.** `JdbiDaoFactory` connected to `jdbc:h2:tcp://localhost/lab12` — H2 in TCP server mode, expecting a separate process started by hand from `h2-windows.bat`. No deployment host has that. Worse, `schema.sql` contained no `INSERT`s at all, so even a working connection produced an empty catalogue with nothing to browse. The default is now an in-memory database seeded from a new `seed.sql`; `JDBC_URI` still overrides it for a real database.

One non-obvious trap: `rootProject.name` is `"INFO202 Milestone 2"`, and Gradle names the jar from it. The space lands in an unquoted `CLASSPATH=` assignment in the generated start script, so the packaged launcher dies with `Milestone: command not found` — the app compiles and `gradlew run` works fine, but the *distributable* is broken. Pinning `applicationName` and `jar.archiveBaseName` to `productcatalogue` fixes it. Worth remembering: `gradlew run` passing is not evidence that `installDist` produces something runnable.

Since Docker isn't installed locally, the container was validated by copying the `installDist` output plus `static/` and the SQL files into a replica of the image's directory layout and running the launcher there. Port override honoured, 9 products and 3 categories served, `/api/*` still 401 without credentials, static images resolve.

**Why ANDIE gets a capture rather than a deployment.** It is Swing. The realistic in-browser option is CheerpJ, which compiles the JAR to WebAssembly and does genuinely run Swing — but it pulls a large runtime, is slow on first load, and its virtual filesystem means sample images must be preloaded for the file chooser to be useful. For a recruiter giving the page seconds, a GIF that renders instantly is the better artefact, and it solves the imagery problem at the same time. CheerpJ stays available as a later stretch if the interactive version is wanted for its own sake.

**On the image schema.** `alt` is required whenever `src` is present, rejected by the schema rather than left to convention — the same reasoning that makes `contribution` a required field. An image added in a hurry should not silently ship without a description. Card thumbnails pass `alt=""` and `aria-hidden` deliberately, because the heading link beside them already names the project; the detail-page hero uses the real `alt`, since there it carries information.

Images live in `public/images/projects/` and are referenced by root-relative path rather than imported as build assets, so adding one is a file copy plus two lines of front matter. See that directory's README.

### 2026-09-02 — tooling added for the two remaining boxes

The last two items are both "point a camera at a screen", which is why they had stalled. `scripts/capture-project-media.mjs` (`npm run capture`) now drives OBS over obs-websocket to do the parts that do not need a human.

It automates consistent framing (each shot is taken of the OBS *scene*, not the source, so all four come out at the same 16:9 crop regardless of how the underlying window is sized), the filenames and save location, record start/stop for the ANDIE clip, the ffmpeg palette-GIF conversion, and the `image:` front-matter edit — which is the step most likely to be forgotten once the screenshots are sitting in a folder. It prompts for alt text and refuses an empty one, matching what the schema enforces.

It does not navigate or log into the apps. OBS captures a window, it cannot drive one, so the script stops before each capture and waits.

The front-matter writer is the one part that mutates `src/content/`, so it lives in `scripts/lib/frontmatter.mjs` with unit tests (9 cases): round-tripping through js-yaml, replacing rather than duplicating an existing block, escaping quotes and colons in alt text, treating `$&`-style replacement syntax as literal, preserving CRLF, and rejecting empty alt. Verified end-to-end by patching a real entry, building, confirming the card thumbnail rendered, and reverting.

**Newton's machine still needs two one-time steps:** obs-websocket has never been enabled (OBS -> Tools -> WebSocket Server Settings), and there is no ffmpeg on PATH — without it the ANDIE recording is still made and left in place, just not converted. `winget install Gyan.FFmpeg` covers it.

### 2026-09-02 — obs-websocket credentials live in two different places

First real run failed with "OBS requires a websocket password but none was found", despite the server being enabled and reachable. Cause: OBS has moved this file between versions. OBS 28-29 (this machine runs 29.1.1) keep the websocket settings in an `[OBSWebSocket]` section of `global.ini` with PascalCase INI keys; OBS 30+ moved them to `plugin_config/obs-websocket/config.json` with snake_case JSON keys. The script only knew about the newer layout.

`scripts/lib/obs-config.mjs` now reads both, newest-first, and takes the port from the same source so neither has to be passed by hand. Seven tests cover it.

Worth noting one of those tests earned its keep immediately. The section regex used `$` under the `/m` flag, where `$` means end-of-*line*, so the match ended at the section's first entry and the password was never reached. It happened to pass on a fixture where the password was the first key — which is exactly the shape a quick manual check would have used. `(?![\s\S])` is the end-of-input assertion that was actually wanted.

### 2026-09-02 — imagery landed for three of the four projects

Newton captured eleven 1920x1080 screenshots by hand rather than through the OBS script. Ten are in use; one was a duplicate of another with the mouse cursor in frame.

Each project gets one headline capture, chosen to match the sentence its card already makes: Fresh-Flat shows a generated recipe (the card text promises "AI-generated recipes from what's on hand"), Note-Pilot shows seven generated summary sections, ProductCatalouge shows the cart with a running total and a checkout button — the cart and checkout frontend being Newton's own contribution.

The schema gained an optional `gallery` array so the remaining six shots have somewhere to live. It renders on the detail page only: a recruiter skimming the list wants one clear look per project, and the rest of the tour is for whoever clicks through. Gallery images are shown at their natural aspect ratio rather than cropped, since cropping is what keeps the *cards* tidy and here the point is to see the thing properly.

**On cropping.** Full-window captures are mostly empty below the fold, and content spans the full width because of each app's nav bar, so no tight 16:9 box exists. Content bounds were measured programmatically (decode to raw RGB via ffmpeg, treat the bottom-right pixel as background, find the bounding box of everything that differs) rather than eyeballed, then each image was trimmed vertically to its content. Cards crop to 16:9 from the centre, so each headline capture was checked to confirm its subject survives that crop. The cart needed a taller crop than its content strictly required, because a tight one cut the nav and left the table's thumbnails and subtotal column outside the centre crop.

**A trap worth recording.** Adding `gallery` with a `.default([])` broke the build for the one project without a gallery, with `Cannot read properties of undefined (reading 'length')`. Astro's content layer caches parsed entries in `node_modules/.astro/data-store.json`, keyed on each source file's digest plus a `content-config-digest` — and that config digest covers `src/content.config.ts` only, **not** the `src/content/schemas.ts` it imports. So the three files edited that day were re-parsed and got the new default, while the untouched `basic-image-editor.md` was served from cache without it. Deleting `.astro/` does not help; the store lives under `node_modules/`. Any future schema change that adds a default needs `rm node_modules/.astro/data-store.json`, or an edit to every content file. A clean CI checkout is unaffected.

`verify-projects-build.mjs` now also asserts that every `image`/`gallery` path is actually present in `dist/`. These are hand-written root-relative paths served straight from `public/`, so nothing else would catch a typo — it would just ship a broken image. Confirmed it fails and exits 1 when a file is removed.

Still outstanding: the ANDIE screen capture. It is the only featured project with no imagery, and it needs the Swing app recorded rather than a browser screenshot.
