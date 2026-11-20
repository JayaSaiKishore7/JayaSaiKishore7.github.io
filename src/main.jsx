import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
// Self-hosted fonts (font-display: swap): Schibsted Grotesk for all text
// (upright and italic), IBM Plex Mono 500 only for detection labels and code.
import "@fontsource-variable/schibsted-grotesk/wght.css";
import "@fontsource-variable/schibsted-grotesk/wght-italic.css";
import "@fontsource/ibm-plex-mono/500.css";
import "virtual:theme.css";
import "./index.css";
import App from "./App.jsx";
import { projects } from "./data/projects";
import { NOT_FOUND_PATH, resolveRoute } from "./routes";

const container = document.getElementById("root");
const path = window.location.pathname.endsWith("/")
  ? window.location.pathname
  : `${window.location.pathname}/`;
const app = (
  <StrictMode>
    <App path={path} />
  </StrictMode>
);

// Production builds ship pre-rendered HTML for each page (scripts/prerender.mjs),
// tagged with the path it was rendered for. React takes it over when it is this
// page's HTML (the 404 page's HTML is served for any unknown URL, so it matches
// every not-found path); otherwise (dev server, or a host serving another page's
// HTML for this URL) it renders from scratch.
const rendered = container.dataset.path;
const matches =
  rendered === path || (rendered === NOT_FOUND_PATH && resolveRoute(path, projects).page === "not-found");
if (container.hasChildNodes() && matches) hydrateRoot(container, app);
else createRoot(container).render(app);
