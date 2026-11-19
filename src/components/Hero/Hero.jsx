import { Component, createRef } from "react";
import { profile } from "../../data/profile";
import { Clock } from "../../utils/Clock";
import { Magnetic } from "../../utils/Magnetic";
import { BallGrid } from "./BallGrid";
import "./Hero.css";

/**
 * The opening section: location and time, the name, the tagline, two buttons
 * and the X-ray ball grid with its detection boxes (BallGrid). Visible
 * immediately: the reveal is a CSS animation that starts with the first paint
 * (only while html.js is set), not something JavaScript has to trigger.
 */
export class Hero extends Component {
  constructor(props) {
    super(props);
    this.state = { time: null };
    this.buttonRefs = [createRef(), createRef()];
    this.handleTick = this.handleTick.bind(this);
  }

  componentDidMount() {
    this.clock = new Clock({ timeZone: profile.timeZone, onTick: this.handleTick });
    this.clock.start();

    this.magnets = this.buttonRefs.map((ref) => new Magnetic({ element: ref.current }));
    this.magnets.forEach((magnet) => magnet.start());
  }

  componentWillUnmount() {
    this.clock?.stop();
    this.magnets?.forEach((magnet) => magnet.stop());
  }

  handleTick(time) {
    this.setState({ time });
  }

  render() {
    const { time } = this.state;
    const words = profile.name.toLowerCase().split(" ");

    return (
      <section id="home" className="hero">
        <div className="container hero-grid">
          <div className="hero-main">
            <p className="hero-meta hero-fade" style={{ "--s": 0 }}>
              <span>{profile.location.toLowerCase()}</span>
              <span aria-hidden="true">·</span>
              <span>{time ?? "--:--"} local time</span>
            </p>

            {/* Each word slides up from behind its own mask. The spaces sit between
                the masks (a space inside an inline-block would collapse), and the
                aria-label gives screen readers the plain name. */}
            <h1 className="hero-name" aria-label={profile.name.toLowerCase()}>
              {words.map((word, i) => (
                <span key={word}>
                  <span className="hero-word" aria-hidden="true">
                    <span className="hero-word-inner" style={{ "--w": i }}>
                      {word}
                    </span>
                  </span>
                  {i < words.length - 1 ? " " : null}
                </span>
              ))}
            </h1>

            <p className="hero-tagline hero-fade" style={{ "--s": 1 }}>
              {profile.role}.
              <br />
              lately, computer vision on a production line.
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

          {/* The fade-in runs on this wrapper, never on the SVG inside. */}
          <div className="hero-visual hero-fade" style={{ "--s": 2 }}>
            <BallGrid />
          </div>
        </div>
      </section>
    );
  }
}
