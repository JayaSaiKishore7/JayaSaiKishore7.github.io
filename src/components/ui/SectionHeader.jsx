import { Component } from "react";
import { navLink } from "../../data/nav";
import "./SectionHeader.css";

/**
 * A section's heading block: the mono index label ("01 · work", numbered from
 * src/data/nav.js), the serif heading, and an optional sub line.
 */
export class SectionHeader extends Component {
  render() {
    const { id, title, sub, as: Heading = "h2" } = this.props;
    const { number, label } = navLink(id);

    return (
      <header className="section-header">
        <p className="section-header-label">
          {number} · {label}
        </p>
        {title ? <Heading className="section-header-title">{title}</Heading> : null}
        {sub ? <p className="section-header-sub">{sub}</p> : null}
      </header>
    );
  }
}
