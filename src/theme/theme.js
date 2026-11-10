// The site's design tokens: the only place colours, fonts, sizes and motion
// values are defined. src/theme/themeCss.js turns this into CSS variables at
// build time. Every component stylesheet uses those variables, never raw values.
//
// "Inspection report": a light, calm, editorial look, with a dark mode.
export const theme = {
  colors: {
    // Default. Every text colour below reaches WCAG AA (4.5:1) on bg, surface and surfaceSoft.
    light: {
      bg: "#F6F4EE",
      surface: "#FFFFFF",
      surfaceSoft: "#EFECE3",
      border: "#DCD8CC",
      borderStrong: "#BDB8A9",
      text: "#15171A",
      soft: "#3A3D40",
      muted: "#5E625F",
      accent: "#2447F9",
      onAccent: "#FFFFFF",
      // Graphics only (the status dot): 3.2:1 on white, below the 4.5:1 needed for text.
      status: "#1E9E55",
    },
    dark: {
      bg: "#0C0E12",
      surface: "#14171D",
      surfaceSoft: "#1A1E26",
      border: "#252A33",
      borderStrong: "#3A414D",
      text: "#ECEEF1",
      soft: "#C3C7CE",
      muted: "#8B919B",
      accent: "#8196FF",
      onAccent: "#0C0E12",
      status: "#6FD88F",
    },
  },

  typography: {
    fontDisplay: '"Fraunces Variable", Georgia, "Times New Roman", serif',
    fontBody: '"Geist Variable", "Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif',
    fontMono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    // Type scale
    sizeName: "clamp(3.2rem, 9vw, 7.5rem)",
    sizeHeading: "clamp(2rem, 4.5vw, 3.4rem)",
    sizeBody: "1rem",
    lineBody: "1.7",
  },

  radii: {
    card: "14px",
    pill: "999px",
  },

  shadows: {
    // The one shadow on the site: under the floating navbar.
    nav: "0 8px 30px rgba(15, 20, 30, 0.08)",
  },

  spacing: {
    section: "clamp(36px, 4.5vw, 64px)",
    gutter: "24px",
  },

  motion: {
    ease: "cubic-bezier(0.16, 1, 0.3, 1)",
    colour: "250ms",
    move: "500ms",
    reveal: "700ms",
  },

  layout: {
    maxWidth: "1200px",
  },
};
