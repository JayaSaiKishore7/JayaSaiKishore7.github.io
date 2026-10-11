export const theme = {
  colors: {
    bg: "#080808",
    bgSoft: "#111111",
    surface: "rgba(239, 238, 233, 0.035)",
    surfaceHover: "rgba(239, 238, 233, 0.065)",
    border: "#222224",
    borderStrong: "#353537",
    text: "#efeee9",
    soft: "#c2c1bb",
    muted: "#86857f",
    mutedSoft: "#5c5b56",
    accent: "#f2a65a",
    accentSoft: "#f7c48c",
    accent2: "#e8914a",
    onAccent: "#080808",
    status: "#6fd88f",
    highlight: "#f2c94c",
  },

  gradients: {
    accent: "linear-gradient(135deg, #f2a65a 0%, #e8914a 100%)",
  },

  typography: {
    fontDisplay: '"IBM Plex Sans", Arial, system-ui, sans-serif',
    fontMono: '"IBM Plex Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
    fontSerif: '"Fraunces", Georgia, "Times New Roman", serif',
  },

  radii: {
    lg: "1rem",
    md: "0.6rem",
    pill: "999px",
  },

  shadows: {
    soft: "0 10px 30px rgba(0, 0, 0, 0.5)",
    strong: "0 25px 60px rgba(0, 0, 0, 0.65)",
    // Cards sit on a near-black page, where a black shadow is invisible.
    // Lift reads as a warm bloom plus a faint light rim instead.
    lift: "0 14px 34px rgba(0, 0, 0, 0.55), 0 0 22px rgba(242, 166, 90, 0.07)",
  },

  spacing: {
    xs: "0.5rem",
    sm: "0.9rem",
    md: "1.5rem",
    lg: "2.5rem",
    xl: "4rem",
    section: "clamp(20px, 2.6vw, 36px)",
    gutter: "24px",
  },

  easing: {
    standard: "cubic-bezier(0.16, 1, 0.3, 1)",
  },

  /*
   * One tempo for the whole site. A single duration would be wrong (an
   * ambient glow and a text colour change should not take equally long),
   * so this is a three-step scale every transition snaps onto:
   *   fast  - micro feedback: colour, small hovers
   *   base  - the default: transforms, borders, lifts
   *   slow  - large moves: scroll reveals, ambient fades
   */
  durations: {
    fast: "250ms",
    base: "400ms",
    slow: "600ms",
  },

  layout: {
    maxWidth: "1200px",
  },
};
