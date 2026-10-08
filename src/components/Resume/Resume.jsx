import { education, experience } from "../../data/experience";
import { Reveal } from "../Reveal";
import "./Resume.css";

export function Resume() {
  return (
    <section id="resume" className="section">
      <div className="container">
        <p className="section-eyebrow">Where I've been</p>
        <h2 className="section-title">Resume</h2>
        <p className="section-text resume-intro">
          I've worked across software engineering and data science, contributing to ML
          workflows, automation, and experimentation. Below is a quick overview of my experience
          and education.
        </p>

        <h3 className="sub-heading">Experience</h3>

        <div className="timeline">
          {experience.map((item) => (
            <Reveal as="article" className="timeline-item" key={item.company + item.date}>
              <span className="dot" />
              <div className="timeline-content">
                <h4>
                  {item.role} — {item.company}
                </h4>
                <p className="date">{item.date}</p>
                <p className="role-summary">{item.summary}</p>
                <ul>
                  {item.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <h3 className="sub-heading sub-heading-edu">Education</h3>

        <div className="edu-list">
          {education.map((item) => (
            <Reveal as="article" className="edu-card" key={item.degree}>
              <h4>{item.degree}</h4>
              <p className="edu-meta">{item.meta}</p>
              <ul>
                {item.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
