import { theme } from "./theme";

/**
 * Single point of contact between theme.js (the canonical, framework-agnostic
 * token source) and the CSS custom properties every stylesheet in the app
 * consumes. No component or .css file should ever declare a raw color, radius,
 * shadow, or font value directly — they reference var(--token) instead, and
 * this class is the only place those variables are produced.
 */
export class ThemeInjector {
  static cssVariableMap(t = theme) {
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
      "--max-width": t.layout.maxWidth,
    };
  }

  static apply(root = document.documentElement, t = theme) {
    const variables = ThemeInjector.cssVariableMap(t);
    Object.entries(variables).forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });
  }
}
