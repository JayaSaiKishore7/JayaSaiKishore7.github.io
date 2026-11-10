import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import { headTags } from "./data/head.js";
import { profile, seo } from "./data/profile.js";
import { projects } from "./data/projects.js";
import { allPaths } from "./routes.js";
import { theme } from "./theme/theme.js";

// Build-time rendering, used by scripts/prerender.mjs.

/** Every page path to pre-render. */
export const paths = allPaths(projects);

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
