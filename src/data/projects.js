export const projects = [
  {
    title: "Air Quality Forecasting Platform",
    description:
      "Forecasting workflow for air quality in the Côte d'Azur region using public environmental data. Compares time-series models and neural baselines and presents predictions through a dashboard for station-wise analysis.",
    tags: ["Python", "Scikit-learn", "LSTM/GRU", "MLflow", "FastAPI", "Streamlit"],
    link: "https://github.com/JayaSaiKishore7/AirQuality_AnalysisFR",
    featured: true,
  },
  {
    title: "Emotion-Aware Insight Generator",
    description:
      "Emotion analysis prototype that extracts facial affect features and transforms them into context-aware insights. Combines computer vision and text interpretation models, supported by validation and interpretability checks to refine predictions and improve reliability.",
    tags: ["ResNet-50", "FAISS", "LangChain", "Flan-T5"],
    link: "https://github.com/JayaSaiKishore7/Emotion_RAG_Application",
  },
  {
    title: "PDF Understanding & AI Summarization",
    description:
      "Retrieval-assisted summarization system that breaks long PDFs into chunks, retrieves useful context and generates concise interpretations using a language model.",
    tags: ["LangChain", "HuggingFace", "ChromaDB", "Flask"],
    link: "https://github.com/JayaSaiKishore7/RagPdfSummarizer",
  },
  {
    title: "Electricity Load Forecasting (Time Series)",
    description:
      "Production-style electricity load forecasting pipeline. Engineered lag-based features and temporal signals, applied cross-validation with TimeSeriesSplit, and benchmarked Random Forest, XGBoost, and statistical baselines. Implemented recursive multi-step forecasting (96-step horizon) evaluated with RMSE and MAE.",
    tags: ["Time Series", "XGBoost", "Random Forest"],
    link: "https://github.com/JayaSaiKishore7/Time_Series_Electricity_Forecasting",
  },
  {
    title: "Machine Learning for Diabetes Risk Prediction",
    description:
      "End-to-end diabetes risk prediction system built on a 15k-row clinical dataset. Designed a robust data-cleaning and feature-engineering pipeline, evaluated multiple models and selected XGBoost, achieving 96% accuracy and a 0.993 AUC on the test set. Deployed a real-time FastAPI web app for instant predictions.",
    tags: ["XGBoost", "FastAPI", "Clinical Data"],
    link: "https://github.com/JayaSaiKishore7/diabetes_prediction",
  },
];
