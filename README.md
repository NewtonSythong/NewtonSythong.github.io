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
| `npm run verify:build`  | Build and then validate the built project pages               |
| `npm run astro ...`     | Run Astro CLI commands (e.g. `astro add`, `astro check`)     |

Agents working in this repo should start the dev server in the background — see [`CLAUDE.md`](./CLAUDE.md).

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
