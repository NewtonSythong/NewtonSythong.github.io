---
name: "Is This a Scam?"
slug: "is-this-a-scam"
tags: ["TypeScript", "Next.js", "Claude API", "Safe Browsing", "AGPL"]
description: "A scam checker for older and less digitally confident New Zealanders. Paste a suspicious text or email and get an answer in plain language — and never the words 'this is safe', because a false reassurance costs someone their savings while a false warning costs them a phone call."
contribution: "Sole design and build. Set the product constraints the architecture is built around — that the app may never call a message safe, that the worse of its two engines always wins, and that the model may not write its own sentences but must pick from a reviewed catalogue and quote the words that made it pick, so hallucination is caught by code rather than by the reader. Required a published effectiveness benchmark before deployment rather than shipping on passing tests, and licensed it AGPL so a degraded fork cannot be deployed as a black box."
status: "featured"
---

Two engines run over every message and the more alarming one wins, never an
average: deterministic rules own what can be looked up — lookalike domains,
redirect chains, payment methods, Safe Browsing — and a language model owns the
story being told, the impersonation and urgency and the "Hi Mum, this is my new
number" pretext. When a message cannot be settled, handing it to someone the
reader already trusts is treated as the answer rather than as a consolation
prize, and that person can reply from a page with three buttons on it without
typing a word.

Measured against a corpus of sixteen messages the engine was never built
against, it raised 5 of 8 unfamiliar scams and left all 8 legitimate messages
quiet, including five genuine messages deliberately wearing a scam's clothes —
a real courier's shortened link, a real bank asking you to confirm a payment, a
real family member asking for money. The benchmark earned its keep on its first
run by catching the app calling a genuine NZ Post tracking text a scam, because
NZ Post's own link shortener was missing from its records. Every reason to
distrust those figures is published alongside them.

It is AGPL-licensed and open to contributions. The most useful one is not code:
New Zealand publishes almost no scam message text — banks and agencies release
annotated screenshots instead — so a real scam text with a citation is worth
more than any refactor.
