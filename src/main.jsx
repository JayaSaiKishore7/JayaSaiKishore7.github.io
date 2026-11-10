import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
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
