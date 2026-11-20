import { PureComponent } from "react";
import { contactInfo, profile } from "../../data/profile";
import { Reveal } from "../Reveal";
import "./Connect.css";

const GithubIcon = () => (
  <svg className="social-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="social-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M14.82 0H1.18C.53 0 0 .52 0 1.16v13.68C0 15.48.53 16 1.18 16h13.64c.65 0 1.18-.52 1.18-1.16V1.16C16 .52 15.47 0 14.82 0ZM4.75 13.63H2.38V6h2.37v7.63ZM3.56 4.97a1.37 1.37 0 1 1 0-2.74 1.37 1.37 0 0 1 0 2.74Zm10.07 8.66h-2.37V9.92c0-.87-.02-1.98-1.21-1.98-1.21 0-1.4.95-1.4 1.92v3.77H6.28V6h2.28v1.04h.03c.32-.6 1.09-1.21 2.24-1.21 2.4 0 2.8 1.58 2.8 3.63v4.17Z" />
  </svg>
);

// Copy-button states: idle → copied | failed → (after a moment) idle.
const COPY_LABELS = { idle: "copy email", copied: "copied", failed: "copy failed" };
const COPY_RESET_MS = 1800;

// Typing the two terminal lines (decoration): like the loading screen's log.
const TYPE_MS = 28; // per character
const LINE_PAUSE_MS = 300; // before each line
const CURSOR_MS = 3000; // the block cursor blinks this long, then goes
const LINES = contactInfo.terminal;

/**
 * The contact section: an "inference terminal" card (the same dark screen in
 * both themes). The two terminal lines are typed once when the card scrolls
 * into view; everything real (heading, intro, email, buttons, closing line) is
 * in the pre-rendered HTML and visible from the start. Without JavaScript, or
 * with reduced motion, the lines simply show in full.
 */
export class Connect extends PureComponent {
  constructor(props) {
    super(props);
    // typed: null = both lines in full; otherwise characters shown per line.
    this.state = { copy: "idle", typed: null, cursor: false };
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
    clearTimeout(this.copyTimeout);
  }

  handleIntersect = (entries) => {
    const entry = entries[entries.length - 1];
    if (!entry.isIntersecting) return;
    if (this.state.typed === null) this.setState({ typed: [0, 0] });
    if (entry.intersectionRatio >= 0.4) {
      this.observer.disconnect(); // once
      this.typeLine(0);
    }
  };

  later(fn, ms) {
    this.timers.push(setTimeout(fn, ms));
  }

  /** Types line `index` one character at a time, then the next line, then the cursor. */
  typeLine(index) {
    const text = LINES[index];
    const step = (count) => {
      this.setState(({ typed }) => {
        const next = [...typed];
        next[index] = count;
        return { typed: next };
      });
      if (count < text.length) this.later(() => step(count + 1), TYPE_MS);
      else if (index + 1 < LINES.length) this.typeLine(index + 1);
      else {
        this.setState({ cursor: true });
        this.later(() => this.setState({ cursor: false }), CURSOR_MS);
      }
    };
    this.later(() => step(1), LINE_PAUSE_MS);
  }

  handleCopy = async () => {
    try {
      // Throws if the Clipboard API is missing (non-HTTPS) or permission is denied.
      await navigator.clipboard.writeText(contactInfo.email);
      this.setCopy("copied");
    } catch {
      this.setCopy("failed");
    }
  };

  setCopy(copy) {
    this.setState({ copy });
    clearTimeout(this.copyTimeout);
    this.copyTimeout = setTimeout(() => this.setState({ copy: "idle" }), COPY_RESET_MS);
  }

  renderLine(text, index) {
    const { typed, cursor } = this.state;
    const shown = typed === null ? text.length : typed[index];
    const last = index === LINES.length - 1;
    return (
      <p className={`term-line term-line--${index === 0 ? "command" : "result"}`} key={text}>
        {text.slice(0, shown)}
        {last && cursor ? <span className="term-cursor">▋</span> : null}
        {/* The rest stays in place, invisible, so the card never changes height while typing. */}
        <span className="term-ghost">{text.slice(shown)}</span>
      </p>
    );
  }

  render() {
    const { copy } = this.state;
    const mailto = `mailto:${contactInfo.email}`;

    return (
      <section id="contact" className="section">
        <div className="container">
          <Reveal as="div" className="section-rule" aria-hidden="true" />

          <Reveal as="div">
            <div className="term" ref={this.setCardRef}>
              <div className="term-lines" aria-hidden="true">
                {LINES.map((line, i) => this.renderLine(line, i))}
              </div>

              <h2 className="term-heading">{contactInfo.heading}</h2>
              <p className="term-intro">{contactInfo.intro}</p>

              <p className="term-email">
                <a href={mailto}>{contactInfo.email}</a>
              </p>

              <div className="term-actions">
                {/* The accessible name starts with the visible words (WCAG 2.5.3). */}
                <a href={mailto} className="term-btn term-btn--primary" aria-label={`${contactInfo.emailLabel}, email me`}>
                  {contactInfo.emailLabel}
                </a>
                <a href={profile.linkedin} className="term-btn" target="_blank" rel="noopener noreferrer">
                  <LinkedinIcon />
                  linkedin
                </a>
                <a href={profile.github} className="term-btn" target="_blank" rel="noopener noreferrer">
                  <GithubIcon />
                  github
                </a>
                <button type="button" className="term-btn" data-state={copy} onClick={this.handleCopy}>
                  <span aria-live="polite">{COPY_LABELS[copy]}</span>
                </button>
                <a href={profile.resume} download className="term-btn">
                  resume ↓
                </a>
              </div>

              <p className="term-closing">
                <span className="term-prompt" aria-hidden="true">
                  &gt;
                </span>{" "}
                {contactInfo.closing}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }
}
