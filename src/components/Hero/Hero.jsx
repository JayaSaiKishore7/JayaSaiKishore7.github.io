import { Component, createRef } from "react";
import { profile, heroInfo, heroText } from "../../data/profile";
import { AlignToAnchor } from "../../utils/AlignToAnchor";
import { DetectionCycle } from "../../utils/DetectionCycle";
import { Magnetic } from "../../utils/Magnetic";
import { LossLandscape } from "../LossLandscape/LossLandscape";
import { StatusLine } from "./StatusLine";
import "./Hero.css";

// Two columns side by side; must match the desktop media query in Hero.css.
const HERO_DESKTOP = "(min-width: 1000px)";
// The detection box starts once the text has risen in.
const BOX_DELAY = 1300;

/** A list of text pieces; { text, label } pieces become detection targets. */
function Phrases({ pieces }) {
  return pieces.map((piece, i) =>
    typeof piece === "string" ? (
      piece
    ) : (
      <span key={i} className="det" data-label={piece.label}>
        {piece.text}
      </span>
    ),
  );
}

/**
 * The opening section. Behind it, the loss landscape (LossLandscape) with a
 * readability overlay; on it, the training status line, the text (role,
 * name, headline, subline, buttons) and the info card.
 *
 * Desktop: the text's first line ("machine learning engineer") sits level
 * with the card's first row, "focus" (AlignToAnchor sets --hero-text-top). One
 * detection box hops between the labelled phrases (DetectionCycle).
 *
 * Visible immediately: the reveal is a CSS animation that starts with the
 * first paint (only while html.js is set), not something JavaScript has to
 * trigger.
 */
export class Hero extends Component {
  constructor(props) {
    super(props);
    this.heroRef = createRef();
    this.stageRef = createRef();
    this.statusRef = createRef();
    this.buttonRefs = [createRef(), createRef()];
    this.handleStatus = this.handleStatus.bind(this);
  }

  componentDidMount() {
    const hero = this.heroRef.current;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.magnets = this.buttonRefs.map((ref) => new Magnetic({ element: ref.current }));
    this.magnets.forEach((magnet) => magnet.start());

    this.boxes = new DetectionCycle({
      container: this.stageRef.current,
      still,
      observe: [hero.querySelector(".hero-main")],
    });

    // Desktop: move the text until its first line is level with the card's
    // anchor row ("focus"). The detection box follows.
    const card = hero.querySelector(".hero-card");
    this.aligner = new AlignToAnchor({
      container: hero,
      target: hero.querySelector(".hero-role"),
      anchor: hero.querySelector("[data-hero-anchor]"),
      shifted: hero.querySelector(".hero-main"),
      observe: [card],
      variable: "--hero-text-top",
      media: HERO_DESKTOP,
      onChange: () => this.boxes.reposition(),
    });
    this.aligner.start();

    // While the loading screen shows, wait for it; then let the text rise in first.
    this.startBoxes = () => {
      this.boxTimer = setTimeout(() => this.boxes.start(), still ? 0 : BOX_DELAY);
    };
    if (document.documentElement.classList.contains("loading")) {
      window.addEventListener("loader:done", this.startBoxes, { once: true });
    } else {
      this.startBoxes();
    }
  }

  componentWillUnmount() {
    this.magnets?.forEach((magnet) => magnet.stop());
    this.aligner?.stop();
    clearTimeout(this.boxTimer);
    this.boxes?.stop();
    window.removeEventListener("loader:done", this.startBoxes);
  }

  handleStatus(status) {
    this.statusRef.current?.show(status);
  }

  render() {
    const words = profile.name.toLowerCase().split(" ");

    return (
      <section ref={this.heroRef} id="home" className="hero">
        <div ref={this.stageRef} className="hero-stage">
          <LossLandscape onStatus={this.handleStatus} />
          <div className="hero-overlay" aria-hidden="true" />

          <StatusLine ref={this.statusRef} />

          <div className="hero-main">
            <p className="hero-role hero-fade" style={{ "--s": 0 }}>
              {heroText.role}
            </p>

            {/* Each word slides up from behind its own mask. The spaces sit between
                the masks (a space inside an inline-block would collapse), and the
                aria-label gives screen readers the plain name. */}
            <h1 className="hero-name" aria-label={profile.name.toLowerCase()}>
              <span className="det" data-label={heroText.nameLabel} data-tag="below">
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
              </span>
            </h1>

            <p className="hero-headline hero-fade" style={{ "--s": 1 }}>
              <Phrases pieces={heroText.headline} />
            </p>

            <p className="hero-subline hero-fade" style={{ "--s": 2 }}>
              <Phrases pieces={heroText.subline} />
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
        </div>

        <aside className="hero-card hero-fade" style={{ "--s": 2 }}>
          <dl>
            {heroInfo.map((row) => (
              <div className="hero-row" key={row.label}>
                <dt data-hero-anchor={row.anchor ? "true" : undefined}>{row.label}</dt>
                <dd>
                  {row.status ? <span className="hero-status-dot" aria-hidden="true" /> : null}
                  {row.href ? (
                    <a className="hero-row-link" href={row.href} download={row.download || undefined}>
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>
    );
  }
}
