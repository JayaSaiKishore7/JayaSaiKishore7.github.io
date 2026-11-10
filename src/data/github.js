// GitHub activity, fetched at build time (never from the visitor's browser) and
// served to the app as "virtual:github-activity" by the plugin in vite.config.js.

export const GITHUB_USER = "JayaSaiKishore7";

// Repos not worth listing as "recent work": this site itself.
const HIDDEN_REPOS = new Set([`${GITHUB_USER}.github.io`]);

const DAY_MS = 24 * 60 * 60 * 1000;

/** Fetches what the summary needs from GitHub's REST API. Throws on any failure. */
export async function fetchGithub({ token, user = GITHUB_USER } = {}) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "portfolio-build" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const get = async (path) => {
    const response = await fetch(`https://api.github.com${path}`, { headers });
    if (!response.ok) throw new Error(`GitHub ${path}: ${response.status}`);
    return response.json();
  };

  const [profile, repos, events] = await Promise.all([
    get(`/users/${user}`),
    get(`/users/${user}/repos?sort=pushed&per_page=100&type=owner`),
    get(`/users/${user}/events/public?per_page=100`),
  ]);
  return { profile, repos, events };
}

/** Turns the raw API responses into the small, stable object the page renders. Pure. */
export function summarizeGithub({ profile, repos, events }, now = new Date()) {
  const since = now.getTime() - 30 * DAY_MS;
  const ownRepos = repos.filter((repo) => !repo.fork);

  const recentPushes = events.filter(
    (event) => event.type === "PushEvent" && new Date(event.created_at).getTime() >= since
  );

  const languageCounts = new Map();
  for (const repo of ownRepos) {
    if (repo.language) languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
  }

  return {
    user: profile.login,
    url: profile.html_url,
    publicRepos: profile.public_repos,
    activeReposLast30Days: new Set(recentPushes.map((event) => event.repo.name)).size,
    languages: [...languageCounts]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 4)
      .map(([name, count]) => ({ name, count })),
    recent: ownRepos
      .filter((repo) => !HIDDEN_REPOS.has(repo.name))
      .slice(0, 4)
      .map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description ?? "",
        language: repo.language ?? "",
        pushedAt: repo.pushed_at,
      })),
    asOf: now.toISOString(),
  };
}
