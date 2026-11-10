import { Component, createRef } from "react";
import { caseStudyPath } from "../../routes";
import { ProjectThumb } from "../Project/ProjectThumb";
import { TechList } from "../Project/TechList";
import "./ProjectSplit.css";

const AUTOPLAY_MS = 5000; // time each project stays before auto-play moves on
const HOVER_INTENT_MS = 80; // a hovered item must be rested on this long to take over
const STAGE_ID = "ps-stage";
const CHIP_MAX = 3; // chips shown on a slide; the rest become one "+N" chip

const pad = (n) => String(n).padStart(2, "0");

/**
 * One project's slide: its screenshot in a small browser-style window, then a
 * fixed text block (title, two-line description, one row of chips, links).
 * variant "stage": one of the stacked desktop slides (hidden unless active).
 * variant "card": a phone gallery card (always fully shown).
 */
class ProjectPreview extends Component {
  render() {
    const { project, variant, active = true, leaving = false } = this.props;
    const href = caseStudyPath(project.id);
    const hidden = variant === "stage" && !active;
    const state = active ? " is-active" : leaving ? " is-leaving" : "";

    return (
      <article
        className={`ps-preview ps-preview--${variant}${state}`}
        // Hidden slides stay in the page (for the transitions) but out of reach:
        // screen readers skip them and their links can't be tabbed to.
        aria-hidden={hidden ? "true" : undefined}
        inert={hidden}
      >
        <a href={href} className="ps-window" tabIndex={-1} aria-hidden="true">
          <span className="ps-window-bar">
            <span className="ps-window-dots" />
            <span className="ps-window-id">{project.id}</span>
          </span>
          <span className="ps-window-body">
            <span className="ps-wipe">
              <span className="ps-settle">
                <ProjectThumb project={project} decorative />
              </span>
            </span>
          </span>
        </a>

        <div className="ps-text">
          {project.team ? <p className="ps-team">team project</p> : null}
          <h3>
            <a href={href}>{project.title}</a>
          </h3>
          <p className="ps-what">{project.what}</p>
          <TechList items={project.tech} max={CHIP_MAX} />
          <p className="ps-links">
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
        </div>
      </article>
    );
  }
}

/**
 * Projects as a split view on desktop (a grouped list on the left, a sticky
 * slide stage on the right that auto-plays through the projects) and as a
 * swipeable snap gallery on phones.
 *
 * Both layouts are in the HTML and CSS shows the right one, so the pre-rendered
 * page is correct from the first paint; `isMobile` (matchMedia) only switches
 * behaviour (no auto-play on phones).
 *
 * State
 *   active     index of the selected project (desktop) / centred card (phones)
 *   previous   the slide that is leaving (for the exit animation), or null
 *   direction  1 when moving to a later project, -1 to an earlier one
 *   isMobile   under 900px wide
 *   paused     the pointer is over the component or focus is inside it
 *   announce   what screen readers hear after a visitor changes slide
 * Auto-play also stops when the tab is hidden, the section is off screen, or
 * the visitor prefers reduced motion.
 */
export class ProjectSplit extends Component {
  constructor(props) {
    super(props);
    this.state = { active: 0, previous: null, direction: 1, isMobile: false, paused: false, announce: "" };

    this.rootRef = createRef();
    this.navRef = createRef();
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
      "handleListKeyDown",
      "handleRootKeyDown",
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

    // Re-place the gliding bar whenever the list changes size (resize, fonts loading).
    this.resize = new ResizeObserver(this.placeIndicator);
    this.resize.observe(this.navRef.current);

    this.preloadNext();
  }

  componentDidUpdate(_, previous) {
    if (previous.active !== this.state.active) {
      this.placeIndicator();
      this.preloadNext();
    }
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

  /**
   * Makes project `index` active. `direction` (1 forward, -1 back) decides
   * which way the slides move; by default it follows the list order.
   * `byVisitor` restarts the auto-play timer and announces the change.
   */
  select(index, { direction, byVisitor = true } = {}) {
    clearTimeout(this.hoverTimer);
    if (byVisitor) this.restartTimer();
    const { active } = this.state;
    if (index === active) return;
    const { projects } = this.props;
    this.setState({
      active: index,
      previous: active,
      direction: direction ?? (index > active ? 1 : -1),
      announce: byVisitor ? `project ${index + 1} of ${projects.length}: ${projects[index].title}` : this.state.announce,
    });
  }

  /** Moves by one (wrapping round), keeping the direction of travel. */
  step(delta) {
    const count = this.props.projects.length;
    const next = (this.state.active + delta + count) % count;
    if (this.state.isMobile) this.scrollToCard(next);
    else this.select(next, { direction: delta });
  }

  handleItemEnter(index) {
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => this.select(index), HOVER_INTENT_MS);
  }

  /** ArrowUp / ArrowDown move through the list (wrapping) and move focus with it. */
  handleListKeyDown(event) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault(); // don't scroll the page
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const count = this.props.projects.length;
    const next = (this.state.active + delta + count) % count;
    this.select(next, { direction: delta });
    this.buttons[next]?.focus();
  }

  /**
   * ArrowLeft / ArrowRight anywhere inside the component change slide. Focus
   * moves to that project's list button, so it never stays on a link inside a
   * slide that has just been hidden.
   */
  handleRootKeyDown(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    this.step(delta);
    if (!this.state.isMobile) {
      const count = this.props.projects.length;
      this.buttons[(this.state.active + delta + count) % count]?.focus();
    }
  }

  /** Starts loading the next slide's screenshot, so its frame is never empty. */
  preloadNext() {
    const { projects } = this.props;
    const next = projects[(this.state.active + 1) % projects.length];
    if (next?.thumbnail) new Image().src = next.thumbnail.src;
  }

  // ---------- gliding indicator ----------

  /** Moves the single accent bar to the active button: one transform, measured from the button. */
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
      this.restartTimer();
      this.select((this.state.active + 1) % this.props.projects.length, { direction: 1, byVisitor: false });
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
      if (nearest !== this.state.active) this.setState({ active: nearest, previous: null });
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

  // ---------- render ----------

  /** "02 / 06": the current number rolls vertically to its new value. Plus prev/next buttons. */
  renderControls() {
    const { projects } = this.props;
    const { active } = this.state;
    return (
      <div className="ps-controls">
        <p className="ps-count" aria-hidden="true">
          <span className="ps-count-roll">
            <span className="ps-count-strip" style={{ "--n": active }}>
              {projects.map((project, i) => (
                <span key={project.id}>{pad(i + 1)}</span>
              ))}
            </span>
          </span>
          <span className="ps-count-total"> / {pad(projects.length)}</span>
        </p>
        <div className="ps-arrows">
          <button type="button" aria-label="previous project" aria-controls={STAGE_ID} onClick={() => this.step(-1)}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3 5 8l5 5" />
            </svg>
          </button>
          <button type="button" aria-label="next project" aria-controls={STAGE_ID} onClick={() => this.step(1)}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="m6 3 5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  renderGroup(label, items) {
    const { active } = this.state;
    if (!items.length) return null;
    return (
      <div className="ps-group">
        <p className="ps-group-label">{label}</p>
        <ul className="ps-list">
          {items.map(({ project, index }) => (
            <li key={project.id} className={`ps-item${index === active ? " is-active" : ""}`}>
              <button
                type="button"
                ref={(el) => {
                  this.buttons[index] = el;
                }}
                className="ps-select"
                aria-pressed={index === active}
                aria-controls={STAGE_ID}
                onMouseEnter={() => this.handleItemEnter(index)}
                onMouseLeave={() => clearTimeout(this.hoverTimer)}
                onFocus={() => this.select(index)}
                onClick={() => this.select(index)}
              >
                <span className="ps-index">{pad(index + 1)}</span>
                <span className="ps-title">{project.title}</span>
                <span className="ps-tech">{project.tech.slice(0, 3).join(" · ")}</span>
              </button>
              {/* Auto-play progress: the fill grows from 0 to full width (scaleX) over 5 s. */}
              <span className="ps-progress" aria-hidden="true">
                <span
                  className="ps-fill"
                  ref={(el) => {
                    this.fills[index] = el;
                  }}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  render() {
    const { projects } = this.props;
    const { active, previous, direction, announce } = this.state;
    const indexed = projects.map((project, index) => ({ project, index }));

    return (
      <div
        ref={this.rootRef}
        className="ps"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onKeyDown={this.handleRootKeyDown}
      >
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>

        {/* ---------- desktop: grouped list + slide stage ---------- */}
        <div className="ps-split">
          {/* The nav box holds the lists plus the one gliding bar. */}
          <div ref={this.navRef} className="ps-nav" onKeyDown={this.handleListKeyDown}>
            <span ref={this.indicatorRef} className="ps-indicator" aria-hidden="true" />
            {this.renderGroup(
              "featured",
              indexed.filter(({ project }) => project.featured)
            )}
            {this.renderGroup(
              "more",
              indexed.filter(({ project }) => !project.featured)
            )}
          </div>

          <div className="ps-stage" id={STAGE_ID} style={{ "--dir": direction }}>
            {this.renderControls()}
            <div className="ps-slides">
              {projects.map((project, i) => (
                <ProjectPreview
                  key={project.id}
                  project={project}
                  variant="stage"
                  active={i === active}
                  leaving={i === previous}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ---------- phones: snap gallery ---------- */}
        <div className="ps-gallery">
          {this.renderControls()}
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
