# 13 — Fresh-Flat redeploy (fresh database)

**What to build:** Fresh-Flat's live demo (`fresh-flat.vercel.app`) points at a Supabase project owned by a former teammate's personal account, which Newton has confirmed is unreachable. Same underlying problem ticket 11 solved for Note-Pilot — the demo needs a database Newton actually administers.

**Blocked by:** None — separate repo, independent of the portfolio site build.

**Status:** ready-for-agent

- [ ] New Supabase project provisioned, administered by Newton
- [ ] Schema applied against the new project — reconstructed from application code as `supabase/migrations/20260826160000_initial_schema.sql` (no schema was ever committed in this repo; the original project had none checked in either)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` updated in Vercel's Production environment to point at the new project
- [ ] `OPENAI_API_KEY` confirmed valid (recipe generation depends on it; may already be provisioned from the original build)
- [ ] Redeployed and confirmed working live: sign up, create a flat, add a pantry ingredient, generate an AI recipe, save it

## Comments

Harder than ticket 11 in one respect: unlike Note-Pilot (which had a Prisma `schema.prisma` to migrate from), Fresh-Flat's schema was apparently hand-built in the Supabase dashboard and never committed — no `supabase/migrations`, no generated types file. The schema in `supabase/migrations/20260826160000_initial_schema.sql` was reverse-engineered directly from every `.from(...)` call across `model/`, `controller/`, and `app/api/` — 6 custom tables (`flats`, `flats_have_users`, `ingredients`, `users_have_ingredients`, `recipes`, `recipes_have_ingredients`) plus Supabase's built-in `auth.users`. Two of the app's embedded selects (`ingredients(name)`, `recipes_have_ingredients(...)`) require real foreign key constraints for PostgREST to resolve them, not just matching values — those are included. RLS is left off on every table to match how the app evidently ran (all data access already goes through server-side code that does its own authorization, never a browser-side anon-key client with no session).

Not verified against a real Postgres instance (no local Postgres/Docker/Supabase CLI available in this environment) — reviewed carefully by hand instead. Worth double-checking the migration applies cleanly as the very first step of actually running this ticket, before doing anything else.
