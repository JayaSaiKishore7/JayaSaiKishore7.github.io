import { Component } from "react";
import { theme } from "../../theme/theme";
import "./ThemeToggle.css";

/**
 * Switches between the light and dark themes. Every visit starts in light
 * (set on <html> by index.html); this button flips data-theme for the rest of
 * the visit. Both icons are rendered and CSS shows the right one, so the button
 * is correct even before React takes over.
 *
 * It also recolours the browser's own bar (<meta name="theme-color">, written
 * by src/data/head.js) so it always matches the theme on screen. A
 * prefers-color-scheme media query wouldn't: the site ignores the device
 * setting and always starts light.
 *
 * The switch is one soft cross-fade of the whole page (View Transitions API;
 * the fade itself is styled in index.css). Meanwhile html.theme-switching turns
 * off the per-element colour transitions, so nothing fades twice. Browsers
 * without the API, and reduced motion, keep the plain per-element fade.
 */
export class ThemeToggle extends Component {
  constructor(props) {
    super(props);
    this.state = { dark: false };
    this.toggle = this.toggle.bind(this);
    this.sync = this.sync.bind(this);
  }

  // The theme lives on <html>, not in this button: the button only mirrors it,
  // so it stays right whatever changes data-theme (and if a page ever has two).
  componentDidMount() {
    this.sync();
    this.watcher = new MutationObserver(this.sync);
    this.watcher.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  componentWillUnmount() {
    this.watcher?.disconnect();
  }

  sync() {
    const dark = document.documentElement.dataset.theme === "dark";
    if (dark !== this.state.dark) this.setState({ dark });
  }

  toggle() {
    const root = document.documentElement;
    const dark = root.dataset.theme !== "dark";
    const apply = () => {
      root.dataset.theme = dark ? "dark" : "light";
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", dark ? theme.colors.dark.bg : theme.colors.light.bg);
    };

    const crossFade =
      typeof document.startViewTransition === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (crossFade) {
      root.classList.add("theme-switching");
      const transition = document.startViewTransition(apply);
      transition.finished.finally(() => root.classList.remove("theme-switching"));
    } else {
      apply();
    }
  }

  render() {
    return (
      <button
        type="button"
        className="theme-toggle"
        aria-label="dark theme"
        aria-pressed={this.state.dark}
        onClick={this.toggle}
      >
        <svg className="theme-toggle-sun" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
        <svg className="theme-toggle-moon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      </button>
    );
  }
}
