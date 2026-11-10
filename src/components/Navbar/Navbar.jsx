import { Component, createRef } from "react";
import { navLinks } from "../../data/nav";
import { profile } from "../../data/profile";
import { Clock } from "../../utils/Clock";
import { ThemeToggle } from "./ThemeToggle";
import "./Navbar.css";

const SCROLL_DELTA = 6; // ignore tiny scroll jitters when deciding hide/show
const SHOW_NEAR_TOP = 120; // always show the bar this close to the top

/**
 * The floating pill navbar.
 *
 * Desktop: name, section links with one gliding marker behind the active
 * link, the local time in Nice and the theme toggle. It slides away when you
 * scroll down and comes back when you scroll up.
 * Phones: name, theme toggle and a menu button that opens a full-screen sheet.
 *
 * State
 *   time      clock text, null until mounted (the pre-rendered page can't know it)
 *   hidden    slid away after scrolling down
 *   menuOpen  the phone menu sheet is open
 */
export class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = { time: null, hidden: false, menuOpen: false };

    this.linksRef = createRef();
    this.markerRef = createRef();
    this.menuButtonRef = createRef();
    this.sheetRef = createRef();
    this.linkEls = {};
    this.clock = null;
    this.lastY = 0;
    this.scrollFrame = null;
    this.markerPlaced = false;

    for (const name of ["handleTick", "handleScroll", "placeMarker", "toggleMenu", "closeMenu", "handleSheetKeyDown"]) {
      this[name] = this[name].bind(this);
    }
  }

  // ---------- lifecycle ----------

  componentDidMount() {
    this.clock = new Clock({ timeZone: profile.timeZone, onTick: this.handleTick });
    this.clock.start();

    this.lastY = window.scrollY;
    window.addEventListener("scroll", this.handleScroll, { passive: true });

    // Re-place the marker whenever the links change size (fonts loading, resize).
    this.resize = new ResizeObserver(this.placeMarker);
    this.resize.observe(this.linksRef.current);
  }

  componentDidUpdate(previous, previousState) {
    if (previous.active !== this.props.active) this.placeMarker();
    if (previousState.menuOpen !== this.state.menuOpen) this.onMenuChange();
  }

  componentWillUnmount() {
    this.clock?.stop();
    window.removeEventListener("scroll", this.handleScroll);
    cancelAnimationFrame(this.scrollFrame);
    this.resize?.disconnect();
    document.documentElement.style.overflow = "";
  }

  handleTick(time) {
    this.setState({ time });
  }

  // ---------- hide on scroll down, show on scroll up ----------

  handleScroll() {
    if (this.scrollFrame !== null) return;
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = null;
      const y = window.scrollY;
      const delta = y - this.lastY;
      if (Math.abs(delta) < SCROLL_DELTA) return;
      this.lastY = y;

      const focusInside = this.linksRef.current?.contains(document.activeElement);
      const hidden = delta > 0 && y > SHOW_NEAR_TOP && !this.state.menuOpen && !focusInside;
      if (hidden !== this.state.hidden) this.setState({ hidden });
    });
  }

  // ---------- gliding marker ----------

  /**
   * Shows the marker behind the active link. The marker spans all the links;
   * a rounded clip-path reveals just the active link's area, so moving and
   * resizing is one smooth clip-path transition with perfectly round ends.
   */
  placeMarker() {
    const marker = this.markerRef.current;
    const nav = this.linksRef.current;
    const link = this.linkEls[this.props.active];
    if (!marker || !nav) return;

    if (!link || !link.offsetWidth) {
      marker.classList.remove("is-shown");
      return;
    }

    const left = link.offsetLeft;
    const right = nav.clientWidth - (link.offsetLeft + link.offsetWidth);
    marker.style.clipPath = `inset(0 ${right}px 0 ${left}px round 999px)`;

    if (!this.markerPlaced) {
      // First appearance: fade in at its place instead of sliding from the edge.
      marker.style.transition = "none";
      void marker.offsetWidth;
      marker.style.transition = "";
      this.markerPlaced = true;
    }
    marker.classList.add("is-shown");
  }

  // ---------- phone menu ----------

  toggleMenu() {
    this.setState((state) => ({ menuOpen: !state.menuOpen }));
  }

  closeMenu() {
    if (this.state.menuOpen) this.setState({ menuOpen: false });
  }

  onMenuChange() {
    const open = this.state.menuOpen;
    // Stop the page scrolling behind the open sheet.
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) this.sheetRef.current?.querySelector("a, button")?.focus();
    else this.menuButtonRef.current?.focus();
  }

  /** Keeps Tab inside the open sheet and closes it on Escape. */
  handleSheetKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      this.closeMenu();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...this.sheetRef.current.querySelectorAll("a, button")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // ---------- render ----------

  render() {
    // On case study pages the links lead back to the home page's sections.
    const { active = null, onHome = true } = this.props;
    const { time, hidden, menuOpen } = this.state;
    const home = onHome ? "" : "/";

    return (
      <header className={`nav${hidden ? " is-hidden" : ""}${menuOpen ? " is-menu-open" : ""}`}>
        <div className="nav-pill">
          <a href={onHome ? "#home" : "/"} className="nav-brand">
            {profile.name.toLowerCase()}
            <span>.</span>
          </a>

          <nav ref={this.linksRef} className="nav-links" aria-label="Sections">
            <span ref={this.markerRef} className="nav-marker" aria-hidden="true" />
            {navLinks.map((link) => (
              <a
                key={link.id}
                ref={(el) => {
                  this.linkEls[link.id] = el;
                }}
                href={`${home}#${link.id}`}
                className={active === link.id ? "is-active" : ""}
                aria-current={active === link.id ? "location" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Location and local time, next to the section links (desktop). */}
          <p className="nav-time">
            {profile.location.toLowerCase()} · <span>{time ?? "--:--"}</span>
          </p>

          <ThemeToggle />

          <button
            ref={this.menuButtonRef}
            type="button"
            className="nav-menu-button"
            aria-expanded={menuOpen}
            aria-controls="nav-sheet"
            onClick={this.toggleMenu}
          >
            {menuOpen ? "close" : "menu"}
          </button>
        </div>

        {/* Phones: full-screen menu. Hidden and out of reach (inert) while closed. */}
        <div
          ref={this.sheetRef}
          id="nav-sheet"
          className="nav-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          inert={!menuOpen}
          onKeyDown={this.handleSheetKeyDown}
        >
          <ul>
            {navLinks.map((link, i) => (
              <li key={link.id} style={{ "--i": i }}>
                <a href={`${home}#${link.id}`} onClick={this.closeMenu}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <button type="button" className="nav-sheet-close" onClick={this.closeMenu}>
            close menu
          </button>
        </div>
      </header>
    );
  }
}
