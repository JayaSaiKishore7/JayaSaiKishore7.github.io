import { PureComponent } from "react";
import { contactInfo, profile } from "../../data/profile";
import { Reveal } from "../Reveal";
import { EXIT_TEXT, TrainingLog } from "../TrainingLog/TrainingLog";
import "./ContactCard.css";

const GithubIcon = () => (
  <svg className="contact-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="contact-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M14.82 0H1.18C.53 0 0 .52 0 1.16v13.68C0 15.48.53 16 1.18 16h13.64c.65 0 1.18-.52 1.18-1.16V1.16C16 .52 15.47 0 14.82 0ZM4.75 13.63H2.38V6h2.37v7.63ZM3.56 4.97a1.37 1.37 0 1 1 0-2.74 1.37 1.37 0 0 1 0 2.74Zm10.07 8.66h-2.37V9.92c0-.87-.02-1.98-1.21-1.98-1.21 0-1.4.95-1.4 1.92v3.77H6.28V6h2.28v1.04h.03c.32-.6 1.09-1.21 2.24-1.21 2.4 0 2.8 1.58 2.8 3.63v4.17Z" />
  </svg>
);

// Typing the terminal lines (decoration): like the loading screen's log, at
// an easy reading pace. The two run lines, then the training log's exit line.
const TYPE_MS = 60; // per character
const LINE_PAUSE_MS = 500; // before each line
const LINES = contactInfo.terminal;
const TYPED = [...LINES, EXIT_TEXT]; // everything that types, in order

/**
 * The contact section (#contact) and the page's footer, on every page: an
 * "inference terminal" card in the theme's colours. It opens with the run
 * ("$ python contact.py" → "match found") and its training log (TrainingLog):
 * the exit line under the run lines, the loss curve with epoch and loss in
 * the top-right corner. Then the contact details, and the © line.
 *
 * When the card scrolls into view, the two run lines and then the exit line
 * type out, once, at an easy reading pace; the loss curve beside them runs
 * from the start. Everything real (intro, buttons) is in the prerendered HTML
 * and visible from the start. Without JavaScript, or with reduced motion, the
 * lines simply show in full.
 *
 * State
 *   typed   null = every line in full; otherwise characters shown per TYPED line
 */
export class ContactCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { typed: null };
    this.cardRef = null;
    this.timers = [];
  }

  setCardRef = (node) => {
    this.cardRef = node;
  };

  componentDidMount() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    // Two thresholds: as soon as the card peeks in, the lines clear; at 40% they start typing.
    this.observer = new IntersectionObserver(this.handleIntersect, { threshold: [0, 0.4] });
    this.observer.observe(this.cardRef);
  }

  componentWillUnmount() {
    this.observer?.disconnect();
    this.timers.forEach(clearTimeout);
  }

  handleIntersect = (entries) => {
    const entry = entries[entries.length - 1];
    if (!entry.isIntersecting) return;
    if (this.state.typed === null) this.setState({ typed: TYPED.map(() => 0) });
    if (entry.intersectionRatio >= 0.4) {
      this.observer.disconnect(); // once
      this.typeLine(0);
    }
  };

  later(fn, ms) {
    this.timers.push(setTimeout(fn, ms));
  }

  /** Types line `index` one character at a time, then the next line. */
  typeLine(index) {
    const text = TYPED[index];
    const step = (count) => {
      this.setState(({ typed }) => {
        const next = [...typed];
        next[index] = count;
        return { typed: next };
      });
      if (count < text.length) this.later(() => step(count + 1), TYPE_MS);
      else if (index + 1 < TYPED.length) this.typeLine(index + 1);
    };
    this.later(() => step(1), LINE_PAUSE_MS);
  }

  renderLine(text, index) {
    const { typed } = this.state;
    const shown = typed === null ? text.length : typed[index];
    return (
      <p className={`contact-line contact-line--${index === 0 ? "command" : "result"}`} key={text}>
        {text.slice(0, shown)}
        {/* The rest stays in place, invisible, so the card never changes height while typing. */}
        <span className="contact-ghost">{text.slice(shown)}</span>
      </p>
    );
  }

  render() {
    const mailto = `mailto:${contactInfo.email}`;
    const year = new Date().getFullYear();
    const { typed } = this.state;
    const exitChars = typed === null ? null : typed[TYPED.length - 1];

    return (
      <footer id="contact" className="section section--gap-after contact">
        <div className="container">
          <Reveal as="div">
            <div className="contact-card" ref={this.setCardRef}>
              {/* The run: its lines and exit line on the left; the loss curve with
                  epoch, loss and tagline on the right (stacked on narrow screens). */}
              <div className="contact-top">
                <div className="contact-lines" aria-hidden="true">
                  {LINES.map((line, i) => this.renderLine(line, i))}
                </div>

                {/* The run's result: the exit line (typed third) and the loss curve
                    with epoch and loss, which runs from the start. */}
                <div className="contact-log">
                  <TrainingLog exitChars={exitChars} />
                </div>
              </div>

              {/* No visible heading; screen readers still get one for the section. */}
              <h2 className="sr-only">contact</h2>
              <p className="contact-intro">{contactInfo.intro}</p>

              <div className="contact-actions">
                {/* The accessible name starts with the visible words (WCAG 2.5.3). */}
                <a
                  href={mailto}
                  className="contact-btn contact-btn--primary"
                  aria-label={`${contactInfo.emailLabel}, email me`}
                >
                  {contactInfo.emailLabel}
                </a>
                <a href={profile.linkedin} className="contact-btn" target="_blank" rel="noopener noreferrer">
                  <LinkedinIcon />
                  linkedin
                </a>
                <a href={profile.github} className="contact-btn" target="_blank" rel="noopener noreferrer">
                  <GithubIcon />
                  github
                </a>
              </div>


              {/* The year comes from the build; the browser may disagree right after New Year. */}
              <p className="contact-copy" suppressHydrationWarning>
                {contactInfo.copyright(year)}
              </p>
            </div>
          </Reveal>
        </div>
      </footer>
    );
  }
}
