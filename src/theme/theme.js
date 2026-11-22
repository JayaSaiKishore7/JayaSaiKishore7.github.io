// The site's design tokens: the only place colours, fonts, sizes and motion
// values are defined. src/theme/themeCss.js turns this into CSS variables at
// build time. Every component stylesheet uses those variables, never raw values.
//
// Light is the default theme (every visit starts in it); dark is the
// alternative the menu bar's theme toggle switches to.
export const theme = {
  colors: {
    // Black and orange: near-black ink on a light page (light theme) or X-ray
    // film in dark slate (dark theme), with one orange for annotations.
    // Every text colour reaches WCAG AA (4.5:1) on bg, surface and surfaceSoft.
    // Ratios below are listed as bg / surface / surfaceSoft.
    //
    // Dark: X-ray film. Blue-black, not neutral black.
    //   text 15.0 / 13.7 / 12.6    soft 10.1 / 9.2 / 8.5    muted 5.9 / 5.4 / 4.9
    //   accent 7.6 / 7.0 / 6.4    highlight 10.2 / 9.3 / 8.6
    //   onAccent on accent: 7.6
    dark: {
      bg: "#0E1822",
      surface: "#15212C",
      surfaceSoft: "#1B2835",
      border: "#26364A",
      borderStrong: "#3A4C60",
      text: "#E6ECF1",
      soft: "#B9C4CE",
      muted: "#8796A4",
      // Decorative only (bullets, scrollbar): too low contrast for text.
      mutedSoft: "#4A5B6C",
      // Graphics only: the high ground of the hero's loss landscape.
      neutral: "#5E7286",
      accent: "#FF8A3D",
      onAccent: "#0E1822",
      status: "#6fd88f",
      // A paler orange from the accent family.
      highlight: "#FFB37D",
    },
    // Default. A light page with near-black ink and a deep orange (neutral greys, no blue).
    //   text 16.8 / 18.9 / 15.5    soft 12.1 / 13.6 / 11.2    muted 6.2 / 6.9 / 5.7
    //   accent 5.4 / 6.1 / 5.0    highlight 7.1 / 8.0 / 6.6
    //   onAccent (white) on accent: 6.1
    light: {
      bg: "#F2F2F0",
      surface: "#FFFFFF",
      surfaceSoft: "#E9E9E6",
      border: "#D6D6D2",
      borderStrong: "#B5B5B0",
      text: "#111111",
      soft: "#2E2E2E",
      muted: "#5A5A5A",
      // Decorative only, like dark's mutedSoft.
      mutedSoft: "#B5B5B0",
      // Graphics only, like dark's neutral: a mid grey from the same family.
      neutral: "#8A8A86",
      accent: "#A84300",
      onAccent: "#FFFFFF",
      // Graphics only (the status dot): below the 4.5:1 needed for text.
      status: "#1E9E55",
      // A deeper orange from the accent family.
      highlight: "#8A3700",
    },
  },

  typography: {
    // One family for name, headings and body: Schibsted Grotesk (upright and italic).
    fontDisplay: '"Schibsted Grotesk Variable", system-ui, -apple-system, "Segoe UI", sans-serif',
    fontBody: '"Schibsted Grotesk Variable", system-ui, -apple-system, "Segoe UI", sans-serif',
    // Only for real data and measurements (detection labels) and code. Weight 500 only.
    fontMono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    // Type scale
    // Sized so the name stays on one line at 600 weight and its detection box keeps
    // 40px+ from the info card (measured: 73px at 1024, 46px at 1440).
    sizeName: "clamp(3rem, 8.4vw, 7rem)",
    sizeHeading: "clamp(2rem, 4.5vw, 3.4rem)",
    sizeBody: "1rem",
    sizeUi: "0.9375rem", // 15px: buttons, nav and text links
    sizeSmall: "0.8125rem", // 13px: labels, dates, captions (the smallest text size)
    lineBody: "1.7",
    // Letter-spacing: the bigger the text, the tighter.
    trackingName: "-0.035em", // the hero name and the case-study title
    trackingHeading: "-0.03em", // section headings, big contact and menu links
    trackingTitle: "-0.02em", // smaller headings: tagline, project, job and degree titles
    weightName: "600", // the hero name
    weightDisplay: "400", // headings
    weightStrong: "500", // emphasis without colour: active project, navbar name, case-study title
  },

  effects: {
    // Strength of the 3D network on the loading screen (NeuralNet), light and dark.
    netOpacity: "1",
  },

  radii: {
    // Small things and boxes nested inside a card (a nested corner is tighter
    // than the card's, so the gap between them stays even). Detection boxes
    // keep a nearly square corner so they still read as real bounding boxes.
    small: "6px",
    card: "18px",
    pill: "999px",
  },

  // Soft, slate-tinted depth (not grey), and only on the two raised things:
  // the floating navbar and the hero's info card.
  shadows: {
    nav: "0 1px 2px rgba(14, 24, 34, 0.06), 0 12px 34px -8px rgba(14, 24, 34, 0.2)",
    soft: "0 1px 2px rgba(14, 24, 34, 0.04), 0 14px 36px -14px rgba(14, 24, 34, 0.16)",
  },

  spacing: {
    section: "0px", // top and bottom padding of every section: none, sections follow straight on
    gutter: "24px",
  },

  // Soft and smooth: things arrive with a long, gentle landing (ease) and leave
  // with a quiet speed-up (easeExit). Hover and press feedback is quick.
  motion: {
    ease: "cubic-bezier(0.22, 1, 0.36, 1)", // arriving / moving: decelerates softly
    easeExit: "cubic-bezier(0.4, 0, 1, 1)", // leaving: starts gently, then goes
    quick: "180ms", // press feedback
    colour: "300ms", // hover colours
    move: "450ms", // things moving or opening
    reveal: "650ms", // content appearing
  },

  layout: {
    maxWidth: "1200px",
  },
};
