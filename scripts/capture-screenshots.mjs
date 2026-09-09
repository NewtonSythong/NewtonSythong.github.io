#!/usr/bin/env node
/**
 * Capture the project imagery used on the site, straight from the live apps.
 *
 *   npm run shots            # every shot below
 *   npm run shots -- scam    # only shots whose name contains "scam"
 *
 * Nothing here depends on this machine: any device with Node and
 * `npx playwright install chromium` produces the same files.
 *
 * The scam checker is a phone app on the web — a fixed 680px column that would
 * sit marooned in the middle of a 1600px frame. So each shot is taken in a
 * small 16:9 viewport where that column nearly fills the width, at three times
 * device scale, and then downsampled to the 1600x900 the cards expect. The
 * pixels come from a 2400px render, so the text stays sharp.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "images", "projects");
const OUT_WIDTH = 1600;
const OUT_HEIGHT = 900;
const VIEW_WIDTH = 1100;
const VIEW_HEIGHT = 619;
const SCALE = 3;
const QUALITY = 82;

const SCAM = "https://is-this-a-scam-pink.vercel.app";

/**
 * `setup` runs after the page has loaded and before the shutter. Use it to put
 * the app into the state worth photographing.
 */
const SHOTS = [
  {
    name: "is-this-a-scam",
    url: SCAM,
    async setup(page) {
      await check(page, /ANZ: unusual activity/);
      await frameVerdict(page);
    },
  },
  {
    name: "is-this-a-scam-home",
    url: SCAM,
  },
  {
    name: "is-this-a-scam-quiet",
    url: SCAM,
    async setup(page) {
      await check(page, /ANZ: your statement is ready/);
      await frameVerdict(page);
    },
  },
  {
    name: "is-this-a-scam-gift-card",
    url: SCAM,
    async setup(page) {
      await check(page, /Hi Mum, this is my new number/);
      await frameVerdict(page);
    },
  },
  {
    name: "is-this-a-scam-scams",
    url: `${SCAM}/scams`,
  },
  {
    name: "is-this-a-scam-helping",
    url: `${SCAM}/helping`,
  },
];

/** Fill the box from one of the example messages and run the check. */
async function check(page, example) {
  await page.getByRole("button", { name: example }).click();
  await page.getByRole("button", { name: /Check this message/ }).click();
  await page.waitForSelector(".verdict", { timeout: 60_000 });
  await page.waitForLoadState("networkidle");
}

/** Scroll so the verdict sits just under the top of the frame. */
async function frameVerdict(page) {
  await page.evaluate(() => {
    const verdict = document.querySelector(".verdict");
    if (verdict) {
      window.scrollTo({ top: verdict.getBoundingClientRect().top + window.scrollY - 24 });
    }
  });
  await page.waitForTimeout(400);
}

async function capture(browser, shot) {
  const page = await browser.newPage({
    viewport: { width: VIEW_WIDTH, height: VIEW_HEIGHT },
    deviceScaleFactor: SCALE,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  try {
    await page.goto(shot.url, { waitUntil: "networkidle", timeout: 60_000 });
    await shot.setup?.(page);
    const png = await page.screenshot({ type: "png" });
    const webp = await sharp(png)
      .resize(OUT_WIDTH, OUT_HEIGHT, { fit: "fill" })
      .webp({ quality: QUALITY })
      .toBuffer();
    const file = path.join(OUT_DIR, `${shot.name}.webp`);
    await writeFile(file, webp);
    return { file, bytes: webp.length };
  } finally {
    await page.close();
  }
}

const filters = process.argv.slice(2);
const wanted = filters.length
  ? SHOTS.filter((shot) => filters.some((f) => shot.name.includes(f)))
  : SHOTS;

if (wanted.length === 0) {
  console.error(`No shot matches ${filters.join(", ")}. Known shots:`);
  for (const shot of SHOTS) console.error(`  ${shot.name}`);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
let failed = 0;
try {
  for (const shot of wanted) {
    try {
      const { file, bytes } = await capture(browser, shot);
      console.log(`${path.relative(process.cwd(), file)}  ${(bytes / 1024).toFixed(0)} KB`);
    } catch (error) {
      failed += 1;
      console.error(`${shot.name} failed: ${error.message}`);
    }
  }
} finally {
  await browser.close();
}
process.exit(failed > 0 ? 1 : 0);
