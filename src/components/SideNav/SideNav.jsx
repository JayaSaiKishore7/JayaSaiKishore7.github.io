import { Component, createRef } from "react";
import { navLinks } from "../../data/nav";
import { HookRail } from "./HookRail";
import "./SideNav.css";

// Height of the hook's rounded corner, in px. Passed to CSS as --hook-corner.
const CORNER = 6;

/**
 * Vertical section nav for wide screens (it replaces the top bar's links
 * there). An accent hook points at the section in view (`active`, from App's
 * ScrollSpy); a fainter hook follows the pointer or keyboard focus.
 *
 * Pointer/focus states: idle → hovering (pointer or focus on an item) → idle.
 * The faint hook shows only while hovering an item that isn't the active one.
 */
export class SideNav extends Component {
  constructor(props) {
    super(props);
    this.state = { centers: [], hoverIndex: null, pointerInside: false, focusInside: false };
    this.listRef = createRef();
    this.itemEls = [];
    this.observer = null;
    this.measure = this.measure.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  componentDidMount() {
    // Re-measure item positions whenever the list's size changes (fonts load,
    // the window crosses the breakpoint and the nav becomes visible, etc.).
    this.observer = new ResizeObserver(this.measure);
    this.observer.observe(this.listRef.current);
  }

  componentWillUnmount() {
    this.observer?.disconnect();
  }

  measure() {
    const centers = this.itemEls.map((el) => (el ? el.offsetTop + el.offsetHeight / 2 : 0));
    this.setState({ centers });
  }

  handleHover(index) {
    this.setState({ hoverIndex: index, pointerInside: true });
  }

  handleFocus(index) {
    this.setState({ hoverIndex: index, focusInside: true });
  }

  handlePointerLeave() {
    this.setState({ pointerInside: false });
  }

  handleBlur() {
    this.setState({ focusInside: false });
  }

  render() {
    const { active } = this.props;
    const { centers, hoverIndex, pointerInside, focusInside } = this.state;

    const activeIndex = navLinks.findIndex((link) => link.id === active);
    const activeY = activeIndex < 0 ? null : (centers[activeIndex] ?? null);
    const hoverY = hoverIndex === null ? null : (centers[hoverIndex] ?? null);
    const hovering = (pointerInside || focusInside) && hoverIndex !== activeIndex;

    // Above the active row the accent line already covers the span, so the
    // faint rail draws only its corner there.
    const hoverFrom =
      activeY !== null && hoverY !== null && hoverY <= activeY
        ? Math.max(0, hoverY - CORNER)
        : (activeY ?? 0);

    return (
      <nav className="side-nav" aria-label="Sections" style={{ "--hook-corner": `${CORNER}px` }}>
        <div
          ref={this.listRef}
          className="side-nav-list"
          data-state={hovering ? "hovering" : "idle"}
          onMouseLeave={this.handlePointerLeave}
        >
          <HookRail variant="hover" from={hoverFrom} y={hoverY} visible={hovering} />
          <HookRail variant="active" y={activeY} visible={activeY !== null} />

          {navLinks.map((link, index) => {
            const isActive = index === activeIndex;
            return (
              <a
                key={link.id}
                ref={(el) => {
                  this.itemEls[index] = el;
                }}
                href={`#${link.id}`}
                className={`side-nav-item${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "location" : undefined}
                onMouseEnter={() => this.handleHover(index)}
                onFocus={() => this.handleFocus(index)}
                onBlur={this.handleBlur}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </nav>
    );
  }
}
