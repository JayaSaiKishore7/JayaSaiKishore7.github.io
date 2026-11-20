// The site's design tokens: the only place colours, fonts, sizes and motion
// values are defined. src/theme/themeCss.js turns this into CSS variables at
// build time. Every component stylesheet uses those variables, never raw values.
//
// Light is the default theme (every visit starts in it); dark is the
// alternative the navbar toggle switches to.
export const theme = {
  colors: {
    // The look comes from X-ray inspection: a light box (light theme) or film
    // (dark theme) in cool slate, with one teal for annotations.
    // Every text colour reaches WCAG AA (4.5:1) on bg, surface and surfaceSoft.
    // Ratios below are listed as bg / surface / surfaceSoft.
    //
    // Dark: X-ray film. Blue-black, not neutral black.
    //   text 15.0 / 13.7 / 12.6    soft 10.1 / 9.2 / 8.5    muted 5.9 / 5.4 / 4.9
    //   accent 8.9 / 8.2 / 7.5    highlight 11.5 / 10.5 / 9.6
    //   onAccent on accent: 8.9
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
      accent: "#4FC7D6",
      onAccent: "#0E1822",
      status: "#6fd88f",
      // A paler teal from the accent family.
      highlight: "#8ADCE6",
    },
    // Default. Light box: cool film-white and slate ink.
    //   text 14.2 / 16.1 / 13.1    soft 9.2 / 10.5 / 8.5    muted 5.2 / 5.9 / 4.8
    //   accent 5.3 / 6.0 / 4.8    highlight 7.2 / 8.1 / 6.6
    //   onAccent (white) on accent: 6.0
    light: {
      bg: "#EEF1F4",
      surface: "#FFFFFF",
      surfaceSoft: "#E3E8ED",
      border: "#CDD5DD",
      borderStrong: "#A9B4BF",
      text: "#17222E",
      soft: "#33414F",
      // Slightly darker than #5B6B7A, which was only 4.45:1 on surfaceSoft.
      muted: "#566676",
      // Decorative only, like dark's mutedSoft.
      mutedSoft: "#A9B4BF",
      accent: "#0C6E7A",
      onAccent: "#FFFFFF",
      // Graphics only (the status dot): 3.0 / 3.5 / 2.8, below the 4.5:1 needed for text.
      status: "#1E9E55",
      // A deeper teal from the accent family.
      highlight: "#095863",
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
    // Strength of the hero's 3D network background (NeuralNet), light and dark.
    // Text contrast behind it is protected by NeuralNet's calm masks (measured).
    netOpacity: "1",
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
