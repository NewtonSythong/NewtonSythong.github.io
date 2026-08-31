# 13 — Fresh-Flat migration (new Vercel account, database TBD)

**What to build:** Fresh-Flat's live demo (`fresh-flat.vercel.app`) runs on infrastructure Newton doesn't administer, discovered in two parts: the Supabase project belongs to a former teammate's personal account (access has since been regained, but not yet verified as actually working), and — found after that — **the Vercel project itself is also on an account that isn't Newton's**. Same underlying problem ticket 11 solved for Note-Pilot, now with two axes instead of one: the site needs to move to a Vercel account Newton controls regardless of how the database question resolves, since the live URL and deploy access both depend on account ownership, not just the database.

**Blocked by:** None — separate repo, independent of the portfolio site build.

**Status:** ready-for-agent

- [x] Decide the database path: **reuse the original Supabase project** — access regained and tested working on 2026-08-31 (see comment). The fresh-provisioning branch and its reconstructed schema are no longer needed for this ticket.
- [ ] If reusing: confirm the original project actually works end-to-end before relying on it — *data layer confirmed (6/6 tables, 106 rows, both embedded selects resolve, GoTrue up, both API keys accepted); the app-level flow (signup → flat → ingredient → recipe) is still unexercised*
- [ ] If fresh: apply `supabase/migrations/20260826160000_initial_schema.sql` against a new project
- [ ] Fresh-Flat imported into a Vercel project Newton administers (not a redeploy of the existing one — that account isn't his)
- [ ] `OPENAI_API_KEY` confirmed valid — *the key in `.env` is live (`GET /v1/models` → 200), but a models listing cannot reveal which account it bills, so the "is it the teammate's?" half is still open*
- [ ] New live URL confirmed working end-to-end: sign up/sign in, create a flat, add a pantry ingredient, generate an AI recipe, save it
- [ ] This repo's README and NewtonProfile's `src/content/projects/fresh-flat.md` (`liveDemoUrl`) updated to the new URL — the old `fresh-flat.vercel.app` link goes stale the moment this migration happens

## Comments

Scope grew after the ticket was first opened: it started as a database-only problem (matching ticket 11's shape), then Newton found the Vercel account wasn't his either. The wizard was rebuilt around that — `NewtonSythong/Fresh-Flat` commit `80f7538` (superseding the earlier `925c2cc`, reverted at `a0e79b0` when the scope looked database-only) — and now always ends with a fresh Vercel import, branching only on the database question at the start (reuse the regained original project vs. provision new). Nothing has been run against real infrastructure yet either way.

The reconstructed schema (for the fresh-database branch) was reverse-engineered from every `.from(...)` call across `model/`, `controller/`, and `app/api/`, since no schema was ever committed in this repo and the original project has none either — 6 custom tables (`flats`, `flats_have_users`, `ingredients`, `users_have_ingredients`, `recipes`, `recipes_have_ingredients`) plus Supabase's built-in `auth.users`. Two of the app's embedded selects (`ingredients(name)`, `recipes_have_ingredients(...)`) require real foreign key constraints for PostgREST to resolve them — those are included. RLS is left off throughout, matching how the app evidently ran (every data access path goes through server-side code doing its own authorization). Not verified against a real Postgres instance (no local Postgres/Docker/Supabase CLI available) — reviewed carefully by hand instead.

Next step is on Newton: run `bash scripts/deploy-wizard.sh` from the Fresh-Flat repo in his own terminal.

### 2026-08-31 — the original database was probed, and it is alive

The wizard's opening question ("do you already have working Supabase credentials for the ORIGINAL project, confirmed to actually work?") was unanswerable, which is why this ticket stalled. It turned out to be answerable without touching a browser: `Fresh_Flat/FreshFlat/.env` still holds the original project's URL, anon key, service_role key, and `OPENAI_API_KEY`. Read-only probes against `yxdvcdnculnlitjnzdlf.supabase.co` (a throwaway script, not committed) settled it:

- All **6 tables exist and hold real data** — `flats` 3, `flats_have_users` 4, `ingredients` 34, `users_have_ingredients` 30, `recipes` 6, `recipes_have_ingredients` 29. 106 rows total: this is the original coursework demo data, not an empty shell.
- **Both embedded selects resolve** — `ingredients(name)` and `recipes_have_ingredients(...)`. These only work when real foreign keys are present, so the relational structure is intact, not just the tables.
- **GoTrue is up** (`/auth/v1/health` → 200, v2.195.0), and **both API keys are accepted** — the anon key against a real table, the service_role key throughout.
- The **`OPENAI_API_KEY` is live** (`GET /v1/models` → 200). Read-only, nothing billed. It does not reveal whose account it belongs to.

So the database axis of this ticket is *optional*, not forced. The Vercel axis is unchanged — the hosting account still isn't Newton's, and that migration still has to happen either way.

Worth noting the reconstructed schema in `supabase/migrations/20260826160000_initial_schema.sql` is corroborated by this: the 6 tables and the FK relationships it reverse-engineered are exactly what the live project has. That is not the same as having *run* it — no Postgres, Docker, or Supabase CLI is available locally (re-checked 2026-08-31) — but it is meaningful evidence the reconstruction was correct.

**One trap found in the wizard.** The `NEXT_PUBLIC_SUPABASE_URL` currently in `.env` is `https://yxdvcdnculnlitjnzdlf.supabase.co/rest/v1/` — with the REST path already appended. All four clients in `utils/supabase/` pass that value straight to `createClient()`, which appends `/rest/v1` itself, so this value is **malformed for the app** and would produce doubled paths. The wizard's `ask` helper offers the existing `.env` value as an "[Enter keeps current]" default, so pressing Enter at the Project URL prompt would silently carry the broken value into the new Vercel deployment. Paste the bare `https://yxdvcdnculnlitjnzdlf.supabase.co` instead. (This also hints the regained credentials were assembled but never actually exercised — consistent with them being untested until now.)

Also: the repo has moved on from the commits referenced above — `9617118` (Next bumped to 15.2.9) now sits on top of the wizard commit `80f7538`.

**Decision (Newton, 2026-08-31): reuse the original database.** The 106 rows of existing demo data are worth more to a recruiter than a clean-owned-but-empty app, and reusing skips the one genuinely risky step (applying a schema that has never been executed). This ticket therefore narrows to the Vercel axis only — the database stays where it is for now. The residual risk is accepted knowingly: the Supabase project remains on an account Newton doesn't own, so the demo's data layer is only as durable as that regained access. If that ever becomes a problem, the reconstructed schema plus a row dump is the escape hatch, and the wizard's fresh-provisioning branch still works as written.

Remaining work is all Newton's, in his own terminal:

1. `bash scripts/deploy-wizard.sh` from `Fresh_Flat/FreshFlat`.
2. Answer **`y`** to the opening "reuse the original project?" question — 4 stages.
3. At "Paste the Project URL", **type `https://yxdvcdnculnlitjnzdlf.supabase.co` in full** — do NOT press Enter to accept the current value, which is the malformed `/rest/v1/` one described above.
4. The anon key, service_role key and OpenAI key already in `.env` are all confirmed good — Enter accepts those safely.
5. Import into Vercel under his own account, verify the flow, then bring the new URL back so the three references can be updated together.
