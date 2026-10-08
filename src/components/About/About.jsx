import { aboutInfo, profile } from "../../data/profile";
import { Reveal } from "../Reveal";
import "./About.css";

export function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <p className="section-eyebrow">Get to know me</p>
        <h2 className="section-title">About</h2>

        <p className="section-text">{aboutInfo.paragraph}</p>

        <Reveal className="two-cols">
          {aboutInfo.columns.map((column, i) => (
            <ul key={i}>
              {column.map((item) => (
                <li key={item.label}>
                  <span>{item.label}:</span> {item.value}
                </li>
              ))}
            </ul>
          ))}
        </Reveal>

        <div className="skill-tags">
          {aboutInfo.skills.map((skill) => (
            <span className="skill-tag" key={skill}>
              {skill}
            </span>
          ))}
        </div>

        <div className="about-btn-wrapper">
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn linked-btn">
            LinkedIn
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer" className="btn github-btn">
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
