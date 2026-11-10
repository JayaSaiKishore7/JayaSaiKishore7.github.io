import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
// Self-hosted fonts (font-display: swap): Geist for body text, Fraunces for the
// name and headings (upright and italic, with optical sizing), IBM Plex Mono
// for labels, numbers and links.
import "@fontsource-variable/geist";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource/ibm-plex-mono/400.css";
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
