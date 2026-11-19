// Regenerates public/og-image.png, the link-preview image (LinkedIn, Slack, etc.),
// from a real 1200×630 render of the hero. Run after changing the hero:
//
//   npm run dev                       (in another terminal)
//   npm run og-image -- [baseUrl]
import { chromium } from "playwright-core";

const [baseUrl = "http://localhost:5173/"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "msedge" });

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForSelector('html[data-app="ready"]', { timeout: 10000 });
  // Wait for the hero fade-in and for every detection box to finish and remove itself.
  await page.waitForTimeout(1500);
  await page.waitForFunction(() => !document.querySelector(".detect-box"), null, { timeout: 10000 });
  await page.screenshot({ path: "public/og-image.png" });
  console.log("og-image: wrote public/og-image.png");
} finally {
  await browser.close();
}
