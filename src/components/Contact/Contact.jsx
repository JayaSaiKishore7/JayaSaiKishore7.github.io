import { Component } from "react";
import { aboutInfo } from "../../data/profile";
import { Reveal } from "../Reveal";
import "./Contact.css";

export class Contact extends Component {
  render() {
    return (
      <section id="hello" className="section">
        <div className="container">
          <Reveal as="div">
            <p className="section-label">01 · hello</p>
            <p className="hello-bio">{aboutInfo.paragraph}</p>
          </Reveal>

          <Reveal as="div" className="hello-skills" style={{ "--i": 1 }}>
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
