import { Component } from "react";
import { navLinks, navLink } from "../../data/nav";
import { profile } from "../../data/profile";
import { Clock } from "../../utils/Clock";
import "./Navbar.css";

/** Top bar: brand on the left; section links, then the local time in Nice, on the right. */
export class Navbar extends Component {
  constructor(props) {
    super(props);
    // null until mounted: the pre-rendered page shows a placeholder, not the build's time.
    this.state = { time: null };
    this.clock = null;
    this.handleTick = this.handleTick.bind(this);
  }

  componentDidMount() {
    this.clock = new Clock({ timeZone: profile.timeZone, onTick: this.handleTick });
    this.clock.start();
  }

  componentWillUnmount() {
    this.clock?.stop();
  }

  handleTick(time) {
    this.setState({ time });
  }

  render() {
    const { active } = this.props;
    const { time } = this.state;

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
            <span data-clock>{time ?? "--:--"}</span> in {profile.city.toLowerCase()}
          </p>
        </div>
        <div className="prog" aria-hidden="true" />
      </header>
    );
  }
}
