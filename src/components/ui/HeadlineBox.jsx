import { PureComponent } from "react";
import "./HeadlineBox.css";

/** A detector-style confidence for a label: fixed per text, between 0.93 and 0.98. */
const confidence = (text) => {
  let sum = 0;
  for (const char of text) sum += char.charCodeAt(0);
  return (0.93 + (sum % 6) / 100).toFixed(2);
};

/**
 * Wraps a headline's text in an object-detection bounding box with a small
 * label ("work 0.96"), like the hero name's box but drawn once and kept. Pure
 * CSS: in the pre-rendered page, drawn in when its Reveal becomes visible
 * (straight away outside a Reveal). The label is decoration (aria-hidden), so
 * the heading's accessible name is only its text.
 */
export class HeadlineBox extends PureComponent {
  render() {
    const { label, children } = this.props;
    return (
      <span className="headline-box">
        {children}
        <span className="headline-box-label" aria-hidden="true">
          {label} {confidence(label)}
        </span>
      </span>
    );
  }
}
