import { Component } from "react";
import { Navbar } from "./components/Navbar/Navbar";
import { Hero } from "./components/Hero/Hero";
import { Projects } from "./components/Projects/Projects";
import { Resume } from "./components/Resume/Resume";
import { Education } from "./components/Education/Education";
import { Contact } from "./components/Contact/Contact";
import { Footer } from "./components/Footer/Footer";

class App extends Component {
  render() {
    return (
      <>
        <Navbar />
        <Hero />
        <Projects />
        <Resume />
        <Education />
        <Contact />
        <Footer />
      </>
    );
  }
}

export default App;
