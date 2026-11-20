import { Component } from "react";
import { NeuralNet } from "../Hero/NeuralNet";
import "./Loader.css";

const MESSAGES = ["loading weights…", "training model…", "running inference…"];
// From the moment the loader's CSS animations start (its first paint): three
// messages of 900 ms each (Loader.css), then the 400 ms fade. ~3 s in all.
const SHOW_MS = 2600;
const FADE_MS = 400;

/**
 * The once-per-visit loading screen. index.html's inline script decides
 * whether it shows (html.loading: first page of the visit, motion allowed) and
 * removes it after 4 s whatever happens. The messages and progress bar are CSS
 * animations that start with the first paint; this component only ends it:
 * on time, on "skip" or on Escape. It stays in the page afterwards, hidden by
 * CSS (no html.loading), so nothing is unmounted or re-rendered. Ending removes html.loading, so the hero's
 * entrance (paused meanwhile, see Loader.css) plays, and fires "loader:done",
 * which starts the hero's detection boxes.
 */
export class Loader extends Component {
  constructor(props) {
    super(props);
    // Always rendered (it matches the pre-rendered HTML); CSS hides it unless
    // html.loading is set. Hidden, its network never counts as on screen, so
    // its animation loop never runs.
    this.state = { leaving: false };
    this.finish = this.finish.bind(this);
    this.skip = this.skip.bind(this);
    this.handleKey = this.handleKey.bind(this);
  }

  componentDidMount() {
    if (!document.documentElement.classList.contains("loading")) return;
    // If the fail-safe ends it first, stop listening too.
    window.addEventListener("loader:done", this.finish, { once: true });
    window.addEventListener("keydown", this.handleKey);
    // Count from when the CSS animations really started (their first paint, which
    // can come after this point), so the last message gets its full time; a slow
    // script load doesn't make it longer either.
    const schedule = (startTime) => {
      if (this.state.leaving) return;
      this.timer = setTimeout(() => this.end(FADE_MS), Math.max(0, startTime + SHOW_MS - performance.now()));
    };
    const animation = document.querySelector(".loader-fill")?.getAnimations()[0];
    if (animation) animation.ready.then((a) => schedule(a.startTime ?? performance.now()));
    else schedule(performance.now());
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    clearTimeout(this.fadeTimer);
    window.removeEventListener("loader:done", this.finish);
    window.removeEventListener("keydown", this.handleKey);
  }

  handleKey(event) {
    if (event.key === "Escape") this.skip();
  }

  skip() {
    this.end(0);
  }

  /** Fades out (or not, when skipped), then hands over to the page. */
  end(fade) {
    if (this.state.leaving) return;
    clearTimeout(this.timer);
    this.setState({ leaving: true });
    this.fadeTimer = setTimeout(() => {
      const root = document.documentElement;
      if (root.classList.contains("loading")) {
        root.classList.remove("loading");
        window.dispatchEvent(new Event("loader:done"));
      }
      this.finish();
    }, fade);
  }

  finish() {
    window.removeEventListener("keydown", this.handleKey);
    window.removeEventListener("loader:done", this.finish);
  }

  render() {
    const { leaving } = this.state;

    return (
      <div className={`loader${leaving ? " is-leaving" : ""}`}>
        <NeuralNet variant="loader" />
        {/* Decorative: screen readers go straight to the page content. */}
        <div className="loader-box" aria-hidden="true">
          <p className="loader-messages">
            {MESSAGES.map((message) => (
              <span key={message}>{message}</span>
            ))}
          </p>
          <span className="loader-bar">
            <span className="loader-fill" />
          </span>
        </div>
        <button type="button" className="loader-skip" aria-label="skip the loading animation" onClick={this.skip}>
          skip
        </button>
      </div>
    );
  }
}
