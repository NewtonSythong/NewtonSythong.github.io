# 02 — Content collections schema + validation tests

**What to build:** The `experience` and `projects` content collections exist with Zod schemas, so content authored later is validated at build/test time rather than trusted blindly. From the user's perspective: adding a malformed entry (missing the `contribution` field, a duplicate slug) causes a clear test/build failure instead of silently shipping.

**Blocked by:** 01

**Status:** resolved

- [x] `experience` collection schema defined (org, title, dates, description at minimum)
- [x] `projects` collection schema defined, requiring `name`, `slug`, tech-stack tags, `description`, and a `contribution` field that is structurally distinct from `description` (both required; the schema must not accept one satisfying the other)
- [x] `projects` schema supports an optional live demo URL and an optional held-back/status flag, so projects without a demo or not yet ready to feature validate cleanly
- [x] Vitest fixtures cover: a valid entry passes; a missing `contribution` fails; duplicate slugs across `projects` are caught
- [x] Tests runnable via `npm test`, independent of any rendered page

## Comments

Verified: `src/content/schemas.ts` (Zod schemas, `.refine` enforcing `contribution` ≠ `description`) and `src/content/collections.ts` (`withUniqueSlugs` loader wrapper, throws on duplicate slugs). Coverage confirmed in `schemas.test.ts` and `collections.test.ts` — all cases in the checklist have a corresponding test, all passing.
