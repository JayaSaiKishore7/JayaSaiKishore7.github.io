import { Component, createRef } from "react";
import { caseStudyPath } from "../../routes";
import { ProjectThumb } from "../Project/ProjectThumb";
import { TechList } from "../Project/TechList";
import "./ProjectSplit.css";

const AUTOPLAY_MS = 5000; // time each project stays before auto-play moves on
const HOVER_INTENT_MS = 80; // a hovered item must be rested on this long to take over
const STAGE_ID = "ps-stage";

// When each text part of an incoming preview starts rising in (after the image wipe begins).
const TEXT_DELAYS = { title: "150ms", text: "220ms", chips: "290ms", links: "360ms" };

/**
 * One project's preview: thumbnail, title, description, technologies, links.
 * variant "stage": one of the stacked desktop previews (hidden unless active).
 * variant "card": a phone gallery card (always fully shown).
 */
class ProjectPreview extends Component {
  render() {
    const { project, active = true, variant } = this.props;
    const href = caseStudyPath(project.id);
    const hidden = variant === "stage" && !active;
    const delay = (name) => ({ "--delay": TEXT_DELAYS[name] });

    return (
      <article
        className={`ps-preview ps-preview--${variant}${active ? " is-active" : ""}`}
        // Hidden stage previews stay in the page (for the crossfade) but out of
        // reach: screen readers skip them and their links can't be tabbed to.
        aria-hidden={hidden ? "true" : undefined}
        inert={hidden}
      >
        <a href={href} className="ps-frame" tabIndex={-1} aria-hidden="true">
          <div className="ps-zoom">
            <ProjectThumb project={project} decorative />
          </div>
        </a>

        <div className="ps-heading ps-rise" style={delay("title")}>
          {project.team ? <p className="ps-team">team project</p> : null}
          <h3>
            <a href={href}>{project.title}</a>
          </h3>
        </div>
        <p className="ps-what ps-rise" style={delay("text")}>
          {project.what}
        </p>
        <div className="ps-rise" style={delay("chips")}>
          <TechList items={project.tech} />
        </div>
        <p className="ps-links ps-rise" style={delay("links")}>
          <a href={href}>case study →</a>
          <a href={project.link} target="_blank" rel="noreferrer">
            github ↗
          </a>
          {project.demo ? (
            <a href={project.demo} target="_blank" rel="noreferrer">
              live demo ↗
            </a>
          ) : null}
        </p>
      </article>
    );
  }
}

/**
 * Projects as a split view on desktop (a list on the left, a sticky preview on
 * the right, auto-playing through the projects) and as a swipeable snap
 * gallery on phones.
 *
 * Both layouts are in the HTML and CSS shows the right one: the page is
 * pre-rendered without knowing the screen size, so this is correct from the
 * first paint. `isMobile` (matchMedia) only switches behaviour: no auto-play
 * on phones.
 *
 * State
 *   active    index of the selected project (desktop) / centred card (phones)
 *   isMobile  under 900px wide
 *   paused    the pointer is over the component or focus is inside it
 * Auto-play also stops when the tab is hidden, the section is off screen, or
 * the visitor prefers reduced motion.
 */
export class ProjectSplit extends Component {
  constructor(props) {
    super(props);
    this.state = { active: 0, isMobile: false, paused: false };

    this.rootRef = createRef();
    this.listRef = createRef();
    this.indicatorRef = createRef();
    this.scrollerRef = createRef();
    this.buttons = [];
    this.fills = [];
    this.cards = [];

    this.hoverTimer = null;
    this.frame = null; // auto-play animation frame
    this.startTime = null; // when the current auto-play interval began
    this.scrollFrame = null; // gallery scroll handling, once per frame
    this.inView = false;
    this.reducedMotion = false;
    this.indicatorPlaced = false;

    for (const name of [
      "tick",
      "updatePlayback",
      "placeIndicator",
      "handleMouseEnter",
      "handleMouseLeave",
      "handleFocus",
      "handleBlur",
      "handleKeyDown",
      "handleScroll",
      "handleMobileChange",
      "handleMotionChange",
    ]) {
      this[name] = this[name].bind(this);
    }
  }

  // ---------- lifecycle ----------

  componentDidMount() {
    this.mobileQuery = window.matchMedia("(max-width: 899px)");
    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.mobileQuery.addEventListener("change", this.handleMobileChange);
    this.motionQuery.addEventListener("change", this.handleMotionChange);
    this.reducedMotion = this.motionQuery.matches;
    // The pre-rendered page assumed desktop; correct that now, the same way a later change would.
    this.handleMobileChange(this.mobileQuery);

    document.addEventListener("visibilitychange", this.updatePlayback);

    // Only auto-play while the section is actually on screen.
    this.visibility = new IntersectionObserver(([entry]) => {
      this.inView = entry.isIntersecting;
      this.updatePlayback();
    });
    this.visibility.observe(this.rootRef.current);

    // Re-place the gliding bar whenever the list changes size (window resize,
    // fonts finishing loading, ...).
    this.resize = new ResizeObserver(this.placeIndicator);
    this.resize.observe(this.listRef.current);
  }

  componentDidUpdate(_, previous) {
    if (previous.active !== this.state.active) this.placeIndicator();
    if (previous.paused !== this.state.paused || previous.isMobile !== this.state.isMobile) {
      this.updatePlayback();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.hoverTimer);
    cancelAnimationFrame(this.frame);
    cancelAnimationFrame(this.scrollFrame);
    this.mobileQuery?.removeEventListener("change", this.handleMobileChange);
    this.motionQuery?.removeEventListener("change", this.handleMotionChange);
    document.removeEventListener("visibilitychange", this.updatePlayback);
    this.visibility?.disconnect();
    this.resize?.disconnect();
  }

  // ---------- selection ----------

  /** Makes project `index` active; a choice by the visitor restarts the auto-play timer. */
  select(index, { restart = true } = {}) {
    clearTimeout(this.hoverTimer);
    if (restart) this.restartTimer();
    if (index !== this.state.active) this.setState({ active: index });
  }

  handleItemEnter(index) {
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => this.select(index), HOVER_INTENT_MS);
  }

  handleKeyDown(event) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault(); // don't scroll the page
    const count = this.props.projects.length;
    const next = (this.state.active + (event.key === "ArrowDown" ? 1 : -1) + count) % count;
    this.select(next);
    this.buttons[next]?.focus();
  }

  // ---------- gliding indicator ----------

  /** Moves the single orange bar to the active button: one transform, measured from the button. */
  placeIndicator() {
    const bar = this.indicatorRef.current;
    const button = this.buttons[this.state.active];
    if (!bar || !button || !button.offsetHeight) return; // hidden (phone layout)

    // The bar is 1px tall in CSS; scaleY stretches it to the button's height.
    bar.style.transform = `translateY(${button.offsetTop}px) scaleY(${button.offsetHeight})`;

    if (!this.indicatorPlaced) {
      // First placement: jump into position instead of gliding from the top.
      bar.style.transition = "none";
      void bar.offsetWidth;
      bar.style.transition = "";
      bar.classList.add("is-placed");
      this.indicatorPlaced = true;
    }
  }

  // ---------- auto-play ----------

  /** Starts or stops the auto-play loop to match every condition that affects it. */
  updatePlayback() {
    const shouldRun =
      this.inView && !document.hidden && !this.reducedMotion && !this.state.isMobile && !this.state.paused;

    if (shouldRun && this.frame === null) {
      this.restartTimer();
      this.frame = requestAnimationFrame(this.tick);
    } else if (!shouldRun && this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }

  restartTimer() {
    this.startTime = null;
    this.fills.forEach((fill) => fill && (fill.style.transform = "scaleX(0)"));
  }

  /** One animation frame: grow the active progress line; at 100%, move to the next project. */
  tick(now) {
    if (this.startTime === null) this.startTime = now;
    const progress = Math.min((now - this.startTime) / AUTOPLAY_MS, 1);
    const fill = this.fills[this.state.active];
    if (fill) fill.style.transform = `scaleX(${progress})`;

    if (progress >= 1) {
      this.select((this.state.active + 1) % this.props.projects.length);
    }
    this.frame = requestAnimationFrame(this.tick);
  }

  // ---------- pause on hover / focus ----------

  handleMouseEnter() {
    this.setState({ paused: true });
  }

  handleMouseLeave() {
    clearTimeout(this.hoverTimer);
    if (!this.rootRef.current.contains(document.activeElement)) this.setState({ paused: false });
  }

  handleFocus() {
    this.setState({ paused: true });
  }

  handleBlur(event) {
    // Still paused if focus only moved to another element inside the component.
    if (!this.rootRef.current.contains(event.relatedTarget) && !this.rootRef.current.matches(":hover")) {
      this.setState({ paused: false });
    }
  }

  // ---------- media queries ----------

  handleMobileChange({ matches }) {
    if (matches !== this.state.isMobile) this.setState({ isMobile: matches });
  }

  handleMotionChange(event) {
    this.reducedMotion = event.matches;
    this.updatePlayback();
  }

  // ---------- phone gallery ----------

  /** On scroll (at most once per frame): the card nearest the centre becomes active. */
  handleScroll() {
    if (this.scrollFrame !== null) return;
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = null;
      const scroller = this.scrollerRef.current;
      const centre = scroller.scrollLeft + scroller.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      this.cards.forEach((card, i) => {
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - centre);
        if (distance < best) {
          best = distance;
          nearest = i;
        }
      });
      if (nearest !== this.state.active) this.setState({ active: nearest });
    });
  }

  /** Scrolls the gallery so card `index` sits in the centre. */
  scrollToCard(index) {
    const scroller = this.scrollerRef.current;
    const card = this.cards[index];
    if (!scroller || !card) return;
    scroller.scrollTo({
      left: card.offsetLeft - (scroller.clientWidth - card.offsetWidth) / 2,
      behavior: this.reducedMotion ? "auto" : "smooth",
    });
  }

  step(direction) {
    const count = this.props.projects.length;
    this.scrollToCard((this.state.active + direction + count) % count);
  }

  // ---------- render ----------

  render() {
    const { projects } = this.props;
    const { active } = this.state;
    const pad = (n) => String(n).padStart(2, "0");

    return (
      <div
        ref={this.rootRef}
        className="ps"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      >
        {/* ---------- desktop: list + preview stage ---------- */}
        <div className="ps-split">
          {/* The nav box holds the list plus the one gliding bar (a <ul> may only contain <li>s). */}
          <div ref={this.listRef} className="ps-nav">
            <span ref={this.indicatorRef} className="ps-indicator" aria-hidden="true" />
            <ul className="ps-list" onKeyDown={this.handleKeyDown}>
              {projects.map((project, i) => (
                <li key={project.id} className={`ps-item${i === active ? " is-active" : ""}`}>
                  <button
                    type="button"
                    ref={(el) => {
                      this.buttons[i] = el;
                    }}
                    className="ps-select"
                    aria-pressed={i === active}
                    aria-controls={STAGE_ID}
                    onMouseEnter={() => this.handleItemEnter(i)}
                    onMouseLeave={() => clearTimeout(this.hoverTimer)}
                    onFocus={() => this.select(i)}
                    onClick={() => this.select(i)}
                  >
                    <span className="ps-index">{pad(i + 1)}</span>
                    <span className="ps-title">{project.title}</span>
                  </button>
                  {/* Auto-play progress: the fill grows from 0 to full width (scaleX) over 5 s. */}
                  <span className="ps-progress" aria-hidden="true">
                    <span
                      className="ps-fill"
                      ref={(el) => {
                        this.fills[i] = el;
                      }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ps-stage" id={STAGE_ID}>
            {projects.map((project, i) => (
              <ProjectPreview key={project.id} project={project} active={i === active} variant="stage" />
            ))}
          </div>
        </div>

        {/* ---------- phones: snap gallery ---------- */}
        <div className="ps-gallery">
          <div className="ps-gallery-bar">
            <p className="ps-counter" aria-live="polite">
              {pad(active + 1)} / {pad(projects.length)}
            </p>
            <div className="ps-arrows">
              <button type="button" aria-label="previous project" onClick={() => this.step(-1)}>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M10 3 5 8l5 5" />
                </svg>
              </button>
              <button type="button" aria-label="next project" onClick={() => this.step(1)}>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="m6 3 5 5-5 5" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={this.scrollerRef} className="ps-scroller" onScroll={this.handleScroll}>
            {projects.map((project, i) => (
              <div
                key={project.id}
                ref={(el) => {
                  this.cards[i] = el;
                }}
                className={`ps-card${i === active ? " is-centered" : ""}`}
              >
                <ProjectPreview project={project} variant="card" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
