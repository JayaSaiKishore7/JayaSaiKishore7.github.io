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
// page's HTML; otherwise (dev server, or a host serving another page's HTML for
// this URL) it renders from scratch.
if (container.hasChildNodes() && container.dataset.path === path) hydrateRoot(container, app);
else createRoot(container).render(app);
