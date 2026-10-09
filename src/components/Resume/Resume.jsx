import { Component, createRef } from "react";
import { experience } from "../../data/experience";
import { Reveal } from "../Reveal";
import { PointerGlow } from "../../utils/PointerGlow";
import "./Resume.css";

export class Resume extends Component {
  constructor(props) {
    super(props);
    this.xpsRef = createRef();
    this.glow = null;
  }

  componentDidMount() {
    this.glow = new PointerGlow({ container: this.xpsRef.current, itemSelector: ".xp" });
    this.glow.start();
  }

  componentWillUnmount() {
    this.glow?.stop();
  }

  render() {
    return (
      <section id="experience" className="section">
        <div className="container">
          <Reveal as="div">
            <p className="section-label">03 · experience</p>
            <h2 className="section-heading">where i've worked</h2>
            <p className="section-sub">
              software engineering and data science roles, contributing to ML workflows,
              automation, and production inference.
            </p>
          </Reveal>

          <div className="xps" ref={this.xpsRef}>
            {experience.map((item, i) => (
              <Reveal as="article" className="xp" key={item.company + item.date} style={{ "--i": i }}>
                <div className="xp-when">
                  <time>{item.date}</time>
                  <p className="k">{item.role}</p>
                </div>

                <div className="xp-main">
                  <h3>
                    {item.company}
                    {item.location ? <span className="xp-location">, {item.location}</span> : null}
                  </h3>
                  <p className="xp-what">{item.summary}</p>
                </div>

                <ul className="xp-list">
                  {item.points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>

                {item.stack ? <p className="xp-stack">{item.stack.join(" · ")}</p> : null}
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }
}
