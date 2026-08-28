# 06 — Skills section

**What to build:** A visitor sees a dedicated Skills section listing Newton's tech stack, derived from the tags already present on `experience` and `projects` entries rather than a separately hand-maintained list.

**Blocked by:** 02, 03

**Status:** resolved

- [x] Skills section derives its displayed tags from the tech-stack tags on `experience` and `projects` collection entries
- [x] Reachable via an anchor (`#skills`)
- [x] Visually correct in both light and dark theme states
- [x] Adding a new tag to a collection entry causes it to appear in the Skills section without further code changes (or, if a dedicated `skills` collection was introduced instead per the spec's fallback, that decision is noted here)

## Comments

Verified: `src/components/Skills.astro` derives its tag set from `getCollection("experience")` + `getCollection("projects")` with no separate hand-maintained list, as the spec's default path called for — no fallback `skills` collection was needed. Ticket 13's commit history notes this also picked up Newton's Java/OOP tags automatically once ProductCatalouge/BasicImageEditor were added, with no code change required — direct proof the "no further code changes" bar holds.
