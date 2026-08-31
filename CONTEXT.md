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
| **Fresh-Flat** | Next.js + Supabase + OpenRouter | Live demo `fresh-flat.vercel.app` pending migration (ticket 13) | README rewritten (ticket 12). Recipe generation moved from OpenAI to OpenRouter's free tier on 2026-08-31 after the original OpenAI key proved revoked. Newton's contributions: flat/invite CRUD API, join/leave-flat features. |
| **Note-Pilot** | Next.js 15 + Prisma 6, AI study/notes tool | Deployed: `note-pilot-sage.vercel.app` | Most technically sophisticated repo, most recent activity. Redeployed under ticket 11 with a Newton-administered Neon database. |
| **ProductCatalouge** | Java/Jooby + Vue e-commerce app | No live demo, localhost-only | Promoted from held-back once its write-up existed (commit `1b8b367`). Solo work on a staff-provided starter scaffold (Gradle/Vue vendor files only). |
| **BasicImageEditor ("ANDIE")** | Java desktop image editor | No live demo — GUI app, not a web app | Promoted from held-back once its write-up existed (commit `1b8b367`). 5-person team project; Newton's features: rotate/flip, block-averaging, co-built multilingual support. |

### Solo project gap

Flagged as a credibility gap (every current project is team work) but explicitly **not a launch blocker**. A standalone solo project can be added post-launch.

## Note-Pilot deployment

Separate from the portfolio site's own "decide hosting later" stance — Note-Pilot needs a working live demo link *now* to be featured.

- **Target host:** Vercel.
- **Database:** New Postgres instance on **Neon**, administered by Newton (originally built/tested against Supabase, but Neon was chosen for the new instance — same `url`/`directUrl` schema shape, so no code changes needed; generous free tier, no card required; first-party Vercel integration auto-populates env vars).
- **Migrations:** No `prisma/migrations` folder exists yet in the repo. Needs an initial `prisma migrate dev --name init` run against the new DB before `migrate deploy` will work.
- **Other required env vars:** An OpenRouter API key (used as `NVIDIA_AI_API`) for the AI chat/study-guide features — free-tier model (`nvidia/nemotron-3.5-lightning:free` — the code's actual model, corrected 2026-08-31), but a key must still be provisioned. No AWS/S3 credentials needed despite the SDK being listed as a dependency (unused in the live code paths checked).

## Open / deferred (not launch blockers)

- Final hosting choice for the portfolio site itself.
- Custom domain.
- A solo/independent project to strengthen the "independent initiative" signal (ProductCatalouge is solo work, but coursework-scaffolded rather than fully independent).
- Fresh-Flat's live demo URL going stale once ticket 13's Vercel/database migration lands — the URL in this file and in `src/content/projects/fresh-flat.md` will need updating then.
