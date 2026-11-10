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

          {/* Every skill in one row of chips (wrapping on narrow screens); the data stays grouped. */}
          <Reveal as="div" className="hello-skills" style={{ "--i": 2 }}>
            <h3 className="k">skills</h3>
            <TechList items={aboutInfo.skillGroups.flatMap((group) => group.items)} label="skills" />
          </Reveal>
        </div>
      </section>
    );
  }
}
