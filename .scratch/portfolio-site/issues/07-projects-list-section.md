# 07 — Projects list section

**What to build:** A visitor sees a Projects section listing featured (non-held-back) projects from the `projects` collection, each showing its honest description/contribution summary and tech tags.

**Blocked by:** 02, 03

**Status:** resolved

- [x] Projects list section renders non-held-back entries from the `projects` collection (fixture/placeholder entries at this stage)
- [x] Held-back entries (status flag set) do not appear in the list
- [x] Reachable via an anchor (`#projects`)
- [x] Visually correct in both light and dark theme states
- [x] Each listed project links out to its detail page location (route itself built in ticket 09)

## Comments

Verified: `src/components/Projects.astro` filters to `status === "featured"` before rendering, linking each entry to `/projects/${slug}`. Note: as of this check, all 4 current project entries (Fresh-Flat, Note-Pilot, ProductCatalouge, BasicImageEditor) are `status: "featured"` — the held-back filter path exists and is exercised by `schemas.test.ts`, but nothing in the live collection currently uses it, since ProductCatalouge/BasicImageEditor moved from held-back to featured in a later, deliberate decision (see commit `1b8b367`). Worth updating `CONTEXT.md`'s now-stale "Held back for later" section separately.
