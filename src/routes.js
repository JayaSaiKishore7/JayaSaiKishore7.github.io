// The site's pages. Pure functions with no data imports, so they work the same
// in the browser, in the pre-render step and in vite.config.js (head tags).
//
//   /              home
//   /work/<id>/    a project's case study
//   anything else  "not found" (pre-rendered as dist/404.html; the host serves
//                  it with a 404 status for every unknown URL)

export const caseStudyPath = (id) => `/work/${id}/`;

/** The path the 404 page is built for (not a real URL; it's served for all unknown ones). */
export const NOT_FOUND_PATH = "/404/";

/** Every real page path, for pre-rendering and the sitemap (the 404 page is separate). */
export function allPaths(projects) {
  return ["/", ...projects.map((project) => caseStudyPath(project.id))];
}

/** { page: "home" }, { page: "case-study", project } or { page: "not-found" }. */
export function resolveRoute(pathname, projects) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (path === "/") return { page: "home" };
  const match = path.match(/^\/work\/([^/]+)\/$/);
  const project = match && projects.find((p) => p.id === match[1]);
  return project ? { page: "case-study", project } : { page: "not-found" };
}
