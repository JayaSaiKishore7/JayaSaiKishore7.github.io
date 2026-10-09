import { Component } from "react";
import { profile } from "../../data/profile";
import { Reveal } from "../Reveal";
import "./Connect.css";

const GithubIcon = () => (
  <svg className="social-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="social-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M14.82 0H1.18C.53 0 0 .52 0 1.16v13.68C0 15.48.53 16 1.18 16h13.64c.65 0 1.18-.52 1.18-1.16V1.16C16 .52 15.47 0 14.82 0ZM4.75 13.63H2.38V6h2.37v7.63ZM3.56 4.97a1.37 1.37 0 1 1 0-2.74 1.37 1.37 0 0 1 0 2.74Zm10.07 8.66h-2.37V9.92c0-.87-.02-1.98-1.21-1.98-1.21 0-1.4.95-1.4 1.92v3.77H6.28V6h2.28v1.04h.03c.32-.6 1.09-1.21 2.24-1.21 2.4 0 2.8 1.58 2.8 3.63v4.17Z" />
  </svg>
);

export class Connect extends Component {
  constructor(props) {
    super(props);
    this.state = { copied: false };
    this.copyTimeout = null;
  }

  componentWillUnmount() {
    clearTimeout(this.copyTimeout);
  }

  handleCopy() {
    navigator.clipboard?.writeText(profile.email).then(() => {
      this.setState({ copied: true });
      clearTimeout(this.copyTimeout);
      this.copyTimeout = setTimeout(() => this.setState({ copied: false }), 1800);
    });
  }

  render() {
    const { copied } = this.state;

    return (
      <section id="contact" className="section">
        <div className="container">
          <Reveal as="div">
            <p className="section-label">05 · contact</p>
            <h2 className="section-heading">let's connect.</h2>
            <p className="section-sub">
              open to new opportunities and collaborations, reach out below.
            </p>
          </Reveal>

          <Reveal as="div" className="credits" style={{ "--i": 1 }}>
            <div className="cr cr-say">
              <p className="k">say hi</p>
              <p className="sign-sub">
                send me the interesting problem. machine learning, computer vision, mlops, anything worth building.
              </p>
              <p className="mail-row">
                <a href={`mailto:${profile.email}`} className="email-link">
                  {profile.email} ↗
                </a>
                <button type="button" className="copy" onClick={() => this.handleCopy()}>
                  <span>{copied ? "copied" : "copy"}</span>
                </button>
              </p>
            </div>

            <div className="cr cr-links">
              <p className="k">elsewhere</p>
              <ul className="socials">
                <li>
                  <a href={profile.github} target="_blank" rel="noreferrer">
                    <GithubIcon />
                    github
                  </a>
                </li>
                <li>
                  <a href={profile.linkedin} target="_blank" rel="noreferrer">
                    <LinkedinIcon />
                    linkedin
                  </a>
                </li>
              </ul>
            </div>

            <div className="cr cr-resume">
              <p className="k">resume</p>
              <p className="sign-sub">the full breakdown, one click away.</p>
              <a href={profile.resume} download className="email-link resume-link">
                download ↗
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }
}
