import { PureComponent, createRef } from "react";
import { navLinks } from "../../data/nav";
import { profile } from "../../data/profile";
import "./Navbar.css";

/**
 * The menu bar: sticky at the top, a see-through strip of the page
 * background. The name on the left is the home link.
 *
 * Desktop: the section links on the right; the one in view (`active`, from
 * App's ScrollSpy) is underlined in the accent.
 * Phones (< 1000px): a menu button opens a full-height panel under the bar.
 * While it's open, Tab stays inside it; Escape or a link closes it and focus
 * returns to the button.
 *
 * State: `menuOpen`, the phone panel is open.
 */
export class Navbar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { menuOpen: false };
    this.menuButtonRef = createRef();
    this.panelRef = createRef();
    for (const name of ["toggleMenu", "closeMenu", "handleKeyDown"]) {
      this[name] = this[name].bind(this);
    }
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousState.menuOpen !== this.state.menuOpen) this.onMenuChange();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.documentElement.style.overflow = "";
  }

  toggleMenu() {
    this.setState((state) => ({ menuOpen: !state.menuOpen }));
  }

  closeMenu() {
    if (this.state.menuOpen) this.setState({ menuOpen: false });
  }

  onMenuChange() {
    const open = this.state.menuOpen;
    // The page doesn't scroll behind the open panel.
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) {
      document.addEventListener("keydown", this.handleKeyDown);
      this.panelRef.current?.querySelector("a")?.focus();
    } else {
      document.removeEventListener("keydown", this.handleKeyDown);
      this.menuButtonRef.current?.focus();
    }
  }

  /** While the panel is open: Escape closes it; Tab cycles through the button and the links. */
  handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      this.closeMenu();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [this.menuButtonRef.current, ...this.panelRef.current.querySelectorAll("a")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const inside = focusable.includes(document.activeElement);
    if (event.shiftKey && (document.activeElement === first || !inside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
      event.preventDefault();
      first.focus();
    }
  }

  render() {
    // On case study pages the links lead back to the home page's sections.
    const { active = null, onHome = true } = this.props;
    const { menuOpen } = this.state;
    const home = onHome ? "" : "/";

    return (
      <>
        <header className="nav">
          <a href={onHome ? "#home" : "/"} className="nav-name">
            {profile.name}
          </a>

          <nav className="nav-links" aria-label="Sections">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`${home}#${link.id}`}
                className={active === link.id ? "is-active" : undefined}
                aria-current={active === link.id ? "location" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            ref={this.menuButtonRef}
            type="button"
            className="nav-menu-button"
            aria-expanded={menuOpen}
            aria-controls="nav-panel"
            aria-label={menuOpen ? "close menu" : "open menu"}
            onClick={this.toggleMenu}
          >
            <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </header>

        {/* Phones: the menu panel. Out of reach (inert) while closed. A sibling of
            the bar, not inside it: the bar's backdrop-filter would make it the
            panel's containing block and squash the panel into the bar. */}
        <div
          ref={this.panelRef}
          id="nav-panel"
          className={`nav-panel${menuOpen ? " is-open" : ""}`}
          inert={!menuOpen}
        >
          <p className="nav-panel-prompt" aria-hidden="true">
            $ ls ./portfolio
          </p>
          <nav aria-label="Sections">
            <ul>
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`${home}#${link.id}`}
                    aria-current={active === link.id ? "location" : undefined}
                    onClick={this.closeMenu}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </>
    );
  }
}
