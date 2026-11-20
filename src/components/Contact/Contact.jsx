import { Component } from "react";
import { aboutInfo } from "../../data/profile";
import { AboutLayers } from "../AboutLayers/AboutLayers";
import { Reveal } from "../Reveal";
import { SkillCards } from "../SkillCards/SkillCards";
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

          {/* The about text on the left, the "signal flow" network on the right (below on phones). */}
          <div className="hello-about-grid">
            <Reveal as="div" className="hello-about" style={{ "--i": 1 }}>
              <p className="k">about</p>
              {aboutInfo.paragraphs.map((line, i) => (
                <p className={i === 0 ? "hello-para hello-para--lead" : "hello-para"} key={line}>
                  {line}
                </p>
              ))}
            </Reveal>
            <Reveal as="div" className="hello-about-visual" style={{ "--i": 2 }}>
              <AboutLayers />
            </Reveal>
          </div>

          {/* A slow belt of cards, one per skill group (SkillCards). */}
          <Reveal as="div" className="hello-skills" style={{ "--i": 2 }}>
            <h3 className="k">skills</h3>
            <SkillCards groups={aboutInfo.skillGroups} />
          </Reveal>
        </div>
      </section>
    );
  }
}
