import { Component } from "react";
import { navLink } from "../../data/nav";
import "./SectionHeader.css";

/**
 * Every section's heading block: the heading and an optional sub line.
 * The heading is `title`; a section with no separate title (education) uses
 * its navbar label from src/data/nav.js as the heading instead.
 */
export class SectionHeader extends Component {
  render() {
    const { id, title, sub, as: Heading = "h2" } = this.props;

    return (
      <header className="section-header">
        {title ? (
          <Heading className="section-header-title">{title}</Heading>
        ) : (
          <Heading className="section-header-label">{navLink(id).label}</Heading>
        )}
        {sub ? <p className="section-header-sub">{sub}</p> : null}
      </header>
    );
  }
}
