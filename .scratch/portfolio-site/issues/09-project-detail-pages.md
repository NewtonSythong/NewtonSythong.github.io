# 09 — Project detail pages

**What to build:** Clicking a project in the Projects list takes a visitor to a dedicated page for that project showing its full detail — contribution, tech tags, and live demo link where available.

**Blocked by:** 07

**Status:** ready-for-agent

- [ ] `/projects/[slug]` routes generated via `getStaticPaths` from the `projects` collection
- [ ] Detail page shows name, description, `contribution`, tech tags, and live demo link (when present)
- [ ] Held-back projects do not generate a public route (or are excluded from being linked to, per how held-back is defined)
- [ ] Every non-held-back entry in the `projects` collection produces a working route — verified as part of `astro build`
- [ ] The Projects list section (07) links correctly to each generated detail page
