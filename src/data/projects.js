export const projects = [
  {
    id: "emotion-rag",
    title: "Emotion-Aware Insight Generator",
    what: "turns a face into context-aware text, not just an emotion label.",
    meta: "computer vision · ResNet-50 · FAISS · LangChain",
    tags: ["ResNet-50", "FAISS", "LangChain", "Flan-T5"],
    link: "https://github.com/JayaSaiKishore7/Emotion_RAG_Application",
    notes: {
      why: "a single emotion label throws away most of the signal. i wanted the system to explain the feeling, not just name it.",
      inside:
        "resnet-50 extracts facial affect features, faiss retrieves similar context, and flan-t5 turns both into a short interpretive insight through langchain.",
      learning:
        "retrieval quality mattered more than the generator, weak context produced confident but wrong insights.",
    },
    proof: "every prediction runs through a validation and interpretability pass before it reaches the output.",
    aside: "still refining how the interpretability checks catch weak context before it reaches the output.",
    frag: {
      file: "emotion-rag / src/insight.py",
      code: `matches = faiss_index.search(
    embed(face_features), k=5
)
context = "\\n".join(m.text for m in matches)
insight = flan_t5.generate(
    prompt=f"{emotion}: {context}"
)`,
    },
  },
  {
    id: "air-quality",
    title: "Air Quality Forecasting Platform",
    what: "forecasts air quality station by station, not just city-wide averages.",
    meta: "forecasting · Python · LSTM/GRU · MLflow",
    tags: ["Python", "Scikit-learn", "LSTM/GRU", "MLflow", "FastAPI", "Streamlit"],
    link: "https://github.com/JayaSaiKishore7/AirQuality_AnalysisFR",
    notes: {
      why: "a single city-wide number hides which stations are actually at risk. i wanted station-level forecasts people could act on.",
      inside:
        "lstm/gru sequence models benchmarked against classical baselines, every run tracked in mlflow, results served through a fastapi backend and a streamlit dashboard.",
      learning:
        "the neural baselines only earned their complexity on stations with long, clean histories. simpler models won everywhere else.",
    },
    proof: "station-wise dashboard compares model forecasts against held-out actuals.",
    aside: "next up: extending station coverage beyond the côte d'azur region.",
    frag: {
      file: "air-quality / src/forecast.py",
      code: `model = Sequential([
    LSTM(64, return_sequences=True),
    GRU(32),
    Dense(1),
])
mlflow.log_metric("rmse", rmse)`,
    },
  },
  {
    id: "brain-tumor",
    title: "Brain Tumor MRI Classifier",
    what: "97.15% test accuracy, after augmentation first made it worse.",
    meta: "computer vision · TensorFlow · Keras · Flask",
    tags: ["TensorFlow", "Keras", "CNN", "Flask", "Computer Vision"],
    link: "https://github.com/JayaSaiKishore7/brain-tumor-classifier",
    notes: {
      why: "a basic cnn trained from scratch needed augmentation to generalize, but natural-photo-strength augmentation distorted the exact regions mri diagnosis depends on.",
      inside:
        "four conv/pool blocks, mild rotation/zoom/brightness augmentation tuned specifically for mri, trained with early stopping and checkpointing.",
      learning:
        "the first augmentation pass dropped accuracy to 92.5%. turning the strength down to roughly a third fixed it and beat the no-augmentation baseline on every class.",
    },
    proof: "97.15% test accuracy, 94.3% meningioma f1, documented end to end in the readme.",
    aside: "limitations are documented in the readme, not claiming clinical validity.",
    frag: {
      file: "brain-tumor-classifier / src/train.py",
      code: `layers.RandomRotation(0.02),
layers.RandomZoom(0.05),
layers.RandomBrightness(0.05),
layers.Rescaling(1.0 / 255),`,
    },
  },
  {
    id: "rag-pdf",
    variant: "split",
    title: "PDF Understanding & AI Summarization",
    what: "retrieves the right page before it ever asks the model to summarize.",
    meta: "retrieval · LangChain · ChromaDB · Flask",
    tags: ["LangChain", "HuggingFace", "ChromaDB", "Flask"],
    link: "https://github.com/JayaSaiKishore7/RagPdfSummarizer",
    notes: {
      why: "long pdfs blow past context windows, and naive summarization drifts from the source. i wanted answers grounded in the actual pages.",
      inside:
        "documents are chunked and embedded into chromadb, langchain retrieves the relevant chunks, and the llm summarizes only what was retrieved.",
      learning: "chunk size and overlap mattered more to answer quality than which llm did the summarizing.",
    },
    proof: "served through a flask app that returns the summary alongside the source chunks it was built from.",
    aside: "chunk size and overlap are still the main levers being tuned.",
    frag: {
      file: "rag-pdf-summarizer / src/summarize.py",
      code: `chunks = splitter.split_documents(pdf_docs)
vectordb = Chroma.from_documents(chunks, embeddings)
context = vectordb.similarity_search(query, k=4)
summary = llm.invoke(prompt.format(context=context))`,
    },
  },
  {
    id: "electricity-forecast",
    variant: "row",
    title: "Electricity Load Forecasting (Time Series)",
    what: "forecasts 96 steps ahead, not just the next hour.",
    meta: "time series · XGBoost · Random Forest",
    tags: ["Time Series", "XGBoost", "Random Forest"],
    link: "https://github.com/JayaSaiKishore7/Time_Series_Electricity_Forecasting",
    notes: {
      why: "most demos stop at one-step-ahead forecasts, which hide how error compounds. i wanted a model that still held up 96 steps out.",
      inside:
        "lag-based and temporal features feed random forest and xgboost, validated with timeseriessplit, forecasting recursively across the full horizon.",
      learning: "recursive multi-step forecasting punishes small early errors, feature engineering mattered more than model choice.",
    },
    proof: "benchmarked against statistical baselines on held-out rmse and mae.",
    aside: "still testing how far the recursive horizon can stretch before error compounds too much.",
    frag: {
      file: "time-series-electricity-forecasting / src/forecast.py",
      code: `cv = TimeSeriesSplit(n_splits=5)
model = XGBRegressor(n_estimators=400)
preds = recursive_forecast(model, horizon=96)
rmse = mean_squared_error(y_true, preds, squared=False)`,
    },
  },
  {
    id: "diabetes",
    variant: "flip",
    title: "Machine Learning for Diabetes Risk Prediction",
    what: "96% accuracy, 0.993 auc, and a live app to act on it.",
    meta: "clinical ML · XGBoost · FastAPI",
    tags: ["XGBoost", "FastAPI", "Clinical Data"],
    link: "https://github.com/JayaSaiKishore7/diabetes_prediction",
    notes: {
      why: "a model sitting in a notebook doesn't help anyone. i wanted the prediction to be one form-submit away.",
      inside:
        "a cleaning and feature-engineering pipeline on 15k clinical records feeds several candidate models; xgboost won and ships behind a fastapi endpoint.",
      learning: "the feature-engineering pass moved the needle more than swapping algorithms did.",
    },
    proof: "0.993 auc and 96% accuracy on a held-out test set.",
    aside: "the fastapi endpoint is live, the model is one request away.",
    frag: {
      file: "diabetes-prediction / src/train.py",
      code: `model = XGBClassifier(
    max_depth=4, n_estimators=300
)
model.fit(X_train, y_train)
# test AUC: 0.993`,
    },
  },
];
