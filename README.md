# Newton Profile

Personal portfolio site for Newton Sythong — job-hunting focused, built for recruiters/hiring managers to get a fast, credible read on skills and shipped work.

- **Framework:** [Astro](https://docs.astro.build) (static-first, content collections)
- **Layout:** single-page scroll (About → Experience → Skills → Projects → Contact) plus a detail page per featured project
- **Repo:** https://github.com/NewtonSythong/NewtonSythong.github.io
- **Live:** https://newtonsythong.github.io

## Setup

Requires Node.js `>=22.12.0`.

```sh
git clone https://github.com/NewtonSythong/NewtonProfile.git
cd NewtonProfile
npm install
```

No environment variables are required for local development.

## Commands

All commands run from the project root:

| Command                | Action                                                     |
| :---------------------- | :----------------------------------------------------------- |
| `npm run dev`           | Start local dev server at `localhost:4321`                   |
| `npm run build`         | Build the production site to `./dist/`                       |
| `npm run preview`       | Preview the production build locally                         |
| `npm test`              | Run the test suite (Vitest)                                  |
| `npm run shots`         | Recapture the project screenshots from the live apps          |
| `npm run astro ...`     | Run Astro CLI commands (e.g. `astro add`, `astro check`)     |


## Working from another device

This repo is private, so pushes/pulls need an authenticated GitHub account, not just a plain HTTPS clone. The simplest path is the [GitHub CLI](https://cli.github.com/):

1. **Install `gh`**
   - Windows: `winget install --id GitHub.cli -e`
   - macOS: `brew install gh`
   - Linux: see [cli/cli install docs](https://github.com/cli/cli/blob/trunk/docs/install_linux.md)
2. **Authenticate**
   ```sh
   gh auth login --hostname github.com --git-protocol https --web
   ```
   This prints a one-time code and a URL (`https://github.com/login/device`) — open it in a browser and approve.
3. **Wire git to use it as the credential helper**
   ```sh
   gh auth setup-git
   ```
4. **Clone the repo** (see [Setup](#setup) above)

After that, `git push`/`git pull` authenticate automatically on that device.

## Project screenshots

The images on the project cards are captured from the live apps by a script, not
by hand, so they can be refreshed from any machine rather than from whichever
one happens to have the originals on it:

```sh
npx playwright install chromium   # once per device
npm run shots                     # every shot
npm run shots -- scam             # only shots whose name contains "scam"
```

Each shot is rendered in a small 16:9 viewport at three times device scale and
downsampled to a 1600x900 `.webp` in `public/images/projects/`, which is the
size the cards and the detail-page galleries expect. To add or change a shot,
edit the `SHOTS` list at the top of
[`scripts/capture-screenshots.mjs`](./scripts/capture-screenshots.mjs) — a shot
is a name, a URL, and optionally a `setup(page)` that clicks the app into the
state worth photographing. Then add the file to the project's front matter in
`src/content/projects/`, with `alt`, `width` and `height`, all of which the
content schema requires.

Only the scam checker is wired up so far; the other projects' images predate the
script and were captured by hand.

## Project structure

```text
/
├── src/
│   ├── content/     # content collections (projects, etc.)
│   ├── components/
│   ├── layouts/
│   ├── lib/
│   └── pages/
├── public/
└── package.json
```

Astro looks for `.astro` or `.md` files in `src/pages/`; each maps to a route by file name.

## Documentation

Full Astro docs: https://docs.astro.build
