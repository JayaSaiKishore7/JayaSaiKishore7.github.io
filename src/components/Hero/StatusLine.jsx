import { PureComponent } from "react";
import { heroText } from "../../data/profile";

/**
 * The hero's training-log line: "run N · epoch E · loss X.XX", the loss in
 * the accent. The numbers follow the loss landscape
 * (Hero passes them to show()); screen readers get one fixed sentence
 * instead of numbers that change every frame.
 *
 * The starting state (also what the prerendered page shows) is a finished
 * run: epoch 50, loss 0.03.
 */
export class StatusLine extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { run: 1, epoch: 50, loss: "0.03" };
  }

  /** New numbers; re-renders only when what's shown actually changes. */
  show({ run, epoch, loss }) {
    this.setState({ run, epoch, loss: loss.toFixed(2) });
  }

  render() {
    const { run, epoch, loss } = this.state;
    return (
      <div className="hero-status">
        <p className="hero-status-run">
          <span className="sr-only">{heroText.statusText}</span>
          <span aria-hidden="true">
            run {run} · epoch {epoch} · <span className="hero-status-loss">loss {loss}</span>
          </span>
        </p>
      </div>
    );
  }
}
