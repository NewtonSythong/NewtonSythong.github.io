---
name: "Is This a Scam?"
slug: "is-this-a-scam"
tags: ["TypeScript", "Next.js", "Claude API", "Safe Browsing", "AGPL"]
description: "A scam checker for older and less digitally confident New Zealanders. Paste a suspicious text or email and get an answer in plain language — and never the words 'this is safe', because a false reassurance costs someone their savings while a false warning costs them a phone call."
contribution: "Sole design and build. Set the product constraints the architecture is built around — that the app may never call a message safe, that the worse of its two engines always wins, and that the model may not write its own sentences but must pick from a reviewed catalogue and quote the words that made it pick, so hallucination is caught by code rather than by the reader. Required a published effectiveness benchmark before deployment rather than shipping on passing tests, and licensed it AGPL so a degraded fork cannot be deployed as a black box."
liveDemoUrl: "https://is-this-a-scam-pink.vercel.app"
image:
  src: "/images/projects/is-this-a-scam.webp"
  alt: "A verdict reading “This is a scam. Do not reply, do not tap the link.” above three plain-language reasons — the link goes to anz-secure.top rather than a real ANZ address, the message invents a problem with your account, and it is trying to rush you"
  width: 1600
  height: 900
gallery:
  - src: "/images/projects/is-this-a-scam-home.webp"
    alt: "The opening screen: one heading asking “Is this a scam?”, a note that nothing is saved, a box to paste a message into, and a single Check this message button"
    width: 1600
    height: 900
  - src: "/images/projects/is-this-a-scam-quiet.webp"
    alt: "A genuine bank message returning “We can’t tell. Don’t act on this until someone you trust has looked.” rather than an all-clear, with a prompt to send it to a family member or friend"
    width: 1600
    height: 900
  - src: "/images/projects/is-this-a-scam-gift-card.webp"
    alt: "A “Hi Mum, this is my new number” message returning “This has warning signs. Don’t do anything it asks yet.”, naming the gift-card payment and the new-number pretext, with an option to report the message"
    width: 1600
    height: 900
  - src: "/images/projects/is-this-a-scam-scams.webp"
    alt: "A “Scams going around” page listing the seven patterns currently being reported in New Zealand, from the parcel fee to the investment that cannot lose"
    width: 1600
    height: 900
  - src: "/images/projects/is-this-a-scam-helping.webp"
    alt: "A page written for the daughter, son or neighbour of someone being targeted, headed “Be the person they ring”, with steps to set the app up on their phone once"
    width: 1600
    height: 900
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

Measured against a corpus of twenty-one messages the engine was never built
against, it raised all nine unfamiliar scams and left all eight legitimate
messages quiet — including five genuine messages deliberately wearing a scam's
clothes: a real courier's shortened link, a real bank asking you to confirm a
payment, a real family member asking for money. Seven of those scam texts are
verbatim: six transcribed from screenshots the banks publish, because New
Zealand organisations release annotated images of scam texts rather than the
text, and one pasted straight out of a real junk folder.

The benchmark is built to be distrusted. Four messages are excluded from that
figure because the engine was later changed while looking at them, so they now
pass by construction and prove nothing — the corpus records that permanently and
every run says so. A second benchmark runs the language model's half with the
deterministic rules taken away, because most real scam texts carry a lookalike
domain that the rules catch on their own: without it, a broken pattern in the
model would be invisible in the headline number. Its first run showed two of
three new patterns firing on real messages nobody had written them from, and the
third still unvalidated for want of a real example.

It is [AGPL-licensed and open to
contributions](https://github.com/NewtonSythong/is-this-a-scam). The most useful
one is not code: New Zealand publishes almost no scam message text — banks and
agencies release annotated screenshots instead — so a real scam text with a
citation is worth more than any refactor.
