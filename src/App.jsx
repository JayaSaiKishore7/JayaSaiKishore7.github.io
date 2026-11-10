import { Component } from "react";
import { Navbar } from "./components/Navbar/Navbar";
import { ScrollProgress } from "./components/ScrollProgress/ScrollProgress";
import { Hero } from "./components/Hero/Hero";
import { ProofStrip } from "./components/ProofStrip/ProofStrip";
import { Projects } from "./components/Projects/Projects";
import { Resume } from "./components/Resume/Resume";
import { Education } from "./components/Education/Education";
import { Contact } from "./components/Contact/Contact";
import { Connect } from "./components/Connect/Connect";
import { CaseStudy } from "./components/CaseStudy/CaseStudy";
import { Footer } from "./components/Footer/Footer";
import { navLinks } from "./data/nav";
import { projects } from "./data/projects";
import { resolveRoute } from "./routes";
import { NmsReveal } from "./utils/NmsReveal";
import { ScrollSpy } from "./utils/ScrollSpy";

const sectionIds = navLinks.map((link) => link.id);

/**
 * The page shell. `path` (the URL path, from main.jsx in the browser or
 * entry-server.jsx at build time) picks the page: home or a case study.
 */
class App extends Component {
  constructor(props) {
    super(props);
    this.route = resolveRoute(props.path, projects);
    // The home section currently in view (null on the hero), shown in the navbar.
    this.state = { active: null };
    this.handleActive = this.handleActive.bind(this);
  }

  componentDidMount() {
    // Page boot state for index.html's fallback timer, tests and tools.
    document.documentElement.dataset.app = "ready";

    this.nms = new NmsReveal({ selector: ".section-header-title, .work-statement, .section-heading, .hello-statement" });
    this.nms.start();

    if (this.route.page === "home") {
      this.scrollSpy = new ScrollSpy({ sectionIds, initial: this.state.active, onChange: this.handleActive });
      this.scrollSpy.start();
    }
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
    const { route } = this;

    if (route.page === "case-study") {
      return (
        <>
          <ScrollProgress />
          <Navbar onHome={false} />
          <CaseStudy project={route.project} />
          <Footer />
        </>
      );
    }

    return (
      <>
        <ScrollProgress />
        <Navbar onHome active={active} />
        <Hero />
        <ProofStrip />
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
