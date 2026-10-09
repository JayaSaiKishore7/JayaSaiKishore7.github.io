export const experience = [
  {
    role: "Data Science Intern",
    company: "STMicroelectronics",
    location: "Rousset, France",
    date: "Apr 2026 – Oct 2026",
    summary:
      "Delivered an end-to-end AI-based X-ray inspection solution for semiconductor packaging, from data preparation to production deployment.",
    points: [
      "Engineered a deep learning object detection solution (YOLO11) to identify defective solder balls in X-ray images of flip-chip BGA packages, supporting automated quality control in manufacturing.",
      "Designed a semi-automated annotation pipeline combining SAM-based segmentation, grid-based labeling and template matching, reducing manual labeling effort.",
      "Built and deployed an event-driven inference pipeline in Python that automatically processes incoming production images and persists results to a MariaDB database.",
      "Developed a real-time Vue.js inspection dashboard enabling quality teams to visualize detected defects and their exact grid positions.",
      "Collaborated with data engineering and manufacturing stakeholders to align the solution with production requirements.",
    ],
    stack: ["Python", "FastAPI", "SAM3", "YOLO11", "WebSocket", "Watchdog Monitor", "MLflow"],
  },
  {
    role: "Sr. Software Engineer",
    company: "Capgemini Technologies Pvt Ltd",
    location: "Hyderabad, India",
    date: "Dec 2021 – Dec 2022",
    summary: "Supported ML-driven and data-intensive features within production-grade systems.",
    points: [
      "Supported data pipelines used for analytics and machine learning workflows.",
      "Collaborated with data scientists to operationalize preprocessing and feature generation logic.",
      "Worked on containerized services and CI/CD pipelines to enable consistent and reliable deployments.",
      "Assisted with monitoring, logging, and debugging of data-driven services in production.",
    ],
  },
  {
    role: "Data Science Intern",
    company: "Digital Lync",
    location: "Hyderabad, India",
    date: "Jun 2019 – Apr 2020",
    summary: "Supported end-to-end ML experiments from datasets to model evaluation.",
    points: [
      "Prepared datasets through cleaning, normalization, and feature extraction.",
      "Trained and evaluated classical ML models using metrics such as accuracy, precision, recall, and AUC.",
      "Performed exploratory data analysis and error analysis to guide model improvements.",
      "Documented experiments and results to support iterative model development.",
    ],
  },
];

export const education = [
  {
    degree: "Master's in Data Science & Artificial Intelligence",
    meta: "DataScienceTech Institute • 2024 – 2026 • Sophia Antipolis, France",
    points: [
      "Advanced coursework in machine learning, deep learning, data engineering and MLOps.",
      "Hands-on projects in forecasting, computer vision and LLM/RAG-based applications.",
      "Focus on designing end-to-end ML workflows, from experimentation to reliable delivery.",
    ],
  },
  {
    degree: "Bachelor's in Electronics and Communication Engineering",
    meta: "Gudlavalleru Engineering College • 2015 – 2019 • Andhra Pradesh, India",
    points: [
      "Built strong foundations in mathematics, signal processing and communication systems.",
      "Developed core programming, problem-solving and engineering skills.",
      "Academic projects that sparked interest in data-driven systems and ML.",
    ],
  },
];
