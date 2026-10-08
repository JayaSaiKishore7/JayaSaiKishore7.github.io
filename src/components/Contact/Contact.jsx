import { profile } from "../../data/profile";
import { Reveal } from "../Reveal";
import pinIcon from "../../assets/icons/pin.svg";
import phoneIcon from "../../assets/icons/phone.svg";
import emailIcon from "../../assets/icons/email.svg";
import fileIcon from "../../assets/icons/file.svg";
import "./Contact.css";

const cards = [
  { icon: pinIcon, label: "Address", content: profile.location },
  { icon: phoneIcon, label: "Contact Number", content: profile.phone },
  {
    icon: emailIcon,
    label: "Email Address",
    content: <a href={`mailto:${profile.email}`}>{profile.email}</a>,
  },
  {
    icon: fileIcon,
    label: "Download Resume",
    content: (
      <a href={profile.resume} download>
        Resume
      </a>
    ),
  },
];

export function Contact() {
  return (
    <section id="contact" className="section">
      <div className="container">
        <p className="section-eyebrow">Let's talk</p>
        <h2 className="section-title">Contact</h2>
        <p className="section-text">
          Below are the details to reach out to me for projects, collaboration or opportunities.
        </p>

        <div className="contact-board">
          {cards.map((card) => (
            <Reveal className="contact-card" key={card.label}>
              <div className="contact-icon">
                <img src={card.icon} alt="" />
              </div>
              <h4>{card.label}</h4>
              <p>{card.content}</p>
            </Reveal>
          ))}
        </div>

        <div className="contact-cta">
          <p className="contact-question">Have a question?</p>
          <a href={`mailto:${profile.email}`} className="btn contact-btn">
            Click here
          </a>
        </div>

        <div className="contact-social">
          <p>Find me on</p>
          <div className="social-icons">
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="social-circle">
              <i className="fa-brands fa-linkedin-in" />
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer" className="social-circle">
              <i className="fa-brands fa-github" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
