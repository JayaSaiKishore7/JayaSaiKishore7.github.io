import { Component } from "react";
import { Navbar } from "./components/Navbar/Navbar";
import { Hero } from "./components/Hero/Hero";
import { Projects } from "./components/Projects/Projects";
import { Resume } from "./components/Resume/Resume";
import { Education } from "./components/Education/Education";
import { Contact } from "./components/Contact/Contact";
import { Connect } from "./components/Connect/Connect";
import { Footer } from "./components/Footer/Footer";

class App extends Component {
  render() {
    return (
      <>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Navbar />
        <main id="main-content">
          <Hero />
          <Projects />
          <Resume />
          <Education />
          <Contact />
          <Connect />
        </main>
        <Footer />
      </>
    );
  }
}

export default App;
