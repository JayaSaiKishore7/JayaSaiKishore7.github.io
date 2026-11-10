import { Component } from "react";
import "./TechList.css";

/** A project's technologies as small tags. */
export class TechList extends Component {
  render() {
    const { items, label = "technologies" } = this.props;
    return (
      <ul className="tech-list" aria-label={label}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
}
