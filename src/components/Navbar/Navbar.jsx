import { Component } from "react";
import { navLinks, navLink } from "../../data/nav";
import { ScrollSpy } from "../../utils/ScrollSpy";
import { Clock } from "../../utils/Clock";
import "./Navbar.css";

const sectionIds = navLinks.map((link) => link.id);

export class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: sectionIds[0],
      clock: Clock.format(),
    };
    this.scrollSpy = null;
    this.clock = null;
    this.handleActive = this.handleActive.bind(this);
    this.handleTick = this.handleTick.bind(this);
  }

  componentDidMount() {
    this.scrollSpy = new ScrollSpy({
      sectionIds,
      initial: this.state.active,
      onChange: this.handleActive,
    });
    this.scrollSpy.start();

    this.clock = new Clock({ onTick: this.handleTick });
    this.clock.start();
  }

  handleActive(active) {
    this.setState({ active });
  }

  handleTick(clock) {
    this.setState({ clock });
  }

  componentWillUnmount() {
    this.scrollSpy?.stop();
    this.clock?.stop();
  }

  render() {
    const { active, clock } = this.state;

    return (
      <header className="bar">
        <div className="bar-in">
          <a href="#home" className="brand">
            jaya sai kishore<span>.</span>
          </a>

          <nav className="bar-nav" aria-label="Sections">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                data-section={link.id}
                className={active === link.id ? "is-active" : ""}
                aria-current={active === link.id ? "location" : undefined}
              >
                <span className="n">{navLink(link.id).number}</span>
                {link.label}
              </a>
            ))}
          </nav>

          <p className="bar-time">
            <span data-clock>{clock.time}</span> · {clock.remark}
          </p>
        </div>
        <div className="prog" aria-hidden="true" />
      </header>
    );
  }
}
