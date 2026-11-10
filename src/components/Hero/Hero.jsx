import { Component, createRef } from "react";
import { profile, heroInfo } from "../../data/profile";
import { Clock } from "../../utils/Clock";
import { DetectionBoxes } from "../../utils/DetectionBoxes";
import { Magnetic } from "../../utils/Magnetic";
import "./Hero.css";

/**
 * The opening section: location and time, the name, the tagline, two buttons
 * and the info card. Visible immediately: the reveal is a CSS animation that
 * starts with the first paint (only while html.js is set), not something
 * JavaScript has to trigger. After it, DetectionBoxes draws its labelled
 * boxes around the name, tagline and info card.
 */
export class Hero extends Component {
  constructor(props) {
    super(props);
    this.state = { time: null };
    this.heroRef = createRef();
    this.buttonRefs = [createRef(), createRef()];
    this.handleTick = this.handleTick.bind(this);
  }

  componentDidMount() {
    this.clock = new Clock({ timeZone: profile.timeZone, onTick: this.handleTick });
    this.clock.start();

    this.magnets = this.buttonRefs.map((ref) => new Magnetic({ element: ref.current }));
    this.magnets.forEach((magnet) => magnet.start());

    this.boxes = new DetectionBoxes({
      container: this.heroRef.current,
      startDelay: 1300, // after the text has risen in
      targets: [
        { selector: ".hero-name", label: "name 0.99", tight: true },
        { selector: ".hero-tagline", label: "role 0.97", tight: true, labelInside: true },
        { selector: ".hero-card", label: "info 0.95" },
      ],
    });
    this.boxes.start();
  }

  componentWillUnmount() {
    this.clock?.stop();
    this.magnets?.forEach((magnet) => magnet.stop());
    this.boxes?.stop();
  }

  handleTick(time) {
    this.setState({ time });
  }

  render() {
    const { time } = this.state;
    const words = profile.name.toLowerCase().split(" ");

    return (
      <section ref={this.heroRef} id="home" className="hero">
        <div className="container hero-grid">
          <div className="hero-main">
            <p className="hero-meta hero-fade" style={{ "--s": 0 }}>
              <span>{profile.location.toLowerCase()}</span>
              <span aria-hidden="true">·</span>
              <span>{time ?? "--:--"} local time</span>
            </p>

            {/* Each word slides up from behind its own mask. */}
            <h1 className="hero-name">
              {words.map((word, i) => (
                <span className="hero-word" key={word}>
                  <span className="hero-word-inner" style={{ "--w": i }}>
                    {word}
                  </span>
                  {i < words.length - 1 ? " " : null}
                </span>
              ))}
            </h1>

            <p className="hero-tagline hero-fade" style={{ "--s": 1 }}>
              {profile.role}.
              <br />
              lately, computer vision on a <em className="hero-accent">production line</em>.
            </p>

            <p className="hero-note hero-fade" style={{ "--s": 2 }}>
              (more interested in how models behave in production than how they're trained.)
            </p>

            <div className="hero-actions hero-fade" style={{ "--s": 3 }}>
              <a ref={this.buttonRefs[0]} href="#work" className="hero-button hero-button--primary">
                view work
              </a>
              <a ref={this.buttonRefs[1]} href={profile.resume} download className="hero-button">
                download resume
              </a>
            </div>
          </div>

          <aside className="hero-card hero-fade" style={{ "--s": 2 }}>
            <dl>
              {heroInfo.map((row) => (
                <div className="hero-row" key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>
                    {row.status ? <span className="hero-status-dot" aria-hidden="true" /> : null}
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>
    );
  }
}
