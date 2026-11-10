// Last build step: renders the app to HTML and writes it into dist/index.html,
// so the page has real content before (and without) JavaScript: for link
// previews, search engines, recruiters' tools and AI agents.
import { readFile, rm, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const SSR_DIR = "dist-ssr";
const PAGE = "dist/index.html";
const ROOT = '<div id="root"></div>';

const { render } = await import(pathToFileURL(`${SSR_DIR}/entry-server.js`).href);
const html = await readFile(PAGE, "utf8");

if (!html.includes(ROOT)) {
  throw new Error(`prerender: ${PAGE} has no empty ${ROOT} to fill`);
}

await writeFile(PAGE, html.replace(ROOT, `<div id="root">${render()}</div>`));
await rm(SSR_DIR, { recursive: true, force: true });
console.log(`prerender: wrote ${PAGE}`);
