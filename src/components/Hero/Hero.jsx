import { useTypingEffect } from "../../hooks/useTypingEffect";
import { profile, roles } from "../../data/profile";
import profileImg from "../../assets/profile.jpg";
import "./Hero.css";

export function Hero() {
  const typingText = useTypingEffect(roles);

  return (
    <section id="home" className="section hero">
      <div className="container hero-inner">
        <div className="hero-text">
          <p className="hola">HOLA!</p>
          <h1>
            I'm{" "}
            <span className="highlight">
              Jaya Sai
              <br />
              Kishore
            </span>
          </h1>
          <h2>
            <span>{typingText}</span>
            <span className="caret" aria-hidden="true" />
          </h2>
          <p className="hero-sub">
            I focus on transforming data and models into useful, deployable solutions. I'm
            particularly interested in model development, evaluation and scaling techniques
            that improve performance and reliability.
          </p>
          <div className="hero-buttons">
            <a href="#projects" className="btn primary">
              View Projects
            </a>
            <a href={profile.resume} className="btn outline" download>
              Download CV
            </a>
          </div>
        </div>

        <div className="hero-photo">
          <img src={profileImg} alt={profile.fullName} />
        </div>
      </div>
    </section>
  );
}
