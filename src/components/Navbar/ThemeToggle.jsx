import { Component } from "react";
import "./ThemeToggle.css";

const STORAGE_KEY = "theme";

/**
 * Switches between the light and dark themes. The theme lives on <html>
 * (data-theme), set before the first paint by index.html; this button flips it
 * and remembers the choice. Both icons are rendered and CSS shows the right
 * one, so the button is correct even before React takes over.
 */
export class ThemeToggle extends Component {
  constructor(props) {
    super(props);
    this.state = { dark: false };
    this.toggle = this.toggle.bind(this);
  }

  componentDidMount() {
    this.sync();
  }

  sync() {
    const dark = document.documentElement.dataset.theme === "dark";
    if (dark !== this.state.dark) this.setState({ dark });
  }

  toggle() {
    const theme = this.state.dark ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage blocked: the choice simply isn't remembered.
    }
    this.setState({ dark: theme === "dark" });
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
