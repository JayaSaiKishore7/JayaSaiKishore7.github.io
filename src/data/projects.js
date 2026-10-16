export const projects = [
  {
    id: "emotion-rag",
    title: "Emotion-Aware Insight Generator",
    what: "reads the emotion on a face, then finds and summarizes the reviews that explain it.",
    meta: "computer vision · RAG · ResNet-50 · FAISS · Flan-T5",
    tags: ["ResNet-50", "FAISS", "LangChain", "Flan-T5", "RoBERTa", "Streamlit"],
    link: "https://github.com/JayaSaiKishore7/Emotion_RAG_Application",
    notes: {
      why: "an emotion label on its own doesn't say why someone feels that way. i wanted to connect a detected emotion to the feedback behind it.",
      inside:
        "a resnet-50 fine-tuned on fer-2013 labels the face, the emotion becomes a query, faiss pulls the 4 closest of 500 reviews, flan-t5 summarizes them and roberta scores each review's sentiment, all in a streamlit app.",
      learning:
        "the overall score hid the weak classes: 62% accuracy, but disgust, the rarest class, was right only 2 times out of 55, and none of the reviews ended up labelled disgust. per-class results told me more than the headline number.",
    },
    proof: "62.2% accuracy on the 3,589-image fer-2013 test set (happiness 89%), with a live streamlit demo.",
    aside: "disgust and fear are still the weak classes, and the readme says so.",
    frag: {
      file: "emotion-rag / core/models.py",
      code: `docs = db.similarity_search(query, k=4)
context = "\\n\\n".join([doc.page_content for doc in docs])
prompt = PROMPT_TEMPLATE.format(context=context, question=query)
answer = llm.invoke(prompt)`,
    },
  },
  {
    id: "air-quality",
    title: "Air Quality Forecasting Platform",
    what: "re-forecasts 24 hours ahead every morning from live government data, then checks itself.",
    meta: "forecasting · XGBoost · Evidently · GitHub Actions",
    tags: ["Python", "XGBoost", "Evidently", "MLflow", "FastAPI", "Streamlit", "GitHub Actions"],
    link: "https://github.com/JayaSaiKishore7/AirQuality_AnalysisFR",
    notes: {
      why: "a model trained once and left alone quietly goes stale. i wanted a forecaster that keeps running on fresh data and reports when it stops being trustworthy.",
      inside:
        "a daily github actions job pulls geod'air measurements for ~90 station/pollutant series in paca, xgboost forecasts 24h ahead recursively, evidently checks for drift and opens an issue when it finds it, and a static page goes out to hugging face.",
      learning:
        "my first score was too good to be true: the 3-hour average feature quietly included the hour being predicted. once it used only past hours, the 1-hour error rose (mae 3.42 → 3.69), but it now matches what the model actually sees when forecasting live. a test keeps it that way.",
    },
    proof: "on live data, beats persistence at 24h by 43% on o₃, 30% on no₂ and 23% on pm10. every forecast is scored against what was actually measured.",
    aside: "pm2.5 doesn't beat persistence yet, and the readme says so.",
    frag: {
      file: "air-quality / airquality/features.py",
      code: `past = v.shift(1)
g["lag_1"] = past
g["lag_24"] = v.shift(24)
g["rolling_3"] = past.rolling(3, min_periods=3).mean()`,
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
