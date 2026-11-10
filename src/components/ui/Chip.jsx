import { Component } from "react";
import "./Chip.css";

/** A small rounded tag, e.g. a technology. */
export class Chip extends Component {
  render() {
    const { as: Tag = "span", children } = this.props;
    return <Tag className="chip">{children}</Tag>;
  }
}
