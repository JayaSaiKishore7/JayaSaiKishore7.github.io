import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeInjector } from "./theme/ThemeInjector";
import "./index.css";
import App from "./App.jsx";

ThemeInjector.apply();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
