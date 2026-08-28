# 08 — Contact section

**What to build:** A visitor can email Newton directly and download his resume PDF from the Contact section.

**Blocked by:** 01, 03

**Status:** resolved

- [x] Contact section renders a `mailto:` link
- [x] Contact section renders a resume PDF download link (placeholder PDF asset at this stage — real resume wired in ticket 10)
- [x] Reachable via an anchor (`#contact`)
- [x] Visually correct in both light and dark theme states

## Comments

Verified: `src/components/Contact.astro` renders a `mailto:` link and a `/resume.pdf` download link. `public/resume.pdf` exists (187KB, real PDF sourced from NewtonCV3 per ticket 10) — no placeholder remains.
