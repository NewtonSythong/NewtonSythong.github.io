# 04 — About section

**What to build:** A visitor scrolling the landing page sees an About section with Newton's bio, rendered correctly in both light and dark themes.

**Blocked by:** 01, 03

**Status:** resolved

- [x] About section renders within the shared `Layout`, reachable via an anchor (`#about`)
- [x] Section is visually correct in both light and dark theme states
- [x] Content is placeholder/lorem at this stage — real bio copy is out of scope here (see ticket 10)

## Comments

Verified: `src/components/About.astro` renders `#about` inside `Layout`, uses the shared theme-aware CSS custom properties (`--color-accent`, etc.), so it inherits correct light/dark rendering. Content is no longer placeholder — ticket 10 replaced it with real bio copy sourced from NewtonCV3, as that box anticipated.
