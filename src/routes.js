// The site's pages. Pure functions with no data imports, so they work the same
// in the browser, in the pre-render step and in vite.config.js (head tags).
//
//   /              home
//   /work/<id>/    a project's case study

export const caseStudyPath = (id) => `/work/${id}/`;

/** Every page path, for pre-rendering and the sitemap. */
export function allPaths(projects) {
  return ["/", ...projects.map((project) => caseStudyPath(project.id))];
}

/** { page: "home" } or { page: "case-study", project }. Unknown paths fall back to home. */
export function resolveRoute(pathname, projects) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const match = path.match(/^\/work\/([^/]+)\/$/);
  const project = match && projects.find((p) => p.id === match[1]);
  return project ? { page: "case-study", project } : { page: "home" };
}
