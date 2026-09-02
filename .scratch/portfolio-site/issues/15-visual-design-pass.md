# 15 — Visual design pass: navy palette, ambient backdrop, motion

**What to build:** The site is structurally complete but visually unstyled — five sections each repeating the same three CSS rules, no hierarchy, no motion, left-aligned columns on a flat white/near-black background. Newton flagged it as bland.

Reference gathered for inspiration: `shreya-saraswat-portfolio.vercel.app` (Vite + React + GSAP). Its bundles were read directly rather than screenshotted. **Inspiration, not a copy** — Newton's explicit instruction. What carries over is the *approach*; what does not is the look:

- **Taken:** an HSL token system with a light/dark pair, an ambient animated backdrop behind fixed content, hover affordances on cards and tags, staggered scroll reveals, a section-heading treatment strong enough to structure a single-page scroll.
- **Rejected:** the violet/purple primary (`271 81% 56%`), replaced with navy per Newton and per the `CONTEXT.md` visual direction; the whole celestial scene (moon, sun, meteors, drifting clouds, SVG constellations — 14 keyframes) as too playful for a recruiter-facing page that `CONTEXT.md` calls "minimal"; GSAP + ScrollTrigger, since this is a static Astro site with no client framework and IntersectionObserver plus CSS transitions covers the same ground at zero dependency cost.

**Blocked by:** None.

**Status:** ready-for-human

- [x] Shared `src/styles/global.css` holds the token system; the five sections stop redefining the same rules
- [x] Navy palette in both themes, with contrast checked against WCAG AA for body and muted text
- [x] Ambient backdrop, sticky blurred header, card/tag hover, scroll reveals
- [x] `prefers-reduced-motion: reduce` disables all of it
- [x] Content still readable with JavaScript disabled
- [ ] Newton signs off on the look before any deploy

## Comments

### 2026-09-02 — implemented; awaiting Newton's look

`src/styles/global.css` is new and now owns the tokens, section furniture, tag pills, card surface and reveal machinery. The five sections between them dropped roughly 120 lines of duplicated CSS — each had its own copy of the same `section`/`h2` pair, and four carried near-identical `.tags` blocks.

Palette is navy in both themes, stored as bare HSL channels so tints can reuse a token via `hsl(var(--accent-hsl) / 0.1)` instead of needing a second variable each. Measured against the page background: light mode 16.8:1 body, 6.7:1 muted, 7.2:1 accent; dark mode 15.8:1 / 8.9:1 / 9.2:1. All AA, most AAA.

Two deliberate departures from the reference. Cards lift with `translateY(-3px)` instead of `scale(1.02)`, because scaling resamples the card's text and thumbnail every frame and shimmers on non-retina displays. Reveals use IntersectionObserver and CSS transitions instead of GSAP + ScrollTrigger, which keeps the site at zero client dependencies.

The no-JavaScript case drove the shape of the reveal CSS. The hidden state is gated on a `.js` class set by an inline `<head>` script, so with scripting off the rules never match and the page renders plainly rather than sitting at opacity 0 with no observer coming. It is keyed off the element selector rather than a class the script adds, because a deferred script adding `.reveal` would let the content paint and then blink out. `IntersectionObserver` itself is feature-detected, falling back to revealing everything.

**Still open.** The theme-flash trade-off documented in `Layout.astro` is now more visible than it was: the deferred module script means a dark-mode visitor sees a light flash before the theme applies, which was barely noticeable on a near-white page and is obvious against a dark navy one. Not changed here, because the decision to keep theme resolution in the tested `lib/theme` module rather than an inline bootstrap was made deliberately. Worth revisiting as its own ticket.

Two things not done because they are content decisions, not CSS: there is no hero or name/title block above About (the page opens straight into a numbered section), and the Contact section is still a bare heading plus two links with no lead line.
