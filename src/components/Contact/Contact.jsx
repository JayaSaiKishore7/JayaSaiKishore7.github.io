import { Component } from "react";
import { aboutInfo } from "../../data/profile";
import { Reveal } from "../Reveal";
import { SectionLabel } from "../SectionLabel";
import "./Contact.css";

export class Contact extends Component {
  render() {
    return (
      <section id="hello" className="section">
        <div className="container">
          <Reveal as="div" className="section-rule" aria-hidden="true" />

          <Reveal as="div">
            <SectionLabel id="hello" />
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

          <Reveal as="div" className="skill-groups" style={{ "--i": 2 }}>
            {aboutInfo.skillGroups.map((group) => (
              <div className="skill-group" key={group.name}>
                <h3 className="k">{group.name}</h3>
                <ul className="hello-skills">
                  {group.items.map((skill) => (
                    <li className="hello-skill" key={skill}>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    );
  }
}
