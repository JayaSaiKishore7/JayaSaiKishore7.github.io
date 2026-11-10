import { Component } from "react";
import { navLinks, navLink } from "../../data/nav";
import { Clock } from "../../utils/Clock";
import "./Navbar.css";

/** Top bar: brand, section links (hidden on wide screens, where SideNav takes over) and clock. */
export class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = { clock: Clock.format() };
    this.clock = null;
    this.handleTick = this.handleTick.bind(this);
  }

  componentDidMount() {
    this.clock = new Clock({ onTick: this.handleTick });
    this.clock.start();
  }

  componentWillUnmount() {
    this.clock?.stop();
  }

  handleTick(clock) {
    this.setState({ clock });
  }

  render() {
    const { active } = this.props;
    const { clock } = this.state;

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
