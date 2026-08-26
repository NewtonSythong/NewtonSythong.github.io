# 13 — Fresh-Flat migration (new Vercel account, database TBD)

**What to build:** Fresh-Flat's live demo (`fresh-flat.vercel.app`) runs on infrastructure Newton doesn't administer, discovered in two parts: the Supabase project belongs to a former teammate's personal account (access has since been regained, but not yet verified as actually working), and — found after that — **the Vercel project itself is also on an account that isn't Newton's**. Same underlying problem ticket 11 solved for Note-Pilot, now with two axes instead of one: the site needs to move to a Vercel account Newton controls regardless of how the database question resolves, since the live URL and deploy access both depend on account ownership, not just the database.

**Blocked by:** None — separate repo, independent of the portfolio site build.

**Status:** ready-for-agent

- [ ] Decide the database path: reuse the original Supabase project (access regained, needs testing) or provision a fresh one (reconstructed schema already written)
- [ ] If reusing: confirm the original project actually works end-to-end before relying on it
- [ ] If fresh: apply `supabase/migrations/20260826160000_initial_schema.sql` against a new project
- [ ] Fresh-Flat imported into a Vercel project Newton administers (not a redeploy of the existing one — that account isn't his)
- [ ] `OPENAI_API_KEY` confirmed valid — worth checking it isn't also tied to the same inaccessible teammate account
- [ ] New live URL confirmed working end-to-end: sign up/sign in, create a flat, add a pantry ingredient, generate an AI recipe, save it
- [ ] This repo's README and NewtonProfile's `src/content/projects/fresh-flat.md` (`liveDemoUrl`) updated to the new URL — the old `fresh-flat.vercel.app` link goes stale the moment this migration happens

## Comments

Scope grew after the ticket was first opened: it started as a database-only problem (matching ticket 11's shape), then Newton found the Vercel account wasn't his either. The wizard was rebuilt around that — `NewtonSythong/Fresh-Flat` commit `80f7538` (superseding the earlier `925c2cc`, reverted at `a0e79b0` when the scope looked database-only) — and now always ends with a fresh Vercel import, branching only on the database question at the start (reuse the regained original project vs. provision new). Nothing has been run against real infrastructure yet either way.

The reconstructed schema (for the fresh-database branch) was reverse-engineered from every `.from(...)` call across `model/`, `controller/`, and `app/api/`, since no schema was ever committed in this repo and the original project has none either — 6 custom tables (`flats`, `flats_have_users`, `ingredients`, `users_have_ingredients`, `recipes`, `recipes_have_ingredients`) plus Supabase's built-in `auth.users`. Two of the app's embedded selects (`ingredients(name)`, `recipes_have_ingredients(...)`) require real foreign key constraints for PostgREST to resolve them — those are included. RLS is left off throughout, matching how the app evidently ran (every data access path goes through server-side code doing its own authorization). Not verified against a real Postgres instance (no local Postgres/Docker/Supabase CLI available) — reviewed carefully by hand instead.

Next step is on Newton: run `bash scripts/deploy-wizard.sh` from the Fresh-Flat repo in his own terminal.
