import { Component } from "react";
import { profile, heroInfo } from "../../data/profile";
import { navLinks } from "../../data/nav";
import "./Hero.css";

export class Hero extends Component {
  constructor(props) {
    super(props);
    this.state = { mounted: false };
  }

  componentDidMount() {
    requestAnimationFrame(() => this.setState({ mounted: true }));
  }

  render() {
    const { mounted } = this.state;

    return (
      <section id="home" className={`section hero ${mounted ? "is-mounted" : ""}`}>
        <div className="container hero-inner">
          <div className="hero-main">
            <p className="hero-meta stagger" style={{ "--stagger": 0 }}>
              Hola
            </p>

            <h1 className="hero-name" aria-label={profile.name.toLowerCase()}>
              {profile.name.toLowerCase().split("").map((char, i) => (
                <span
                  key={i}
                  className="hero-letter"
                  aria-hidden="true"
                  style={{ "--li": i }}
                >
                  {char === " " ? " " : char}
                </span>
              ))}
            </h1>

            <h2 className="hero-tagline stagger" style={{ "--stagger": 2 }}>
              machine learning &amp; data.
              <br />
              lately pretty deep in <em className="hero-accent">retrieval</em>.
            </h2>

            <p className="hero-note stagger" style={{ "--stagger": 3 }}>
              (more interested in how models behave in production than how they're trained.)
            </p>

            <div className="hero-foot stagger" style={{ "--stagger": 4 }}>
              <span>scroll</span>
              <span className="hero-rule" aria-hidden="true" />
              <span className="hero-breadcrumb">
                {navLinks.map((link) => link.label).join(", ")}
              </span>
            </div>
          </div>

          <aside className="hero-panel stagger" style={{ "--stagger": 1 }}>
            {heroInfo.map((row) => (
              <div className="hero-panel-row" key={row.label}>
                <span className="hero-panel-label">{row.label}</span>
                <span className="hero-panel-value">
                  {row.status ? <span className="hero-status-dot" /> : null}
                  {row.value}
                </span>
              </div>
            ))}
            <div className="hero-panel-row">
              <span className="hero-panel-label">resume</span>
              <span className="hero-panel-value">
                <a href={profile.resume} download>
                  download ↗
                </a>
              </span>
            </div>
          </aside>
        </div>
      </section>
    );
  }
}
