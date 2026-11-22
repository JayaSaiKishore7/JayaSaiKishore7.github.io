// The live demos' last check (scripts/check-demos.mjs writes demoStatus.json;
// it's generated and git-ignored). The glob is empty when the file doesn't
// exist yet, so a missing check simply means "no status shown".
const files = import.meta.glob("./demoStatus.json", { eager: true, import: "default" });

/** { "<id>": { ok, checkedAt } } */
export const demoStatus = files["./demoStatus.json"] ?? {};

const FRESH_MS = 7 * 24 * 60 * 60 * 1000; // a check older than 7 days doesn't count

/** Whether a project's demo should show as online at time `now` (ms). */
export function demoOnline(id, now) {
  const entry = demoStatus[id];
  if (!entry?.ok) return false;
  const age = now - Date.parse(entry.checkedAt);
  return age >= 0 && age <= FRESH_MS;
}
