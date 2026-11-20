import { Component, createRef } from "react";
import { Chip } from "../ui/Chip";
import "./SkillRows.css";

/** How fast every row glides, in pixels per second (the same for all rows). Tune here. */
const SKILL_SPEED_PX_S = 14;
const MAX_REPEATS = 40; // a safety cap; real groups need far fewer

// Before anything is measured (the pre-rendered page), each copy is made about
// this wide from a rough chip-width guess; on screen the real width is checked.
const TARGET_COPY_PX = 1200;
const roughChipPx = (name) => 28 + name.length * 7.5; // padding + text + the 8px gap

const repeatsFor = (items) =>
  Math.max(1, Math.ceil(TARGET_COPY_PX / items.reduce((sum, item) => sum + roughChipPx(item), 0)));

/**
 * One group: its name pinned on the left, its skills gliding through a lane.
 * The chips are repeated until one copy is wider than the lane, and the copy is
 * shown twice, so moving the track by -50% (one copy) loops without a jump.
 * The duration is one copy's width / SKILL_SPEED_PX_S, so every row moves at
 * the same speed whatever its length.
 */
class SkillRow extends Component {
  constructor(props) {
    super(props);
    this.state = { repeats: repeatsFor(props.group.items) };
    this.laneRef = createRef();
    this.copyRef = createRef();
    this.trackRef = createRef();
  }

  componentDidMount() {
    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(this.laneRef.current);
    this.resizeObserver.observe(this.copyRef.current);
  }

  componentWillUnmount() {
    this.resizeObserver?.disconnect();
  }

  measure() {
    // Reduced motion shows one still, wrapped copy: nothing to fill or time.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const copyWidth = this.copyRef.current.getBoundingClientRect().width;
    const laneWidth = this.laneRef.current.getBoundingClientRect().width;
    if (!copyWidth) return;
    if (copyWidth < laneWidth && this.state.repeats < MAX_REPEATS) {
      // Too short to fill the lane: one more repeat (the observer measures again).
      this.setState(({ repeats }) => ({ repeats: repeats + 1 }));
      return;
    }
    this.trackRef.current.style.setProperty("--marquee-duration", `${(copyWidth / SKILL_SPEED_PX_S).toFixed(2)}s`);
  }

  renderCopy(hidden) {
    const { group } = this.props;
    const chips = [];
    for (let r = 0; r < this.state.repeats; r++) {
      for (const item of group.items) {
        // The first copy's first pass is the real list; every repeat is decoration.
        const repeat = r > 0;
        chips.push(
          <li key={`${r}-${item}`} className={repeat ? "skill-repeat" : undefined} aria-hidden={repeat && !hidden ? "true" : undefined}>
            <Chip>{item}</Chip>
          </li>
        );
      }
    }
    return hidden ? (
      <ul className="skill-copy skill-copy--echo" aria-hidden="true">
        {chips}
      </ul>
    ) : (
      <ul ref={this.copyRef} className="skill-copy" aria-label={group.name}>
        {chips}
      </ul>
    );
  }

  render() {
    const { group, reverse } = this.props;
    return (
      <div className={reverse ? "skill-row skill-row--reverse" : "skill-row"}>
        <p className="skill-row-name">{group.name}</p>
        <div ref={this.laneRef} className="skill-lane">
          <div ref={this.trackRef} className="skill-track">
            {this.renderCopy(false)}
            {this.renderCopy(true)}
          </div>
        </div>
      </div>
    );
  }
}

/**
 * The skills in the hello section: one slowly moving row per group, rows
 * alternating direction. Pure CSS animation; pauses on hover/focus, with the
 * button (WCAG 2.2.2) and while off screen. Reduced motion: still, wrapped lists.
 */
export class SkillRows extends Component {
  constructor(props) {
    super(props);
    this.state = { paused: false, offscreen: false };
    this.rootRef = createRef();
  }

  componentDidMount() {
    this.intersectionObserver = new IntersectionObserver(this.handleVisibility);
    this.intersectionObserver.observe(this.rootRef.current);
  }

  /** Off screen, nothing needs to move (saves battery). */
  handleVisibility = ([entry]) => this.setState({ offscreen: !entry.isIntersecting });

  componentWillUnmount() {
    this.intersectionObserver?.disconnect();
  }

  toggle = () => this.setState(({ paused }) => ({ paused: !paused }));

  render() {
    const { groups } = this.props;
    const { paused, offscreen } = this.state;
    const classes = ["skill-rows", paused ? "is-paused" : "", offscreen ? "is-offscreen" : ""].filter(Boolean).join(" ");

    return (
      <div ref={this.rootRef} className={classes}>
        <button
          type="button"
          className="skill-rows-toggle"
          aria-label={paused ? "play skills animation" : "pause skills animation"}
          aria-pressed={paused}
          onClick={this.toggle}
        >
          {paused ? (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5 3.5v9l7.5-4.5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5 3.5v9M11 3.5v9" />
            </svg>
          )}
        </button>

        {groups.map((group, i) => (
          <SkillRow key={group.name} group={group} reverse={i % 2 === 1} />
        ))}
      </div>
    );
  }
}
