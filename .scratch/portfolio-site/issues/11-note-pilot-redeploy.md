# 11 — Note-Pilot redeploy

**What to build:** Note-Pilot is live on Vercel with a database Newton administers, so it has a working demo link and functioning AI features for the portfolio to point to.

**Blocked by:** None — can start immediately (separate repo, independent of the portfolio site build)

**Status:** resolved

- [x] New Postgres database provisioned on Neon, administered by Newton
- [x] Initial migration created and applied against the new database (`prisma migrate dev --name init`, since no `prisma/migrations` folder exists yet)
- [x] OpenRouter API key provisioned and set as `NVIDIA_AI_API` in the deployment environment
- [x] Note-Pilot deployed to Vercel and reachable at a live URL
- [x] AI chat/study-guide feature confirmed working against the live deployment

## Comments

Live at https://note-pilot-sage.vercel.app. Deployment surfaced several bugs beyond the wizard's own checklist, all fixed and pushed to `NewtonSythong/Note-Pilot`:

- Vercel blocked the build on a flagged-vulnerable `next@15.5.3` — bumped to `15.5.24` (latest patch on the same major).
- `/api/signup` 500'd with no server-side error logging — added the `console.error(error)` every other auth route already had, which is what surfaced the next bug.
- `DATABASE_URL` was resolving empty in Production — the env vars pasted during Vercel import hadn't saved correctly; re-added and redeployed.
- The PDFs tab called the deprecated `/api/upload` route (its own source comment says "IGNORE!!! CURRENTLY USING UPLOAD_V2.TS"), which writes its temp file to the working directory — fatal on Vercel's read-only filesystem (`EROFS`). Pointed it at `/api/upload_v2`, which already used `os.tmpdir()` correctly.
- Every AI route (`aiChat`, `flashcards`, `studyguides`, `summaries`, `glossary`, `problemsets`, `generateContent`) was hardcoded to `nvidia/nemotron-nano-9b-v2:free`, since removed from OpenRouter ("No endpoints found"). Swapped to `nvidia/nemotron-3.5-lightning:free`, verified working live.

Confirmed by Newton: signup, chat, flashcards, study guide, summaries, and glossary all generate correctly against the live deployment. Portfolio site's `note-pilot.md` updated with the live demo URL (`NewtonProfile` commit `67d9414`).
