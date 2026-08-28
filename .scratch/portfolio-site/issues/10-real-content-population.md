# 10 — Real content population

**What to build:** The site shows Newton's actual content instead of placeholders — real bio, real experience history, real Fresh-Flat and Note-Pilot project entries with honest contribution write-ups, and a real downloadable resume.

**Blocked by:** 04, 05, 06, 07, 08, 09

**Status:** resolved

- [x] About section bio is Newton's real copy, sourced from `NewtonCV3` (`C:\Users\sageb\Documents\Projects\Newton CV\CV3`) unless Newton specifies otherwise
- [x] Experience collection populated with Newton's real role history from `NewtonCV3`
- [x] Projects collection populated with real Fresh-Flat and Note-Pilot entries, each with an honest `contribution` field reflecting Newton's specific individually-attributed work (Fresh-Flat: flat/invite CRUD API, join/leave-flat features; Note-Pilot: primary build)
- [x] Fresh-Flat entry includes its live demo URL (`fresh-flat.vercel.app`)
- [x] Note-Pilot entry includes its live demo URL if ticket 11 has completed by this point; otherwise left blank and added as a follow-up edit
- [x] Real resume PDF (sourced from `NewtonCV3.pdf`) wired into the Contact section's download link
- [x] Placeholder/lorem content and fixture entries fully removed

## Comments

Verified: `src/content/about` — About copy is real (Software Engineering grad, Otago, Wellington-based). `src/content/experience/` has three real roles (Dunedin Taekwondo, Construction Sciences NZ, Remojo Tech), no fixtures remain. `src/content/projects/fresh-flat.md` and `note-pilot.md` both have real `contribution` write-ups and live `liveDemoUrl`s (Note-Pilot's added as a ticket-11 follow-up, commit `67d9414`, as this ticket anticipated). `public/resume.pdf` is a real 187KB PDF. No lorem/placeholder content remains in any collection entry.
