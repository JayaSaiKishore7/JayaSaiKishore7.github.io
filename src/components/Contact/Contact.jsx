import { Component } from "react";
import { aboutInfo } from "../../data/profile";
import { Reveal } from "../Reveal";
import { TechList } from "../Project/TechList";
import { SectionHeader } from "../ui/SectionHeader";
import "./Contact.css";

export class Contact extends Component {
  render() {
    return (
      <section id="hello" className="section">
        <div className="container">
          <Reveal as="div" className="section-rule" aria-hidden="true" />

          <Reveal as="div">
            <SectionHeader id="hello" title={aboutInfo.statement} />
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
                <TechList items={group.items} label={group.name} />
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    );
  }
}
