import { Component } from "react";
import { aboutInfo } from "../../data/profile";
import { AboutLayers } from "../AboutLayers/AboutLayers";
import { Reveal } from "../Reveal";
import { SkillCards } from "../SkillCards/SkillCards";
import { SectionHeader } from "../ui/SectionHeader";
import "./About.css";

/**
 * The about section (#about): the statement, the about text beside the
 * "signal flow" network, and the skills belt. It used to be called "hello":
 * an empty #hello anchor at its top keeps old links working.
 */
export class About extends Component {
  render() {
    return (
      <section id="about" className="section section--ruled section--gap-after">
        <span id="hello" className="about-alias" aria-hidden="true" />
        <div className="container">
          <Reveal as="div">
            <SectionHeader id="about" title={aboutInfo.statement} />
          </Reveal>

          {/* The about text on the left, the "signal flow" network on the right (below on phones). */}
          <div className="about-grid">
            <Reveal as="div" className="about-text" style={{ "--i": 1 }}>
              <p className="k">about</p>
              {aboutInfo.paragraphs.map((line, i) => (
                <p className={i === 0 ? "about-para about-para--lead" : "about-para"} key={line}>
                  {line}
                </p>
              ))}
            </Reveal>
            <Reveal as="div" className="about-visual" style={{ "--i": 2 }}>
              <AboutLayers />
            </Reveal>
          </div>

          {/* A slow belt of cards, one per skill group (SkillCards). */}
          <Reveal as="div" className="about-skills" style={{ "--i": 2 }}>
            <h3 className="k">skills</h3>
            <SkillCards groups={aboutInfo.skillGroups} />
          </Reveal>
        </div>
      </section>
    );
  }
}
