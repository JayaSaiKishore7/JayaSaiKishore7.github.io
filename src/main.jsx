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
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production builds ship pre-rendered HTML (scripts/prerender.mjs), which React
// takes over; the dev server serves an empty root, which React fills.
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);
