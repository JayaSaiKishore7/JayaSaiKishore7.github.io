import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import { headTags } from "./data/head.js";
import { profile, seo } from "./data/profile.js";
import { projects } from "./data/projects.js";
import { allPaths, NOT_FOUND_PATH } from "./routes.js";
import { theme } from "./theme/theme.js";

// Build-time rendering, used by scripts/prerender.mjs.

/** Every page path to pre-render. */
export const paths = allPaths(projects);

/** The 404 page's build path (written to dist/404.html, not listed in the sitemap). */
export const notFoundPath = NOT_FOUND_PATH;

/** The page at `path`, rendered to HTML. */
export function render(path) {
  return renderToString(
    <StrictMode>
      <App path={path} />
    </StrictMode>
  );
}

/** The <head> tags for the page at `path`. */
export function head(path) {
  return headTags({ profile, seo, projects, theme, path });
}

export const siteUrl = profile.siteUrl;
