import { Component } from "react";
import { aboutInfo } from "../../data/profile";
import { Reveal } from "../Reveal";
import { SkillCards } from "../SkillCards/SkillCards";
import { SectionHeader } from "../ui/SectionHeader";
import "./Contact.css";

const tools = aboutInfo.skillGroups.filter((group) => !group.spoken);
const spoken = aboutInfo.skillGroups.filter((group) => group.spoken);

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

          {/* A slow belt of cards, one per tool group (SkillCards).
              Spoken languages aren't tools, so they follow as a plain line of text. */}
          <Reveal as="div" className="hello-skills" style={{ "--i": 2 }}>
            <h3 className="k">skills</h3>
            <SkillCards groups={tools} />
            {spoken.map((group) => (
              <p className="hello-line" key={group.name}>
                <span className="hello-line-k">{group.name}:</span> {group.items.join(", ")}
              </p>
            ))}
          </Reveal>

          <Reveal as="div" className="hello-skills" style={{ "--i": 3 }}>
            <h3 className="k">certifications &amp; open source</h3>
            <ul className="hello-list">
              {aboutInfo.credentials.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    );
  }
}
