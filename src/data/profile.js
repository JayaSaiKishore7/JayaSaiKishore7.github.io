export const profile = {
  name: "Jaya Sai Kishore",
  fullName: "Jaya Sai Kishore Neerukonda",
  role: "machine learning engineer",
  city: "Marseille",
  location: "Marseille, France",
  timeZone: "Europe/Paris",
  email: "jayasaikishoren@gmail.com",
  linkedin: "https://www.linkedin.com/in/jaya-sai-kishore/",
  github: "https://github.com/JayaSaiKishore7",
  resume: "/resume/JayaSaiKishoreN_Resume.pdf",
  siteUrl: "https://jayasaikishore.pages.dev/",
};

// The contact section's "inference terminal" card (ContactCard.jsx). All lowercase on purpose.
export const contactInfo = {
  // Decoration typed in when the card scrolls into view (echoes the loading screen).
  terminal: ["$ python contact.py", "running inference… match found"],
  heading: "got a model that needs to leave the notebook?",
  intro: "i'm open to data scientist and computer vision roles.",
  email: profile.email,
  emailLabel: "say hi",
  closing: "send me the interesting problem. machine learning, computer vision, mlops, anything worth building",
};

// The "training log" footer (Footer.jsx), below the contact card. All lowercase on purpose.
export const footerInfo = {
  exitLine: "process finished with exit code",
  tagline: "still learning, always shipping",
  copyright: (year) => `© ${year} ${profile.fullName.toLowerCase()}`,
  links: [
    { label: "github", href: profile.github, external: true },
    { label: "linkedin", href: profile.linkedin, external: true },
    { label: "email", href: `mailto:${profile.email}` },
  ],
};

// Page title, description and link-preview data (rendered by src/data/head.js).
export const seo = {
  title: "Jaya Sai Kishore Neerukonda | Machine Learning Engineer",
  jobTitle: "Machine Learning Engineer",
  description:
    "Machine learning engineer in Marseille, France: computer vision, MLOps, forecasting and LLM/RAG. Took a YOLO-based X-ray inspection system at STMicroelectronics from prototype to production, raising its accuracy from 70% to 90%.",
  image: "/og-image.png",
};

// The hero's text (Hero.jsx). All lowercase on purpose. `headline` and
// `subline` are lists of pieces: a plain string, or { text, label } for a
// phrase the hero's detection box visits (in order, after the name).
export const heroText = {
  role: "machine learning engineer",
  nameLabel: "ml_engineer 0.90",
  headline: [
    { text: "computer vision", label: "computer_vision 0.97" },
    ", ",
    { text: "llms/rag", label: "llm_rag 0.93" },
    " and ",
    { text: "mlops", label: "mlops 0.95" },
    ". i build models you can deploy, measure and ",
    { text: "trust", label: "production 0.90" },
    ".",
  ],
  subline: [
    "lately, computer vision on a ",
    { text: "production line", label: "factory 0.94" },
    ". i care more about how models behave in production than how they ",
    { text: "train", label: "training 0.91" },
    ".",
  ],
  // Read by screen readers instead of the status line's changing numbers.
  statusText: "training run, loss 0.03",
};

// The info card on the right of the hero.
export const heroInfo = [
  { label: "focus", value: "ML, DL, computer vision, LLMs/RAG, MLOps." },
  // `anchor`: on desktop the hero's text lines up with this row.
  { label: "latest", value: "data science intern, STMicroelectronics.", anchor: true },
  { label: "stack", value: "Python, PyTorch, TensorFlow, OpenCV, Docker, MLflow." },
  { label: "status", value: "open to work.", status: true },
  // `href` renders the value as a link; `download` makes the browser save the file.
  { label: "resume", value: "download ↗", href: profile.resume, download: true },
];

export const aboutInfo = {
  statement: "i build things that have to survive the real world, not just the demo.",
  // The about text, one <p> each; the first in the normal text colour, the rest muted.
  paragraphs: [
    "a machine learning engineer and data scientist working across computer vision, NLP and LLMs/RAG.",
    "i hold a master's in data science & AI (2026), with a focus on rigorous experimentation, model evaluation, and production-grade MLOps pipelines that scale.",
    "most recently, i took an AI-based X-ray inspection system at STMicroelectronics from prototype to production deployment.",
  ],
  // Grouped by area, no percentage bars. Matches the resume (public/resume/).
  skillGroups: [
    { name: "programming", items: ["Python", "SQL"] },
    { name: "machine learning", items: ["scikit-learn", "XGBoost", "Pandas", "NumPy"] },
    { name: "deep learning", items: ["PyTorch", "TensorFlow", "CNN", "ResNet"] },
    { name: "computer vision", items: ["OpenCV", "YOLO", "SAM3", "object detection"] },
    { name: "LLMs & NLP", items: ["Transformers (Hugging Face)", "LangChain", "ChromaDB"] },
    { name: "web", items: ["FastAPI", "Flask", "WebSockets", "Vue.js"] },
    { name: "databases", items: ["MySQL", "MariaDB"] },
    { name: "MLOps & cloud", items: ["MLflow", "DVC", "Docker", "Git", "CI/CD", "AWS (EC2, S3)"] },
  ],
};
