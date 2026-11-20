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
  "emotion-rag": {
    load: () => import("../../utils/emotionPipelineGL.js").then((m) => m.EmotionPipelineGL),
    still: { light: "/projects/emotion-rag-pipeline-light.webp", dark: "/projects/emotion-rag-pipeline-dark.webp" },
    caption: "illustration: a face goes through the cnn, and its top emotion (happy) searches the reviews for the 4 closest.",
  },
  "brain-tumor": {
    load: () => import("../../utils/brainCnnGL.js").then((m) => m.BrainCnnGL),
    still: { light: "/projects/brain-tumor-cnn-light.webp", dark: "/projects/brain-tumor-cnn-dark.webp" },
    caption: "illustration: mri slices of a brain go through 4 conv/pool blocks, and the predicted class (meningioma) rises.",
  },
};

export const hasCaseVisual = (project) => Boolean(VISUALS[project.id]);
