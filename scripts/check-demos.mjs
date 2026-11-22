// Checks every project's live demo and records whether it answered, so the
// work list can show "● online" only when that's actually true.
//
//   npm run check-demos          (also runs in `npm run deploy`, before the build)
//
// For each project with a `demo` URL: a GET with a 10 s timeout. ok = the
// response came back 2xx/3xx. Writes src/data/demoStatus.json as
//   { "<id>": { "ok": true|false, "checkedAt": "<ISO date>" } }
// That file is generated (git-ignored), like a build output: the deployed
// commit stays exactly what's in git. It never fails the build: any error
// just records ok: false.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { projects } from "../src/data/projects.js";

const TIMEOUT_MS = 10_000;
const outFile = fileURLToPath(new URL("../src/data/demoStatus.json", import.meta.url));

async function check(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

const checkedAt = new Date().toISOString();
const withDemo = projects.filter((project) => project.demo);
const results = await Promise.all(withDemo.map(async (project) => [project.id, await check(project.demo)]));

const status = Object.fromEntries(results.map(([id, ok]) => [id, { ok, checkedAt }]));
await writeFile(outFile, `${JSON.stringify(status, null, 2)}\n`);
for (const [id, ok] of results) console.log(`check-demos: ${ok ? "online " : "offline"} ${id}`);
