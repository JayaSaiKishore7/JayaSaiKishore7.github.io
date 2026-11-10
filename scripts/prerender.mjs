// Last build step: renders every page (home and each case study) to HTML, so
// pages have real content before (and without) JavaScript: for link previews,
// search engines, recruiters' tools and AI agents. Also writes sitemap.xml.
//
//   /                 -> dist/index.html
//   /work/<id>/       -> dist/work/<id>/index.html
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SSR_DIR = "dist-ssr";
const TEMPLATE = "dist/index.html";
const ROOT = '<div id="root"></div>';
const HEAD = /<!--head:start-->[\s\S]*?<!--head:end-->/;

const { paths, render, head, siteUrl } = await import(pathToFileURL(`${SSR_DIR}/entry-server.js`).href);
const template = await readFile(TEMPLATE, "utf8");

if (!template.includes(ROOT) || !HEAD.test(template)) {
  throw new Error(`prerender: ${TEMPLATE} needs an empty ${ROOT} and a head:start/head:end block`);
}

for (const path of paths) {
  const html = template
    .replace(HEAD, () => head(path))
    // data-path tells main.jsx which page this HTML is, so it only hydrates a match.
    .replace(ROOT, () => `<div id="root" data-path="${path}">${render(path)}</div>`);
  const dir = join("dist", path);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), html);
  console.log(`prerender: ${path}`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${new URL(path, siteUrl).href}</loc></url>`).join("\n")}
</urlset>
`;
await writeFile("dist/sitemap.xml", sitemap);
await rm(SSR_DIR, { recursive: true, force: true });
console.log(`prerender: ${paths.length} pages and sitemap.xml`);
