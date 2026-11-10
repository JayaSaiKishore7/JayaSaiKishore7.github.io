import { Component, createRef } from "react";
import "./ScrollProgress.css";

/**
 * A thin accent bar across the top of the page showing how far down you are.
 * A scroll listener (at most one update per frame) sets the bar's scaleX.
 * Purely decorative: nothing depends on it.
 */
export class ScrollProgress extends Component {
  constructor(props) {
    super(props);
    this.barRef = createRef();
    this.frame = null;
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleScroll, { passive: true });
    this.update();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleScroll);
    cancelAnimationFrame(this.frame);
  }

  handleScroll() {
    if (this.frame !== null) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      this.update();
    });
  }

  update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    if (this.barRef.current) this.barRef.current.style.transform = `scaleX(${progress})`;
  }

  render() {
    return <div ref={this.barRef} className="scroll-progress" aria-hidden="true" />;
  }
}
