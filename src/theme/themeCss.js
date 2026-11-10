/**
 * Turns theme.js into the CSS variables every stylesheet uses. Runs at build
 * time (and in the dev server) through the theme plugin in vite.config.js,
 * which serves it as "virtual:theme.css", so the tokens are in the first
 * stylesheet the browser loads.
 *
 * Themes: light is the default. index.html sets data-theme="light|dark" on
 * <html> before the first paint (saved choice, else the system setting).
 * Without JavaScript, the system setting still picks the colours.
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
    "--line-body": t.typography.lineBody,
    "--radius-card": t.radii.card,
    "--radius-pill": t.radii.pill,
    "--shadow-nav": t.shadows.nav,
    "--space-section": t.spacing.section,
    "--gut": t.spacing.gutter,
    "--ease": t.motion.ease,
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
  const light = colourVariables(t.colors.light);
  const dark = colourVariables(t.colors.dark);
  return [
    block(":root", { ...cssVariables(t), ...light }, "color-scheme: light;"),
    block(':root[data-theme="dark"]', dark, "color-scheme: dark;"),
    `@media (prefers-color-scheme: dark) {\n${block(":root:not([data-theme])", dark, "color-scheme: dark;")}}\n`,
  ].join("\n");
}
