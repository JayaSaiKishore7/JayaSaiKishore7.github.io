/**
 * Turns theme.js into the CSS variables every stylesheet uses. Runs at build
 * time (and in the dev server) through the theme plugin in vite.config.js,
 * which serves it as "virtual:theme.css", so the tokens are in the first
 * stylesheet the browser loads.
 *
 * Themes: light is the default and every visit starts in it (also without
 * JavaScript). The menu bar's theme toggle switches to dark by setting data-theme="dark"
 * on <html>, for the rest of that visit.
 */
const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function colourVariables(colours) {
  return Object.fromEntries(Object.entries(colours).map(([name, value]) => [`--${kebab(name)}`, value]));
}

export function cssVariables(t) {
  return {
    "--font-display": t.typography.fontDisplay,
    "--font-body": t.typography.fontBody,
    "--font-mono": t.typography.fontMono,
    "--size-name": t.typography.sizeName,
    "--size-heading": t.typography.sizeHeading,
    "--size-body": t.typography.sizeBody,
    "--size-ui": t.typography.sizeUi,
    "--size-small": t.typography.sizeSmall,
    "--line-body": t.typography.lineBody,
    "--tracking-name": t.typography.trackingName,
    "--tracking-heading": t.typography.trackingHeading,
    "--tracking-title": t.typography.trackingTitle,
    "--weight-name": t.typography.weightName,
    "--weight-display": t.typography.weightDisplay,
    "--weight-strong": t.typography.weightStrong,
    "--fs-display": t.typography.fsDisplay,
    "--fs-h2": t.typography.fsH2,
    "--fs-title": t.typography.fsTitle,
    "--fs-body": t.typography.fsBody,
    "--fs-meta": t.typography.fsMeta,
    "--fs-micro": t.typography.fsMicro,
    "--net-opacity": t.effects.netOpacity,
    "--radius-small": t.radii.small,
    "--radius-card": t.radii.card,
    "--radius-pill": t.radii.pill,
    "--shadow-nav": t.shadows.nav,
    "--shadow-soft": t.shadows.soft,
    "--space-section": t.spacing.section,
    "--space-gap": t.spacing.sectionGap,
    "--space-2": t.spacing.s2,
    "--space-3": t.spacing.s3,
    "--space-4": t.spacing.s4,
    "--space-6": t.spacing.s6,
    "--space-8": t.spacing.s8,
    "--space-12": t.spacing.s12,
    "--gut": t.spacing.gutter,
    "--ease": t.motion.ease,
    "--ease-exit": t.motion.easeExit,
    "--dur-quick": t.motion.quick,
    "--dur-colour": t.motion.colour,
    "--dur-move": t.motion.move,
    "--dur-reveal": t.motion.reveal,
    "--max-width": t.layout.maxWidth,
  };
}

const block = (selector, variables, extra = "") =>
  `${selector} {\n${Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n")}${extra ? `\n  ${extra}` : ""}\n}\n`;

export function themeToCss(t) {
  return [
    block(":root", { ...cssVariables(t), ...colourVariables(t.colors.light) }, "color-scheme: light;"),
    block(':root[data-theme="dark"]', colourVariables(t.colors.dark), "color-scheme: dark;"),
  ].join("\n");
}
