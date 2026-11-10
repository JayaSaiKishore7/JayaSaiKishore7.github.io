import { Component } from "react";
import "./ArrowLink.css";

/**
 * A text link with an arrow. On hover the underline draws in from the left
 * and the arrow slides 4px. `external` opens in a new tab with ↗; otherwise →.
 */
export class ArrowLink extends Component {
  render() {
    const { href, children, external = false, download, arrow, className = "" } = this.props;
    const glyph = arrow ?? (external ? "↗" : "→");

    return (
      <a
        href={href}
        className={`arrow-link ${className}`.trim()}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        {...(download ? { download: true } : {})}
      >
        <span className="arrow-link-text">{children}</span>
        <span className="arrow-link-arrow" aria-hidden="true">
          {glyph}
        </span>
      </a>
    );
  }
}
