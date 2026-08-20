# 06 — Skills section

**What to build:** A visitor sees a dedicated Skills section listing Newton's tech stack, derived from the tags already present on `experience` and `projects` entries rather than a separately hand-maintained list.

**Blocked by:** 02, 03

**Status:** ready-for-agent

- [ ] Skills section derives its displayed tags from the tech-stack tags on `experience` and `projects` collection entries
- [ ] Reachable via an anchor (`#skills`)
- [ ] Visually correct in both light and dark theme states
- [ ] Adding a new tag to a collection entry causes it to appear in the Skills section without further code changes (or, if a dedicated `skills` collection was introduced instead per the spec's fallback, that decision is noted here)
