import { Component } from "react";

/**
 * One rail of the side nav: a dashed vertical line from `from` down to just
 * above `y`, ending in a rounded hook that turns toward the item at `y`.
 * Positions are handed to CSS as custom properties; SideNav.css draws and
 * animates them, so moving the hook is a CSS transition, not JS.
 */
export class HookRail extends Component {
  render() {
    const { from = 0, y, visible, variant } = this.props;
    const shown = visible && y !== null;

    return (
      <span
        aria-hidden="true"
        className={`hook-rail hook-rail--${variant}${shown ? " is-visible" : ""}`}
        style={{ "--rail-from": `${from}px`, "--rail-y": `${y ?? 0}px` }}
      >
        <span className="hook-rail-line" />
        <svg className="hook-rail-corner" width="12" height="7" viewBox="0 0 12 7" fill="none">
          <path d="M0.5 0a6 6 0 0 0 6 6H12" stroke="currentColor" strokeDasharray="2 2" />
        </svg>
      </span>
    );
  }
}
