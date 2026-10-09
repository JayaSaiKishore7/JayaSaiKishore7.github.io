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

  render() {
    const { active, clock } = this.state;

    return (
      <header className="bar">
        <div className="bar-in">
          <a href="#home" className="brand">
            jaya sai kishore<span>.</span>
          </a>

          <nav className="bar-nav" aria-label="Sections">
            {navLinks.map((link, i) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                data-section={link.id}
                className={active === link.id ? "is-active" : ""}
              >
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
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
