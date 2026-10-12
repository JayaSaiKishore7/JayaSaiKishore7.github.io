import { Component } from "react";
import { Navbar } from "./components/Navbar/Navbar";
import { Hero } from "./components/Hero/Hero";
import { Projects } from "./components/Projects/Projects";
import { Resume } from "./components/Resume/Resume";
import { Education } from "./components/Education/Education";
import { Contact } from "./components/Contact/Contact";
import { Connect } from "./components/Connect/Connect";
import { Footer } from "./components/Footer/Footer";
import { NmsReveal } from "./utils/NmsReveal";

class App extends Component {
  componentDidMount() {
    this.nms = new NmsReveal({ selector: ".work-statement, .section-heading, .hello-statement" });
    this.nms.start();
  }

  componentWillUnmount() {
    this.nms?.stop();
  }

  render() {
    return (
      <>
        <Navbar />
        <Hero />
        <Projects />
        <Resume />
        <Education />
        <Contact />
        <Connect />
        <Footer />
      </>
    );
  }
}

export default App;
