export const theme = {
  colors: {
    bg: "#080808",
    bgSoft: "#111111",
    border: "#222224",
    borderStrong: "#353537",
    text: "#efeee9",
    soft: "#c2c1bb",
    muted: "#86857f",
    // Decorative only (bullets, scrollbar): about 2.9:1 on bg, too low for text.
    mutedSoft: "#5c5b56",
    accent: "#f2a65a",
    onAccent: "#080808",
    status: "#6fd88f",
    highlight: "#f2c94c",
  },

  typography: {
    fontDisplay: '"IBM Plex Sans", Arial, system-ui, sans-serif',
    fontMono: '"IBM Plex Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
    fontSerif: '"Fraunces Variable", Georgia, "Times New Roman", serif',
  },

  radii: {
    pill: "999px",
  },

  spacing: {
    section: "clamp(20px, 2.6vw, 36px)",
    gutter: "24px",
  },

  easing: {
    standard: "cubic-bezier(0.16, 1, 0.3, 1)",
  },

  layout: {
    maxWidth: "1200px",
  },
};
