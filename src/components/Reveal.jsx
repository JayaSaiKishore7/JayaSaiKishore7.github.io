import { Component, createRef } from "react";

export class Reveal extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
    this.nodeRef = createRef();
    this.observer = null;
  }

  componentDidMount() {
    const el = this.nodeRef.current;
    if (!el) return;

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.setState({ visible: true });
          this.observer.unobserve(entry.target);
        }
      },
      { threshold: this.props.threshold ?? 0.2 }
    );

    this.observer.observe(el);
  }

  componentWillUnmount() {
    this.observer?.disconnect();
  }

  render() {
    const { as: Tag = "div", className = "", threshold, children, ...rest } = this.props;
    const classes = ["reveal", this.state.visible ? "is-visible" : "", className]
      .filter(Boolean)
      .join(" ");

    return (
      <Tag ref={this.nodeRef} className={classes} {...rest}>
        {children}
      </Tag>
    );
  }
}
