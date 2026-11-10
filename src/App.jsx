import { Component } from "react";
import { Navbar } from "./components/Navbar/Navbar";
import { SideNav } from "./components/SideNav/SideNav";
import { Hero } from "./components/Hero/Hero";
import { Projects } from "./components/Projects/Projects";
import { Resume } from "./components/Resume/Resume";
import { Education } from "./components/Education/Education";
import { Contact } from "./components/Contact/Contact";
import { Connect } from "./components/Connect/Connect";
import { Footer } from "./components/Footer/Footer";
import { navLinks } from "./data/nav";
import { NmsReveal } from "./utils/NmsReveal";
import { ScrollSpy } from "./utils/ScrollSpy";

const sectionIds = navLinks.map((link) => link.id);

class App extends Component {
  constructor(props) {
    super(props);
    // The section currently in view (null on the hero). One ScrollSpy feeds both navigations.
    this.state = { active: null };
    this.handleActive = this.handleActive.bind(this);
  }

  componentDidMount() {
    // Page boot state for index.html's fallback timer, tests and tools.
    document.documentElement.dataset.app = "ready";

    this.nms = new NmsReveal({ selector: ".work-statement, .section-heading, .hello-statement" });
    this.nms.start();

    this.scrollSpy = new ScrollSpy({ sectionIds, initial: this.state.active, onChange: this.handleActive });
    this.scrollSpy.start();
  }

  componentWillUnmount() {
    this.nms?.stop();
    this.scrollSpy?.stop();
  }

  handleActive(active) {
    this.setState({ active });
  }

  render() {
    const { active } = this.state;

    return (
      <>
        <Navbar active={active} />
        <SideNav active={active} />
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
