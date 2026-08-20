# 03 — Theme system

**What to build:** A visitor's theme preference is respected and controllable. From the user's perspective: the site loads in your OS's light/dark preference by default, and a visible toggle lets you override it, with your choice remembered on your next visit.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Framework-free theme module exposes theme initialization (reads `prefers-color-scheme`, checks for a stored override) and a toggle function
- [ ] Toggle function persists the chosen theme (e.g. `localStorage`) and returns/applies the new theme
- [ ] Unit tests cover the module in isolation (mocked media-query result, mocked/absent stored value) — no DOM/browser required
- [ ] A toggle UI control is wired into the base `Layout` and visibly switches the site's theme when clicked
- [ ] Reloading the page after toggling preserves the manually chosen theme rather than reverting to system default
