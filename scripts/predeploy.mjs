// First step of `npm run deploy`: refuses to release unless what gets uploaded
// is exactly a commit on the release branch that is up to date with GitHub.
// That way the commit Cloudflare records for a deployment really is the code
// that went live, and rolling back from git (see README) is always possible.
//
//   node scripts/predeploy.mjs
import { execFileSync } from "node:child_process";

const RELEASE_BRANCH = "main";

// trimEnd, not trim: `git status --porcelain` lines start with a meaningful space.
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trimEnd();
const problems = [];

const branch = git("rev-parse", "--abbrev-ref", "HEAD");
if (branch !== RELEASE_BRANCH) {
  problems.push(`on branch "${branch}"; production deploys only from "${RELEASE_BRANCH}" (git switch ${RELEASE_BRANCH})`);
}

const dirty = git("status", "--porcelain");
if (dirty) {
  problems.push(`uncommitted changes would be deployed but recorded under the last commit:\n${dirty.replace(/^/gm, "    ")}`);
}

try {
  git("fetch", "--quiet", "origin", RELEASE_BRANCH);
  const behind = Number(git("rev-list", "--count", `HEAD..origin/${RELEASE_BRANCH}`));
  if (behind > 0) problems.push(`${behind} commit(s) behind origin/${RELEASE_BRANCH}; pull first`);
  const ahead = Number(git("rev-list", "--count", `origin/${RELEASE_BRANCH}..HEAD`));
  if (ahead > 0) console.warn(`predeploy: note: ${ahead} commit(s) not pushed to origin/${RELEASE_BRANCH} yet`);
} catch {
  problems.push(`couldn't reach GitHub to check origin/${RELEASE_BRANCH} (offline?)`);
}

if (problems.length) {
  console.error(`predeploy: not deploying.\n  - ${problems.join("\n  - ")}`);
  process.exit(1);
}

console.log(`predeploy: ok, releasing ${git("rev-parse", "--short", "HEAD")} from ${branch}`);
