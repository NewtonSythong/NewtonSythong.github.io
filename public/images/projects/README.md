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
