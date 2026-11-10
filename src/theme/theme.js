// The site's design tokens: the only place colours, fonts, sizes and motion
// values are defined. src/theme/themeCss.js turns this into CSS variables at
// build time. Every component stylesheet uses those variables, never raw values.
//
// Light is the default theme (every visit starts in it); dark is the
// alternative the navbar toggle switches to.
export const theme = {
  colors: {
    // Text colours reach WCAG AA (4.5:1) on bg, surface and surfaceSoft.
    dark: {
      bg: "#080808",
      surface: "#111111",
      surfaceSoft: "#161616",
      border: "#222224",
      borderStrong: "#353537",
      text: "#efeee9",
      soft: "#c2c1bb",
      muted: "#86857f",
      // Decorative only (bullets, scrollbar): too low contrast for text.
      mutedSoft: "#5c5b56",
      accent: "#f2a65a",
      onAccent: "#080808",
      status: "#6fd88f",
      highlight: "#f2c94c",
    },
    // Default. Paper and ink. The accent is a darker orange from the same family:
    // 5.0:1 on bg, 5.5:1 on surface, 4.7:1 on surfaceSoft; white on it is 5.5:1.
    light: {
      bg: "#F6F4EE",
      surface: "#FFFFFF",
      surfaceSoft: "#EFECE3",
      border: "#DCD8CC",
      borderStrong: "#BDB8A9",
      text: "#15171A",
      soft: "#3A3D40",
      muted: "#5E625F",
      // Decorative only, like dark's mutedSoft.
      mutedSoft: "#BDB8A9",
      accent: "#A84F06",
      onAccent: "#FFFFFF",
      // Graphics only (the status dot): below the 4.5:1 needed for text.
      status: "#1E9E55",
      highlight: "#8A5A00",
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
    nav: "0 8px 30px rgba(0, 0, 0, 0.18)",
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
