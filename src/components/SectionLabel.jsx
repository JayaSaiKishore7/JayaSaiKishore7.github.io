import { Component } from "react";
import { navLink } from "../data/nav";

/** The small "01 · work" label at the top of a section, numbered from src/data/nav.js. */
export class SectionLabel extends Component {
  render() {
    const { id, as: Tag = "p" } = this.props;
    const { number, label } = navLink(id);

    return (
      <Tag className="section-label">
        {number} · {label}
      </Tag>
    );
  }
}
