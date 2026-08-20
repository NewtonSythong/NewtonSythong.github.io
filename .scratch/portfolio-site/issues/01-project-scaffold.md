# 01 — Project scaffold & tooling

**What to build:** Set up the Astro project itself. From the user's perspective, this ticket makes `npm run dev` boot a running (mostly blank) site with a persistent nav shell, and `npm test` run a Vitest suite. Nothing is user-facing content-wise yet, but every later ticket depends on this baseline existing.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Astro project initialized with TypeScript
- [ ] Vitest configured and runnable via `npm test`
- [ ] A base `Layout` component exists providing the shared page shell (head/meta, nav placeholder, main content slot) that every section/page will render inside
- [ ] `npm run dev` serves the site locally without errors
- [ ] `npm run build` succeeds on the empty scaffold
