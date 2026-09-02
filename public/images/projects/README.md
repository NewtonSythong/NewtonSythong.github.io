# Project images

Screenshots and captures shown on the project cards and detail pages.

Reference one from a project's front matter in `src/content/projects/`:

```yaml
image:
  src: "/images/projects/andie.gif"
  alt: "ANDIE rotating and then block-averaging a photograph"
```

`src` is a root-relative path (these are served straight from `public/`, not
processed by the build). `alt` is required whenever `src` is present — the
schema rejects an image without it.

Cards crop to 16:9, so a roughly landscape capture survives best. Detail pages
show the image uncropped at its natural aspect ratio.

## Capturing these

`npm run capture` drives OBS Studio over obs-websocket to take the shots at a
consistent size, save them here under the right filename, and write the
`image:` block back into the project's front matter. `npm run capture -- --list`
shows which projects still need one.

It automates the framing, naming and front-matter edit; it cannot navigate or
log into the apps, so it pauses before each capture and waits for you to get
the screen into the state you want. See the header comment in
`scripts/capture-project-media.mjs` for the one-time OBS setup.

## What is in here

Each featured project has one headline capture named after its slug
(`fresh-flat.png`), used as both the card thumbnail and the detail-page hero.
Extra shots are suffixed (`fresh-flat-pantry.png`) and listed under `gallery:`
in the project's front matter, which renders them on the detail page only.

Captures are trimmed of dead space before landing here — a full-window
screenshot is usually mostly empty below the fold, which makes for a very
sparse card. Cards crop to 16:9 from the centre, so anything wider than 16:9
will lose its left and right edges there while still showing in full on the
detail page. Raw originals are kept in `screenshots/` at the repo root, which
is gitignored.

`npm run verify:build` fails if a path referenced in front matter is not
actually present in `dist/`.
