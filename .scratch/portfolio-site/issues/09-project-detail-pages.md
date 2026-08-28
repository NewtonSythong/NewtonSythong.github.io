# 09 — Project detail pages

**What to build:** Clicking a project in the Projects list takes a visitor to a dedicated page for that project showing its full detail — contribution, tech tags, and live demo link where available.

**Blocked by:** 07

**Status:** resolved

- [x] `/projects/[slug]` routes generated via `getStaticPaths` from the `projects` collection
- [x] Detail page shows name, description, `contribution`, tech tags, and live demo link (when present)
- [x] Held-back projects do not generate a public route (or are excluded from being linked to, per how held-back is defined)
- [x] Every non-held-back entry in the `projects` collection produces a working route — verified as part of `astro build`
- [x] The Projects list section (07) links correctly to each generated detail page

## Comments

Verified: `src/pages/projects/[slug].astro` filters `getStaticPaths` to `status === "featured"` (a held-back project's route genuinely doesn't exist, not just unlinked). `npm run verify:build` (`astro build` + `scripts/verify-projects-build.mjs`) passes, confirming a real route exists for every featured entry — currently all 4: fresh-flat, note-pilot, basic-image-editor, product-catalouge.
