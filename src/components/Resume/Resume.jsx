import { Component, createRef } from "react";
import { experience } from "../../data/experience";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../ui/SectionHeader";
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
          <Reveal as="div" className="section-rule" aria-hidden="true" />

          <Reveal as="div">
            <SectionHeader
              id="experience"
              title="where i've worked"
              sub="software engineering and data science roles, contributing to ML workflows, automation, and production inference."
            />
          </Reveal>

          <div className="xps" ref={this.xpsRef}>
            {experience.map((item, i) => (
              <Reveal as="div" className="card-slot" key={item.company + item.date} style={{ "--i": i }}>
                <article className="card card--glow xp">
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
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }
}
