Status: ready-for-agent

# Portfolio Site

## Problem Statement

Newton is job-hunting but has no single place to point recruiters and hiring managers. His work is scattered across GitHub repos — mostly unlabeled University of Otago team coursework — with no narrative, no way to quickly scan his skills and experience, and no working demo for his most technically sophisticated project (Note-Pilot has never been deployed).

## Solution

Build and ship a single-page Astro portfolio site (About → Experience → Skills → Projects → Contact) with an adaptive dark/light theme, individual detail pages for featured projects, and a downloadable resume — while separately redeploying Note-Pilot with a fresh, Newton-administered database so it has a working demo link to feature.

## User Stories

1. As a recruiter, I want to land on a single-page overview of Newton's background, so that I can quickly decide whether to reach out.
2. As a recruiter, I want to see an About section with a short bio, so that I understand who Newton is beyond a resume bullet list.
3. As a recruiter, I want to see an Experience section, so that I understand Newton's history and progression.
4. As a recruiter, I want a dedicated Skills section separate from prose, so that I can scan his tech stack in seconds.
5. As a recruiter, I want the Skills section to reflect both his modern JS/TS stack and his Java/OOP coursework background, so that I get an accurate picture of his range.
6. As a recruiter, I want a Projects section showing his best work, so that I can judge real shipped output, not just claims.
7. As a recruiter, I want each featured project to link to a dedicated detail page, so that I can go deeper on the ones that interest me without cluttering the main page.
8. As a recruiter, I want a working live demo link for featured projects where available, so that I can try the product myself rather than just read about it.
9. As a recruiter, I want project entries to honestly indicate they were team coursework and specify Newton's individual contribution, so that I can accurately judge his role rather than assume solo ownership.
10. As a recruiter, I want a clear way to contact Newton, so that I can reach out without hunting for an email address.
11. As a recruiter, I want to download Newton's resume as a PDF, so that I have something to forward internally or attach to an ATS.
12. As a site visitor, I want the site to default to my OS's light/dark preference, so that it matches the rest of my system without me doing anything.
13. As a site visitor, I want a manual toggle to override the default theme, so that I can choose the look I prefer regardless of my system setting.
14. As a site visitor, I want my manually chosen theme to persist across visits, so that I don't have to re-toggle it every time.
15. As a site visitor on mobile, I want the single-page layout to remain usable and readable on a small screen, so that I can review Newton's background from my phone.
16. As a site visitor, I want anchor navigation between sections (About/Experience/Skills/Projects/Contact), so that I can jump directly to what I care about.
17. As Newton, I want the site's content (experience entries, project entries) to live as structured, schema-validated data, so that I can add or edit content without risking a malformed page.
18. As Newton, I want invalid content (missing fields, bad slugs) to fail at build time, so that I catch content mistakes before they reach a live visitor.
19. As Newton, I want each project entry to require an explicit "my contribution" field distinct from the general project description, so that the honest team-project framing is structurally enforced, not just a writing convention I might forget.
20. As Newton, I want the resume PDF served by the site to be sourced from my latest CV, so that recruiters always see my current information.
21. As Newton, I want Note-Pilot deployed with a database I administer, so that I control its data and can keep the demo running independently of any teammate's infrastructure.
22. As Newton, I want Note-Pilot's AI features to work in the deployed demo, so that recruiters see the full feature set, not a degraded version.
23. As Newton, I want to defer the portfolio site's own hosting decision, so that I can build and review the site locally before committing to a host or cost.
24. As Newton, I want the site to exclude analytics for now, so that the initial build stays simple and I can add tracking later once hosting is decided.
25. As Newton, I want the project data model to support projects with no live demo (e.g. desktop GUI apps), so that ProductCatalouge and BasicImageEditor can be added later without a schema change.

## Implementation Decisions

- **Framework**: Astro, static output. No server-side app logic lives in this repo — the site is content-driven.
- **Page structure**: A single scrolling page at `/` composed of About, Experience, Skills, and Projects sections plus a Contact section, connected by anchor navigation. Each featured project additionally gets its own route (`/projects/[slug]`) generated via `getStaticPaths` from the projects content collection.
- **Content model**: Two Astro content collections, each with a Zod schema:
  - `experience` — role entries (org, title, dates, description).
  - `projects` — project entries. Schema must include, at minimum: name, slug, tech stack tags, one-line description, a **required, structurally distinct `contribution` field** (Newton's specific individual contribution — separate from the general `description`, to enforce the honest team-project framing decided in `CONTEXT.md` rather than relying on prose convention), an optional live demo URL, and an optional "status" or "held-back" flag for projects not yet ready to feature (supports adding ProductCatalouge/BasicImageEditor later without a schema change).
  - Skills section content is derived from the tech-stack tags already present across `experience` and `projects` entries rather than duplicated as a third hand-maintained list, unless review during implementation finds that unworkable, in which case a `skills` collection may be introduced.
- **Theme handling**: An isolated, framework-free module (not tied to any component) providing theme initialization and persistence: read `prefers-color-scheme` as the default, check for a stored manual override, and expose a toggle that persists the override (e.g. to `localStorage`). This module is the "secondary seam" — kept separate from rendering so it can be reasoned about and tested independently of the DOM/build pipeline.
- **Contact/CTA**: A mailto link plus a downloadable resume PDF. No contact form, no third-party form backend, no server endpoint.
- **Analytics**: None wired up in this pass.
- **Hosting**: Out of scope for this build — the site is developed and reviewed locally. Vercel is the likely eventual target (Astro has zero-config support there) but the decision and setup are deferred.
- **Note-Pilot redeploy** (separate from the portfolio site's own codebase, but required for the Projects section to link to a working demo):
  - Deploy target: Vercel.
  - Database: a new Postgres instance on **Neon**, administered by Newton. The existing Prisma schema's `url`/`directUrl` split is compatible as-is — no schema changes needed to move off the original Supabase instance it was built against.
  - The repo has no `prisma/migrations` folder yet, so the new database needs an initial migration created against it (`prisma migrate dev --name init`) before any `migrate deploy` workflow will apply.
  - Additional required env var beyond the database: an OpenRouter API key (used in source as `NVIDIA_AI_API`) for the AI chat/study-guide features. The referenced model is free-tier, but a key must still be provisioned.
  - Fresh-Flat's existing demo (`fresh-flat.vercel.app`) is already live and working — no redeploy work needed there, only a README rewrite (a content task, not a code change, tracked separately).
- **Resume source of truth**: `C:\Users\sageb\Documents\Projects\Newton CV` contains three LaTeX CV versions (`CV1`, `CV2`, `CV3`) and a `CoverLetter`. `CV3` (`NewtonCV3.tex` / `NewtonCV3.pdf`) is the most recently modified and is the canonical source for both the About/Experience content and the downloadable resume PDF, unless Newton says otherwise when content collection happens.

## Testing Decisions

Good tests here check external behavior (does invalid content actually fail validation, does the theme module produce the right output for a given input) rather than internal implementation details (not "does this component call this specific function").

This is a greenfield repo with no existing test suite, so this build establishes the first testing pattern. **Vitest** is the natural choice — it's the standard runner for Astro projects and needs no additional adapter for testing plain content-collection schemas and framework-free modules.

- **Content collection schemas** (`experience`, `projects`): parse representative valid and invalid fixtures through each Zod schema and assert accept/reject. Specifically cover: a project entry missing the required `contribution` field is rejected; a project entry with only `description` and no `contribution` is rejected (these must not be satisfiable by the same field); duplicate slugs across the `projects` collection are caught; a project entry with a `held-back` status is accepted without a live demo URL.
- **Theme module**: pure unit tests against the isolated theme module — given a mocked `prefers-color-scheme` result and a mocked/absent stored override, assert the initial theme returned; given a toggle call, assert the new theme is returned and the persistence call is made. No DOM or browser needed since the module is framework-free.
- **Build verification**: a lightweight smoke check that `astro build` completes successfully and that every non-held-back entry in the `projects` collection produces a corresponding `/projects/[slug]` route. This is verification, not a dedicated test suite — rendered markup/visual output is not under test.
- No tests are planned for the Note-Pilot redeploy itself (infrastructure/config work, not application logic) beyond manually confirming the deployed demo loads and its AI feature responds.

## Out of Scope

- Final hosting choice and domain purchase for the portfolio site itself.
- Analytics integration.
- A contact form or any server-side backend.
- Adding ProductCatalouge or BasicImageEditor to the live Projects section (schema should permit it later; the content/write-up work is deferred).
- Producing a standalone solo project.
- The actual content/rewrite of Fresh-Flat's README (tracked as a separate content task, not a code change here).
- Pixel-level visual design specifics (exact color palette, typography choices) beyond the agreed direction (dark-navy/minimal base, adaptive light/dark, monospace-accented headings) — these are finalized during implementation, not blocking this spec.

## Further Notes

- Full narrative and rationale behind these decisions lives in `CONTEXT.md` at the repo root — read it before starting implementation.
- CV source directory: `C:\Users\sageb\Documents\Projects\Newton CV`. Three LaTeX CV versions exist (`CV1` dated Jan 2026, `CV2` dated Jul 2026, `CV3` dated Aug 2026) plus a `CoverLetter`. Treat `CV3` as canonical unless told otherwise.
- Note-Pilot's repo has no `.env.example`; the required env vars (`DATABASE_URL`, `DIRECT_URL`, `NVIDIA_AI_API`) were determined by reading source directly, not documentation — worth adding an `.env.example` to that repo as a side effect of the redeploy work, for future maintainability.
- The honest team-project framing (Q9 in the original grilling session) is the one decision with real structural teeth in this spec — it's enforced via a required schema field (`contribution`), not left as a content-writing guideline, so it can't silently regress as projects are added later.
