import { Component } from "react";
import { profile, aboutInfo } from "../../data/profile";
import "./Contact.css";

export class Contact extends Component {
  render() {
    return (
      <section id="hello" className="section">
        <div className="container">
          <p className="section-label">04 — hello</p>
          <h2 className="section-heading">say hello.</h2>

          <p className="hello-bio">{aboutInfo.paragraph}</p>

          <div className="hello-skills">
            {aboutInfo.skills.map((skill) => (
              <span className="hello-skill" key={skill}>
                {skill}
              </span>
            ))}
          </div>

          <a href={`mailto:${profile.email}`} className="hello-email">
            {profile.email}
          </a>

          <div className="hello-meta">
            <span>{profile.phone}</span>
            <span>{profile.location}</span>
          </div>

          <div className="hello-links">
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              linkedin ↗
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer">
              github ↗
            </a>
            <a href={profile.resume} download>
              resume ↗
            </a>
          </div>
        </div>
      </section>
    );
  }
}
