import { Component, createRef } from "react";
import { education } from "../../data/experience";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import { PointerGlow } from "../../utils/PointerGlow";
import "./Education.css";

export class Education extends Component {
  constructor(props) {
    super(props);
    this.listRef = createRef();
    this.glow = null;
  }

  componentDidMount() {
    this.glow = new PointerGlow({ container: this.listRef.current, itemSelector: ".edu-card" });
    this.glow.start();
  }

  componentWillUnmount() {
    this.glow?.stop();
  }

  render() {
    return (
      <section id="education" className="section">
        <div className="container">
          <Reveal as="div" className="section-rule" aria-hidden="true" />

          <Reveal as="div">
            {/* No separate title: the "03 · education" label is the section's heading. */}
            <SectionHeader id="education" />
          </Reveal>

          <div className="edu-list" ref={this.listRef}>
            {education.map((item, i) => (
              <Reveal as="div" className="card-slot" key={item.degree} style={{ "--i": i }}>
                <article className="card card--lift card--glow edu-card">
                  <h3>{item.degree}</h3>
                  <p className="edu-meta">{item.meta}</p>
                  <ul>
                    {item.points.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }
}
