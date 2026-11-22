// Checks a deployed (or locally previewed) copy of the site the way a visitor
// would see it. Run automatically at the end of `npm run deploy`; also by hand:
//
//   npm run smoke                                  production (siteUrl)
//   npm run smoke -- https://<id>.jayasaikishore.pages.dev/
//   npm run build && npm run preview               then: npm run smoke -- http://localhost:4173/
//   npm run smoke -- <url> --expect-dist           also wait until <url> serves this machine's dist/
//
// Exits 1 if any check fails. Uses the Microsoft Edge installed on the
// machine (playwright-core, no browser download), like scripts/screens.mjs.
import { readFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import { profile } from "../src/data/profile.js";
import { projects } from "../src/data/projects.js";
import { allPaths } from "../src/routes.js";

const args = process.argv.slice(2);
const baseUrl = args.find((arg) => !arg.startsWith("--")) ?? profile.siteUrl;
const expectDist = args.includes("--expect-dist");

// The 8 sections every case study page must show, as <section id> (see CaseStudy.jsx).
const CASE_STUDY_SECTIONS = ["problem", "users", "solution", "architecture", "decisions", "evaluation", "limitations", "outcome"];
const viewports = { phone: { width: 390, height: 844 }, laptop: { width: 1280, height: 800 } };

const paths = allPaths(projects);
const failures = [];
const check = (ok, message) => {
  console.log(`${ok ? "ok  " : "FAIL"} ${message}`);
  if (!ok) failures.push(message);
};
const url = (path) => new URL(path, baseUrl).href;

/** Waits until the home page at `baseUrl` is byte-identical to dist/index.html (asset hashes change every build). */
async function waitForThisBuild() {
  const local = await readFile("dist/index.html", "utf8");
  for (let attempt = 1; attempt <= 12; attempt++) {
    const live = await fetch(url("/"), { cache: "no-store" }).then((r) => r.text()).catch(() => "");
    if (live === local) return true;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  return false;
}

console.log(`smoke: ${baseUrl}`);

if (expectDist) check(await waitForThisBuild(), "site serves the build in dist/ (waited up to 60 s)");

// 1. Every page is pre-rendered HTML for its own path (works without JavaScript).
for (const path of paths) {
  const response = await fetch(url(path));
  const html = await response.text();
  check(response.status === 200 && html.includes(`data-path="${path}"`), `${path} returns 200 with its pre-rendered page`);
}

// 2. Files visitors and search engines fetch directly.
const sitemap = await fetch(url("/sitemap.xml")).then(async (r) => (r.ok ? r.text() : ""));
check(paths.every((path) => sitemap.includes(new URL(path, profile.siteUrl).href)), "sitemap.xml lists every page");
const robots = await fetch(url("/robots.txt")).then(async (r) => (r.ok ? r.text() : ""));
check(robots.includes(new URL("sitemap.xml", profile.siteUrl).href), "robots.txt points at this site's sitemap");
const resume = await fetch(url(profile.resume));
check(resume.ok && resume.headers.get("content-type")?.includes("pdf"), `resume (${profile.resume}) downloads as a PDF`);

// 3. In a real browser: the app starts, nothing errors, nothing overflows, case studies are complete.
const browser = await chromium.launch({ channel: "msedge" });
try {
  for (const [device, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({ viewport, isMobile: device === "phone", hasTouch: device === "phone" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
    page.on("requestfailed", (request) => errors.push(`failed to load ${request.url()}`));

    for (const path of paths) {
      const where = `${device} ${path}`;
      await page.goto(url(path), { waitUntil: "networkidle" });
      const ready = await page
        .waitForSelector('html[data-app="ready"]', { timeout: 10000 })
        .then(() => true, () => false);
      check(ready, `${where}: app started`);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(overflow <= 0, `${where}: no sideways scrolling${overflow > 0 ? ` (${overflow}px too wide)` : ""}`);

      if (path !== "/") {
        // Each section present, with a heading and some content.
        const present = await page.$$eval(".case-part", (parts) =>
          parts.filter((p) => p.querySelector("h2") && p.textContent.trim().length > 40).map((p) => p.id),
        );
        const missing = CASE_STUDY_SECTIONS.filter((id) => !present.includes(id));
        check(!missing.length, `${where}: shows all 8 case study sections${missing.length ? ` (missing: ${missing.join(", ")})` : ""}`);
      }
    }

    check(!errors.length, `${device}: no console errors or failed requests${errors.length ? `\n       ${errors.join("\n       ")}` : ""}`);
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(failures.length ? `\nsmoke: ${failures.length} check(s) failed` : "\nsmoke: all checks passed");
process.exit(failures.length ? 1 : 0);
