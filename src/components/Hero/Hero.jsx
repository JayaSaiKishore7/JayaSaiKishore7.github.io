import { Component, createRef } from "react";
import { profile, heroInfo } from "../../data/profile";
import { navLinks } from "../../data/nav";
import { DetectionBoxes } from "../../utils/DetectionBoxes";
import "./Hero.css";

export class Hero extends Component {
  constructor(props) {
    super(props);
    this.state = { mounted: false };
    this.heroRef = createRef();
    this.boxes = null;
  }

  componentDidMount() {
    requestAnimationFrame(() => this.setState({ mounted: true }));

    this.boxes = new DetectionBoxes({
      container: this.heroRef.current,
      targets: [
        { selector: ".hero-name", label: "name 0.99", tight: true },
        { selector: ".hero-tagline", label: "role 0.97", tight: true, labelInside: true },
        { selector: ".hero-panel", label: "info 0.95" },
      ],
    });
    this.boxes.start();
  }

  componentWillUnmount() {
    this.boxes?.stop();
  }

  render() {
    const { mounted } = this.state;

    return (
      <section ref={this.heroRef} id="home" className={`section hero ${mounted ? "is-mounted" : ""}`}>
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
