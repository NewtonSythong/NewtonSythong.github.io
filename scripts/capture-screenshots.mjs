#!/usr/bin/env node
/**
 * Capture the project imagery used on the site, straight from the live apps.
 *
 *   npm run shots            # every shot below
 *   npm run shots -- note    # only shots whose name contains "note"
 *
 * Nothing here depends on this machine: any device with Node and
 * `npx playwright install chromium` produces the same files.
 *
 * Each shot names the size it must come out at, because the cards and galleries
 * hard-code width and height in the project front matter, and a shot delivered
 * at a different aspect arrives visibly squashed. The viewport is derived from
 * that size rather than fixed, so the render and the output always agree; only
 * the pixel count is chosen here, and it is chosen high (three times device
 * scale) so the downsample keeps text sharp.
 *
 * Shots of screens behind a login declare `session`. See saveSession below.
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { chromium } from "playwright";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "images", "projects");
const AUTH_DIR = path.join(process.cwd(), ".auth");
const SCALE = 3;
const QUALITY = 82;

const NOTE_PILOT = "https://note-pilot-sage.vercel.app";
const FRESH_FLAT = "https://fresh-flat-psi.vercel.app";
const CATALOGUE = "https://productcatalouge.onrender.com";

/** Where a saved session lives, and the page `npm run shots:login` opens first. */
const SESSIONS = {
  "note-pilot": { loginUrl: NOTE_PILOT + "/signUp", label: "Note-Pilot" },
  "fresh-flat": { loginUrl: FRESH_FLAT + "/auth/login", label: "Fresh-Flat" },
  catalogue: { loginUrl: CATALOGUE + "/sign-in.html", label: "ProductCatalouge" },
};

/**
 * `setup` runs after the page has loaded and before the shutter. Use it to put
 * the app into the state worth photographing.
 *
 * `out` is [width, height] and must match the front matter that references the
 * file. `view` is the CSS width to render at; the height follows from `out`.
 * `session` names a saved login from SESSIONS above.
 */
const SHOTS = [
  // Note-Pilot. The landing page is public; every screen worth showing is not.
  // Rendered wider than it is delivered, then downsampled, so the headline and
  // all four feature cards land in one frame — which is what its caption on the
  // site claims it shows.
  { name: "note-pilot-home", url: NOTE_PILOT, out: [1600, 766], view: 1920 },
  {
    name: "note-pilot",
    url: NOTE_PILOT + "/dashboard",
    out: [1600, 900],
    view: 1440,
    session: "note-pilot",
  },
  {
    name: "note-pilot-chat",
    url: NOTE_PILOT + "/dashboard",
    out: [1600, 900],
    view: 1440,
    session: "note-pilot",
  },
  {
    name: "note-pilot-study-guide",
    url: NOTE_PILOT + "/dashboard",
    out: [1600, 900],
    view: 1440,
    session: "note-pilot",
  },
  {
    name: "note-pilot-problem-sets",
    url: NOTE_PILOT + "/dashboard",
    out: [1600, 900],
    view: 1440,
    session: "note-pilot",
  },

  // Fresh-Flat. Every screen is behind the login.
  { name: "fresh-flat", url: FRESH_FLAT + "/", out: [1600, 592], view: 1440, session: "fresh-flat" },
  {
    name: "fresh-flat-pantry",
    url: FRESH_FLAT + "/",
    out: [1600, 400],
    view: 1440,
    session: "fresh-flat",
  },
  {
    name: "fresh-flat-create-recipe",
    url: FRESH_FLAT + "/",
    out: [1600, 466],
    view: 1440,
    session: "fresh-flat",
  },

  // ProductCatalouge. A free instance that sleeps when idle: the first load is slow.
  {
    name: "product-catalouge",
    url: CATALOGUE + "/",
    out: [1600, 750],
    view: 1440,
    session: "catalogue",
  },
  {
    name: "product-catalouge-product",
    url: CATALOGUE + "/",
    out: [1600, 520],
    view: 1440,
    session: "catalogue",
  },
];

const sessionFile = (name) => path.join(AUTH_DIR, name + ".json");

async function hasSession(name) {
  try {
    await access(sessionFile(name));
    return true;
  } catch {
    return false;
  }
}

/**
 * Open a real browser, wait for a person to sign in, and keep the cookies.
 *
 * Logging in is the one part of this that cannot be scripted honestly: three
 * apps, three different forms, and credentials that must not live in the repo.
 * Doing it by hand once per app per device is cheaper than maintaining three
 * brittle form-filling routines, and it keeps passwords out of the codebase and
 * out of anything that runs unattended.
 */
async function saveSession(name) {
  const session = SESSIONS[name];
  if (session === undefined) {
    console.error("Unknown session " + name + ". Known: " + Object.keys(SESSIONS).join(", "));
    process.exit(1);
  }
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(session.loginUrl, { waitUntil: "domcontentloaded", timeout: 120_000 });
  console.log("");
  console.log("A browser has opened on " + session.label + ".");
  console.log("Sign in, click through to the screens worth photographing, then come");
  console.log("back here and press Enter. Nothing is typed for you and no password");
  console.log("is stored — only the session cookies the site itself sets.");
  console.log("");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  await rl.question("Press Enter once you are signed in... ");
  rl.close();
  await mkdir(AUTH_DIR, { recursive: true });
  await context.storageState({ path: sessionFile(name) });
  await browser.close();
  console.log("Saved " + path.relative(process.cwd(), sessionFile(name)) + ". It is git-ignored.");
}

async function capture(browser, shot) {
  const outWidth = shot.out[0];
  const outHeight = shot.out[1];
  const viewWidth = shot.view;
  const viewHeight = Math.round((viewWidth * outHeight) / outWidth);
  const context = await browser.newContext({
    viewport: { width: viewWidth, height: viewHeight },
    deviceScaleFactor: SCALE,
    ...(shot.session ? { storageState: sessionFile(shot.session) } : {}),
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  try {
    await page.goto(shot.url, { waitUntil: "networkidle", timeout: 120_000 });
    await shot.setup?.(page);
    const png = await page.screenshot({ type: "png" });
    const webp = await sharp(png)
      .resize(outWidth, outHeight, { fit: "fill" })
      .webp({ quality: QUALITY })
      .toBuffer();
    const file = path.join(OUT_DIR, shot.name + ".webp");
    await writeFile(file, webp);
    return { file, bytes: webp.length };
  } finally {
    await context.close();
  }
}

const args = process.argv.slice(2);
if (args[0] === "--login") {
  await saveSession(args[1]);
  process.exit(0);
}

const wanted = args.length ? SHOTS.filter((shot) => args.some((f) => shot.name.includes(f))) : SHOTS;

if (wanted.length === 0) {
  console.error("No shot matches " + args.join(", ") + ". Known shots:");
  for (const shot of SHOTS) console.error("  " + shot.name);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
let failed = 0;
const skipped = new Set();
try {
  for (const shot of wanted) {
    if (shot.session && !(await hasSession(shot.session))) {
      skipped.add(shot.session);
      console.log(shot.name + "  skipped — no saved " + shot.session + " session");
      continue;
    }
    try {
      const { file, bytes } = await capture(browser, shot);
      console.log(path.relative(process.cwd(), file) + "  " + (bytes / 1024).toFixed(0) + " KB");
    } catch (error) {
      failed += 1;
      console.error(shot.name + " failed: " + error.message);
    }
  }
} finally {
  await browser.close();
}

if (skipped.size > 0) {
  console.log("");
  console.log("Some shots need you to sign in once on this device. For each of:");
  for (const name of skipped) console.log("  npm run shots:login -- " + name);
  console.log("Then run npm run shots again. The saved sessions are git-ignored.");
}

process.exit(failed > 0 ? 1 : 0);
