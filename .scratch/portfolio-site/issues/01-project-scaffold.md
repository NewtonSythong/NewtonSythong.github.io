# 01 — Project scaffold & tooling

**What to build:** Set up the Astro project itself. From the user's perspective, this ticket makes `npm run dev` boot a running (mostly blank) site with a persistent nav shell, and `npm test` run a Vitest suite. Nothing is user-facing content-wise yet, but every later ticket depends on this baseline existing.

**Blocked by:** None — can start immediately

**Status:** resolved

- [x] Astro project initialized with TypeScript
- [x] Vitest configured and runnable via `npm test`
- [x] A base `Layout` component exists providing the shared page shell (head/meta, nav placeholder, main content slot) that every section/page will render inside
- [x] `npm run dev` serves the site locally without errors
- [x] `npm run build` succeeds on the empty scaffold

## Comments

Verified against the repo on 2026-08-28: `astro.config.mjs`/`tsconfig.json` present, `package.json` has `dev`/`build`/`test` scripts, `src/layouts/Layout.astro` provides the shared shell. `npm test` (22/22) and a full build both pass as of this verification pass — closing out this and tickets 02–10 together after confirming each against the current codebase.
