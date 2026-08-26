# 13 — Fresh-Flat redeploy (fresh database)

**What to build:** Fresh-Flat's live demo (`fresh-flat.vercel.app`) points at a Supabase project owned by a former teammate's personal account, which Newton has confirmed is unreachable. Same underlying problem ticket 11 solved for Note-Pilot — the demo needs a database Newton actually administers.

**Blocked by:** None — separate repo, independent of the portfolio site build.

**Status:** needs-info

- [ ] Confirm whether the original Supabase project (now reachable again) actually works end-to-end: sign up, create a flat, add a pantry ingredient, generate an AI recipe, save it
- [ ] If it works: close this ticket as `wontfix` — no redeploy needed, the original demo is healthy
- [ ] If it doesn't work (e.g. reachable but broken/stale): fall back to the reconstructed-schema redeploy plan below

## Comments

Superseded, pending verification — Newton regained access to the original Supabase project, so the "unreachable database" premise this ticket was opened on may no longer hold. Nothing in the redeploy plan below was ever run against real infrastructure (no Supabase project was created, no Vercel env vars were touched), so there is nothing live to undo. The prep work that *was* committed — a reconstructed schema and a redeploy wizard, in `NewtonSythong/Fresh-Flat` commit `925c2cc` — has been reverted (`a0e79b0`) now that it's not needed; both are still recoverable from git history if the original account becomes unreachable again later.

Next step is on Newton: test `fresh-flat.vercel.app` directly (signup/login can't be verified via a static page fetch) and report back.

<details>
<summary>Original redeploy plan (reconstructed-schema fallback, if the original DB turns out not to work)</summary>

Unlike Note-Pilot (which had a Prisma `schema.prisma` to migrate from), Fresh-Flat's schema was apparently hand-built in the Supabase dashboard and never committed — no `supabase/migrations`, no generated types file. The reverted migration reverse-engineered it directly from every `.from(...)` call across `model/`, `controller/`, and `app/api/` — 6 custom tables (`flats`, `flats_have_users`, `ingredients`, `users_have_ingredients`, `recipes`, `recipes_have_ingredients`) plus Supabase's built-in `auth.users`. Two of the app's embedded selects (`ingredients(name)`, `recipes_have_ingredients(...)`) require real foreign key constraints for PostgREST to resolve them, not just matching values — those were included. RLS was left off on every table to match how the app evidently ran (all data access already goes through server-side code that does its own authorization, never a browser-side anon-key client with no session). Not verified against a real Postgres instance (no local Postgres/Docker/Supabase CLI available) — reviewed carefully by hand instead.

</details>
