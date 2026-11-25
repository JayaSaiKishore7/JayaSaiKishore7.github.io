export const experience = [
  {
    role: "Data Science Intern",
    company: "STMicroelectronics",
    location: "Rousset, France",
    date: "Apr 2026 – Oct 2026",
    summary:
      "Part of the Quality, Manufacturing & Technology (QMT) – Data Science team. Improved production-line efficiency by developing a deep learning object detection solution that replaces manual operator inspection of solder-ball defects in semiconductor packages.",
    // Bullets: English translation of the resume (public/resume/), same numbers.
    points: [
      "Built a computer vision pipeline (Python, PyTorch, SAM3, OpenCV, YOLO11) for semiconductor inspection, covering preprocessing, segmentation, detection and grid localisation.",
      "Fine-tuned YOLO11 on an industrial dataset with data augmentation and training optimisation, raising detection accuracy from 70% to 90% and cutting inference time from 2 seconds to a few milliseconds per image.",
      "Integrated the pipeline with FastAPI, WebSockets, MariaDB, a NAS and Vue.js for automated image monitoring, data management and real-time inspection tracking.",
    ],
    stack: ["Python", "PyTorch", "SAM3", "OpenCV", "YOLO11", "MLflow", "FastAPI", "WebSockets", "Vue.js", "MariaDB"],
  },
  {
    role: "Sr. Software Engineer",
    company: "Capgemini Technologies Pvt Ltd",
    location: "Hyderabad, India",
    date: "Dec 2021 – Dec 2022",
    summary: "Supported ML-driven and data-intensive features within production-grade systems.",
    points: [
      "Automated preprocessing, feature engineering and validation in ML and data pipelines.",
      "Containerised ML services with Docker, Jenkins and Ansible, cutting deployment time by 40%, with models served through REST APIs.",
      "Set up end-to-end monitoring and CI/CD with logging, metrics and artifact versioning, improving model reliability by 30%.",
    ],
  },
  {
    role: "Data Scientist Junior",
    company: "Digital Lync",
    location: "Hyderabad, India",
    date: "Jun 2019 – Nov 2021",
    summary: "Supported end-to-end ML experiments from datasets to model evaluation.",
    points: [
      "Built structured preprocessing, feature extraction and validation steps.",
      "Ran 20+ experiments with cross-validation and hyperparameter tuning, cutting data preparation time by 25% and raising model precision by 18%.",
      "Used residual analysis, feature attribution and variance diagnostics to reduce overfitting by 20%.",
    ],
  },
];

// kind: the small label above each education card's title.
export const education = [
  {
    kind: "master's degree",
    degree: "Master's in Data Science & Artificial Intelligence",
    meta: "DataScienceTech Institute • 2024 – 2026 • Sophia Antipolis, France",
    points: [
      "Advanced coursework in machine learning, deep learning, data engineering and MLOps.",
      "Hands-on projects in forecasting, computer vision and LLM/RAG-based applications.",
      "Focus on designing end-to-end ML workflows, from experimentation to reliable delivery.",
    ],
  },
  {
    kind: "bachelor's degree",
    degree: "Bachelor's in Electronics and Communication Engineering",
    meta: "Gudlavalleru Engineering College • 2015 – 2019 • Andhra Pradesh, India",
    points: [
      "Built strong foundations in mathematics, signal processing and communication systems.",
      "Developed core programming, problem-solving and engineering skills.",
      "Academic projects that sparked interest in data-driven systems and ML.",
    ],
  },
];