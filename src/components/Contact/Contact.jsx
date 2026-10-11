import { Component } from "react";
import { aboutInfo } from "../../data/profile";
import { Reveal } from "../Reveal";
import "./Contact.css";

export class Contact extends Component {
  render() {
    return (
      <section id="hello" className="section" aria-label="About">
        <div className="container">
          <Reveal as="div" className="section-rule" variant="wipe" aria-hidden="true" />

          <Reveal as="p" className="section-label">
            04 · hello
          </Reveal>
          <Reveal as="h2" className="hello-statement" variant="mask">
            <span>{aboutInfo.statement}</span>
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

          <Reveal as="div" className="hello-skills" variant="stagger">
            {aboutInfo.skills.map((skill, i) => (
              <span className="hello-skill" key={skill} style={{ "--pi": i }}>
                {skill}
              </span>
            ))}
          </Reveal>
        </div>
      </section>
    );
  }
}
