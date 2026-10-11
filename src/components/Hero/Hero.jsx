import { Component, createRef } from "react";
import { profile, heroInfo, focusWords } from "../../data/profile";
import { navLinks } from "../../data/nav";
import { WordRotator } from "../../utils/WordRotator";
import { DetectionBoxes } from "../../utils/DetectionBoxes";
import "./Hero.css";

export class Hero extends Component {
  constructor(props) {
    super(props);
    this.state = { mounted: false, word: focusWords[0] };
    this.rotator = null;
    this.detector = null;
    this.heroRef = createRef();
  }

  componentDidMount() {
    requestAnimationFrame(() => this.setState({ mounted: true }));

    this.rotator = new WordRotator({
      words: focusWords,
      onChange: (word) => this.setState({ word }),
    });
    this.rotator.start();

    this.detector = new DetectionBoxes({
      container: this.heroRef.current,
      targets: [
        { selector: ".hero-name", label: "name 0.99", tight: true },
        { selector: ".hero-tagline", label: "role 0.97", tight: true },
        { selector: ".hero-panel", label: "info 0.95" },
      ],
    });
    this.detector.start();
  }

  componentWillUnmount() {
    this.rotator?.stop();
    this.detector?.stop();
  }

  render() {
    const { mounted, word } = this.state;

    return (
      <section
        id="home"
        ref={this.heroRef}
        className={`section hero ${mounted ? "is-mounted" : ""}`}
        aria-label="Introduction"
      >
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
              lately pretty deep in{" "}
              <em className="hero-accent" aria-live="off">
                {word}
              </em>
              .
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
