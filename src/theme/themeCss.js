/**
 * Turns theme.js into the `:root { --token: value }` block every stylesheet
 * uses. Runs at build time (and in the dev server) through the theme plugin in
 * vite.config.js, which serves it as the CSS module "virtual:theme.css". The
 * tokens are therefore in the first stylesheet the browser loads: no flash of
 * unstyled (white) page while JavaScript downloads.
 */
export function cssVariables(t) {
  return {
    "--bg": t.colors.bg,
    "--bg-soft": t.colors.bgSoft,
    "--border": t.colors.border,
    "--border-strong": t.colors.borderStrong,
    "--text": t.colors.text,
    "--soft": t.colors.soft,
    "--muted": t.colors.muted,
    "--muted-soft": t.colors.mutedSoft,
    "--accent": t.colors.accent,
    "--on-accent": t.colors.onAccent,
    "--status": t.colors.status,
    "--highlight": t.colors.highlight,
    "--font-display": t.typography.fontDisplay,
    "--font-mono": t.typography.fontMono,
    "--font-serif": t.typography.fontSerif,
    "--radius-pill": t.radii.pill,
    "--space-section": t.spacing.section,
    "--gut": t.spacing.gutter,
    "--ease": t.easing.standard,
    "--ease-spring": t.easing.spring,
    "--max-width": t.layout.maxWidth,
  };
}

export function themeToCss(t) {
  const lines = Object.entries(cssVariables(t)).map(([name, value]) => `  ${name}: ${value};`);
  return `:root {\n${lines.join("\n")}\n}\n`;
}
