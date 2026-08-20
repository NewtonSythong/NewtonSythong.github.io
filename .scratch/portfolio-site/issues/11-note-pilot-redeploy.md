# 11 — Note-Pilot redeploy

**What to build:** Note-Pilot is live on Vercel with a database Newton administers, so it has a working demo link and functioning AI features for the portfolio to point to.

**Blocked by:** None — can start immediately (separate repo, independent of the portfolio site build)

**Status:** ready-for-agent

- [ ] New Postgres database provisioned on Neon, administered by Newton
- [ ] Initial migration created and applied against the new database (`prisma migrate dev --name init`, since no `prisma/migrations` folder exists yet)
- [ ] OpenRouter API key provisioned and set as `NVIDIA_AI_API` in the deployment environment
- [ ] Note-Pilot deployed to Vercel and reachable at a live URL
- [ ] AI chat/study-guide feature confirmed working against the live deployment
