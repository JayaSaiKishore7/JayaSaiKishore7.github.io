// Real screenshots of the running site, for before/after reviews and smoke checks.
//
//   npm run dev                                   (in another terminal)
//   npm run screens -- <outDir> [baseUrl]
//
// Uses the Microsoft Edge already installed on the machine (playwright-core,
// no browser download). Waits on the app's own state attributes
// (#home[data-phase="ready"]) instead of fixed sleeps, and logs a small report
// per shot: the nav's active section and any horizontal overflow.
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright-core";

const [outDir = "screens", baseUrl = "http://localhost:5173/"] = process.argv.slice(2);

const viewports = {
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  laptop: { viewport: { width: 1280, height: 800 } },
  wide: { viewport: { width: 1600, height: 1000 } },
};

// Where to scroll before each shot: the top, a section id, or the page bottom.
const stops = ["top", "work", "experience", "hello", "bottom"];

async function scrollTo(page, stop) {
  await page.evaluate((target) => {
    const y =
      target === "top" ? 0
      : target === "bottom" ? document.documentElement.scrollHeight
      : document.getElementById(target).getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: y, behavior: "instant" });
  }, stop);
  await page.waitForTimeout(1200); // let scroll reveals and the nav settle
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });

try {
  for (const [device, options] of Object.entries(viewports)) {
    const context = await browser.newContext({ ...options, reducedMotion: "no-preference" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.waitForSelector('#home[data-phase="ready"]', { timeout: 10000 });
    await page.waitForTimeout(800); // hero fade-in

    for (const stop of stops) {
      await scrollTo(page, stop);
      const file = join(outDir, `${device}-${stop}.png`);
      await page.screenshot({ path: file });

      const report = await page.evaluate(() => ({
        active: document.querySelector('[aria-current="location"]')?.textContent?.replace(/^\d+/, "") ?? "none",
        overflowX: document.documentElement.scrollWidth - window.innerWidth,
      }));
      console.log(`${device}-${stop}: active=${report.active} overflowX=${report.overflowX}px`);
    }

    if (errors.length) console.log(`${device} console errors:\n  ${errors.join("\n  ")}`);
    await context.close();
  }
} finally {
  await browser.close();
}
