import { Component } from "react";
import { aboutInfo } from "../../data/profile";
import { Reveal } from "../Reveal";
import "./Contact.css";

export class Contact extends Component {
  render() {
    return (
      <section id="hello" className="section">
        <div className="container">
          <Reveal as="div" className="section-rule" aria-hidden="true" />

          <Reveal as="div">
            <p className="section-label">04 · hello</p>
            <h2 className="hello-statement">{aboutInfo.statement}</h2>
          </Reveal>

          <Reveal as="div" className="hello-about" style={{ "--i": 1 }}>
            <p className="k">about</p>
            <p className="hello-lead">{aboutInfo.lead}</p>
            {aboutInfo.sub.map((line, i) => (
              <p className="hello-sub" key={i}>
                {line}
              </p>
            ))}
          </Reveal>

          <Reveal as="div" className="hello-skills" style={{ "--i": 2 }}>
            {aboutInfo.skills.map((skill) => (
              <span className="hello-skill" key={skill}>
                {skill}
              </span>
            ))}
          </Reveal>
        </div>
      </section>
    );
  }
}
