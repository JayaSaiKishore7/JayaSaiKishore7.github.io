import { Component } from "react";
import { Chip } from "../ui/Chip";
import "./TechList.css";

/** A project's technologies as chips. */
export class TechList extends Component {
  render() {
    const { items, label = "technologies" } = this.props;
    return (
      <ul className="tech-list" aria-label={label}>
        {items.map((item) => (
          <li key={item}>
            <Chip>{item}</Chip>
          </li>
        ))}
      </ul>
    );
  }
}
