import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";

/** Renders the page to HTML at build time (used by scripts/prerender.mjs). */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
