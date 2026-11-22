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

// The "training log" footer (Footer.jsx), also the page's contact section. All lowercase on purpose.
export const footerInfo = {
  // The first two terminal lines (echo the loading screen): the command, then its result.
  command: "python contact.py",
  result: "running inference… match found",
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

export const heroInfo = [
  { label: "focus", value: "ML, DL, computer vision, LLMs/RAG, MLOps." },
  // `anchor`: on desktop the card moves so this row lines up with the hero's tagline.
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
