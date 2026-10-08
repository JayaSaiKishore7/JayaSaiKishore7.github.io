import { Navbar } from "./components/Navbar/Navbar";
import { Hero } from "./components/Hero/Hero";
import { About } from "./components/About/About";
import { Resume } from "./components/Resume/Resume";
import { Projects } from "./components/Projects/Projects";
import { Contact } from "./components/Contact/Contact";
import { Footer } from "./components/Footer/Footer";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Resume />
      <Projects />
      <Contact />
      <Footer />
    </>
  );
}

export default App;
