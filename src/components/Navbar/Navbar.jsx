import { Component } from "react";
import { navLinks } from "../../data/nav";
import { ScrollSpy } from "../../utils/ScrollSpy";
import { Clock } from "../../utils/Clock";
import "./Navbar.css";

const sectionIds = navLinks.map((link) => link.id);

export class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: sectionIds[0],
      menuOpen: false,
      clock: Clock.format(),
    };
    this.scrollSpy = null;
    this.clock = null;
  }

  componentDidMount() {
    this.scrollSpy = new ScrollSpy({
      sectionIds,
      onChange: (active) => this.setState({ active }),
    });
    this.scrollSpy.start();

    this.clock = new Clock({ onTick: (clock) => this.setState({ clock }) });
    this.clock.start();
  }

  componentWillUnmount() {
    this.scrollSpy?.stop();
    this.clock?.stop();
  }

  toggleMenu() {
    this.setState((state) => ({ menuOpen: !state.menuOpen }));
  }

  closeMenu() {
    this.setState({ menuOpen: false });
  }

  render() {
    const { active, menuOpen, clock } = this.state;

    return (
      <header className="topbar">
        <div className="container nav-container">
          <a href="#home" className="brand">
            jaya sai kishore.
          </a>

          <button
            className="menu-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => this.toggleMenu()}
          >
            {menuOpen ? "close" : "menu"}
          </button>

          <nav className={`nav-wrapper ${menuOpen ? "active" : ""}`}>
            <ul className="nav-links">
              {navLinks.map((link, i) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className={active === link.id ? "active" : ""}
                    onClick={() => this.closeMenu()}
                  >
                    <span className="nav-index">{String(i + 1).padStart(2, "0")}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-clock">
            {clock.time} <span className="nav-clock-remark">· {clock.remark}</span>
          </div>
        </div>
      </header>
    );
  }
}
