/**
 * Which case studies have a 3D header visual (CaseVisual.jsx): how to load its
 * WebGL scene, its still pictures (rendered from the same scene, transparent
 * background, 880×550 for sharp screens) and the caption under it.
 * Kept out of CaseVisual.jsx: component files export components only.
 */
export const VISUALS = {
  "air-quality": {
    load: () => import("../../utils/forecastCurtainsGL.js").then((m) => m.ForecastCurtainsGL),
    still: { light: "/projects/air-quality-curtains-light.webp", dark: "/projects/air-quality-curtains-dark.webp" },
    caption: "illustration: pm10, no₂ and o₃ measured for 72 hours (metal), then forecast for the next 24 (teal).",
  },
};

export const hasCaseVisual = (project) => Boolean(VISUALS[project.id]);
