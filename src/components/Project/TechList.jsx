import { Component } from "react";
import { Chip } from "../ui/Chip";
import "./TechList.css";

/**
 * A project's technologies as chips. With `max`, only the first `max` are
 * shown and the rest collapse into one "+N" chip (keeping the list to one
 * row); screen readers still hear every name.
 */
export class TechList extends Component {
  render() {
    const { items, max, label = "technologies" } = this.props;
    const shown = max ? items.slice(0, max) : items;
    const rest = items.slice(shown.length);

    return (
      <ul className={`tech-list${max ? " tech-list--one-row" : ""}`} aria-label={label}>
        {shown.map((item) => (
          <li key={item}>
            <Chip>{item}</Chip>
          </li>
        ))}
        {rest.length ? (
          <li title={rest.join(", ")}>
            <Chip>
              <span aria-hidden="true">+{rest.length}</span>
              <span className="sr-only">{rest.join(", ")}</span>
            </Chip>
          </li>
        ) : null}
      </ul>
    );
  }
}
