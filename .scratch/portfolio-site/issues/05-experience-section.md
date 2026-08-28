# 05 — Experience section

**What to build:** A visitor scrolling the landing page sees an Experience section listing role entries pulled from the `experience` content collection, correct in both themes.

**Blocked by:** 02, 03

**Status:** resolved

- [x] Experience section renders entries from the `experience` collection (using fixture/placeholder entries at this stage)
- [x] Reachable via an anchor (`#experience`)
- [x] Visually correct in both light and dark theme states
- [x] Adding a new valid `experience` entry causes it to appear in the rendered list without further code changes

## Comments

Verified: `src/components/Experience.astro` renders `getCollection("experience")` with no per-entry hardcoding, sorted by `startDate`. Now populated with Newton's three real roles (ticket 10) instead of fixtures.
