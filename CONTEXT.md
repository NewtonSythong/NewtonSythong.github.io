# NewtonProfile — Context

Personal portfolio website for Newton Sythong (GitHub: [NewtonSythong](https://github.com/NewtonSythong)). This file is the shared source of truth for scope and decisions, established via a grilling interview on 2026-08-20. Treat it as living — update it as decisions change.

## Purpose

Job-hunting focused. Primary audience is recruiters/hiring managers. The site should give them a fast, credible read on Newton's skills and shipped work, with a clear path to contact.

## Stack & structure

- **Framework:** Astro — static-first, content-driven site, room to add framework islands later if needed.
- **Layout:** Single-page scroll on `/` — **About → Experience → Skills → Projects → Contact** — plus a dedicated detail page per featured project (`/projects/[slug]`).
- **Build/host:** Building locally for now. Hosting is deliberately undecided — pick the most cost-effective option (Vercel is the likely candidate given Astro's zero-config support there) once the site is ready to ship.

## Visual direction

Hybrid of three researched references (all verified live, from the [developer-portfolios](https://github.com/emmabostian/developer-portfolios) list):

- **Base aesthetic** — dark-navy, minimal, monospace-accented headings, sticky/anchor nav (per [brittanychiang.com](https://brittanychiang.com) and [cade.codes](https://cade.codes)).
- **Theme behavior** — adaptive light/dark, not dark-only. Defaults to the visitor's `prefers-color-scheme`, with a manual toggle to override (per [luca-felix.com](https://luca-felix.com)).
- **Project structure** — each featured project links to its own real detail page, not just an external repo link (also per Félix's site) — this is the one piece the Chiang/Kynaston references don't demonstrate.

## Sections

- **About** — bio.
- **Experience** — work/academic history.
- **Skills** — dedicated section, not folded into prose. Two natural clusters to represent: modern JS/TS full-stack (Next.js, Supabase, Prisma/Postgres, Tailwind) and Java/OOP fundamentals (Jooby, Swing/AWT).
- **Projects** — see below.
- **Contact** — email link + downloadable resume PDF as the primary CTA. No contact form, no third-party form backend.
- **Analytics** — skipped for now. Revisit once hosting is decided.

## Projects

All of Newton's current public repos are University of Otago team coursework — there is currently no solo/independent project. Decision: present this **honestly**, calling out Newton's specific contributions per project rather than implying solo ownership.

### Featured at launch

| Project | Stack | Status | Notes |
|---|---|---|---|
| **Fresh-Flat** | Next.js + Supabase | Live demo working: `fresh-flat.vercel.app` | README needs a public-facing rewrite (currently links to Otago-only SharePoint docs). Newton's contributions: flat/invite CRUD API, join/leave-flat features. |
| **Note-Pilot** | Next.js 15 + Prisma 6, AI study/notes tool | Not yet deployed — deployment is in scope for this project | See "Note-Pilot deployment" below. Most technically sophisticated repo, most recent activity. |

### Held back for later (not launch blockers)

- **ProductCatalouge** — Java/Jooby + Vue e-commerce app. No live demo, localhost-only currently.
- **BasicImageEditor ("ANDIE")** — Java desktop image editor. No live demo; would need screenshots/GIF since it's a GUI app, not a web app.

### Solo project gap

Flagged as a credibility gap (every current project is team work) but explicitly **not a launch blocker**. A standalone solo project can be added post-launch.

## Note-Pilot deployment

Separate from the portfolio site's own "decide hosting later" stance — Note-Pilot needs a working live demo link *now* to be featured.

- **Target host:** Vercel.
- **Database:** New Postgres instance on **Neon**, administered by Newton (originally built/tested against Supabase, but Neon was chosen for the new instance — same `url`/`directUrl` schema shape, so no code changes needed; generous free tier, no card required; first-party Vercel integration auto-populates env vars).
- **Migrations:** No `prisma/migrations` folder exists yet in the repo. Needs an initial `prisma migrate dev --name init` run against the new DB before `migrate deploy` will work.
- **Other required env vars:** An OpenRouter API key (used as `NVIDIA_AI_API`) for the AI chat/study-guide features — free-tier model (`nvidia/nemotron-nano-9b-v2:free`), but a key must still be provisioned. No AWS/S3 credentials needed despite the SDK being listed as a dependency (unused in the live code paths checked).

## Open / deferred (not launch blockers)

- Final hosting choice for the portfolio site itself.
- Custom domain.
- ProductCatalouge and BasicImageEditor polish + potential later inclusion.
- A solo/independent project to strengthen the "independent initiative" signal.
- Resume PDF — to be produced/finalized during content collection.
