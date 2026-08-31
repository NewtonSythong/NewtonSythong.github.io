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
- [ ] Screenshots captured for Fresh-Flat, Note-Pilot and ProductCatalouge

## Comments

### 2026-08-31 — the code work is done; the rest needs a human

Everything an agent can do without a browser or a GUI is committed (`ProductCatalouge` commit `0f0bcbd`, plus the schema and rendering changes here).

**Why ProductCatalouge could not previously be deployed.** `JdbiDaoFactory` connected to `jdbc:h2:tcp://localhost/lab12` — H2 in TCP server mode, expecting a separate process started by hand from `h2-windows.bat`. No deployment host has that. Worse, `schema.sql` contained no `INSERT`s at all, so even a working connection produced an empty catalogue with nothing to browse. The default is now an in-memory database seeded from a new `seed.sql`; `JDBC_URI` still overrides it for a real database.

One non-obvious trap: `rootProject.name` is `"INFO202 Milestone 2"`, and Gradle names the jar from it. The space lands in an unquoted `CLASSPATH=` assignment in the generated start script, so the packaged launcher dies with `Milestone: command not found` — the app compiles and `gradlew run` works fine, but the *distributable* is broken. Pinning `applicationName` and `jar.archiveBaseName` to `productcatalogue` fixes it. Worth remembering: `gradlew run` passing is not evidence that `installDist` produces something runnable.

Since Docker isn't installed locally, the container was validated by copying the `installDist` output plus `static/` and the SQL files into a replica of the image's directory layout and running the launcher there. Port override honoured, 9 products and 3 categories served, `/api/*` still 401 without credentials, static images resolve.

**Why ANDIE gets a capture rather than a deployment.** It is Swing. The realistic in-browser option is CheerpJ, which compiles the JAR to WebAssembly and does genuinely run Swing — but it pulls a large runtime, is slow on first load, and its virtual filesystem means sample images must be preloaded for the file chooser to be useful. For a recruiter giving the page seconds, a GIF that renders instantly is the better artefact, and it solves the imagery problem at the same time. CheerpJ stays available as a later stretch if the interactive version is wanted for its own sake.

**On the image schema.** `alt` is required whenever `src` is present, rejected by the schema rather than left to convention — the same reasoning that makes `contribution` a required field. An image added in a hurry should not silently ship without a description. Card thumbnails pass `alt=""` and `aria-hidden` deliberately, because the heading link beside them already names the project; the detail-page hero uses the real `alt`, since there it carries information.

Images live in `public/images/projects/` and are referenced by root-relative path rather than imported as build assets, so adding one is a file copy plus two lines of front matter. See that directory's README.
