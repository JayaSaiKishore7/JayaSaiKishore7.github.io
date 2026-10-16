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
    title: "PDF Question Answering with RAG",
    what: "answers questions about an uploaded pdf from the passages it retrieves, not from memory.",
    meta: "retrieval · LangChain · ChromaDB · Gemini · Flask",
    tags: ["LangChain", "ChromaDB", "Sentence-Transformers", "Gemini", "Flask"],
    link: "https://github.com/JayaSaiKishore7/RagPdfSummarizer",
    notes: {
      why: "long pdfs blow past context windows, and an llm answering from memory drifts from the source. i wanted answers grounded in the actual pages.",
      inside:
        "the pdf is split into 1,000-character chunks with 200 overlap, embedded with minilm into a chromadb store per user session, and the 3 closest chunks go to gemini 2.0 flash, which answers from that context only.",
      learning: "chunk size and overlap mattered more to answer quality than which llm wrote the answer.",
    },
    proof: "served through a flask app with a separate vector store per session, pdf-only uploads and a 16 mb size limit.",
    aside: "chunk size and overlap are still the main levers being tuned.",
    frag: {
      file: "rag-pdf-summarizer / app.py",
      code: `text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len
)
results = vector_store.similarity_search(query, k=3)`,
    },
  },
  {
    id: "electricity-forecast",
    variant: "row",
    title: "Electricity Load Forecasting (Time Series)",
    what: "forecasts a full day of 15-minute load (96 steps), and rebuilds a research algorithm as an r package.",
    meta: "time series · scikit-learn · XGBoost · R",
    tags: ["Time Series", "Random Forest", "XGBoost", "SARIMA", "LSTM", "R"],
    link: "https://github.com/JayaSaiKishore7/Time_Series_Electricity_Forecasting",
    notes: {
      why: "most demos stop at one-step-ahead forecasts, which hide how error compounds. i wanted a model that still held up 96 steps out.",
      inside:
        "exponential smoothing, sarima, random forest, xgboost, svr, mlp and lstm are compared with timeseriessplit on lag, rolling and calendar features. the weighted nearest neighbours method (talavera-llames et al., 2016) is implemented from the paper as an installable r package.",
      learning: "recursive multi-step forecasting punishes small early errors, feature engineering mattered more than model choice.",
    },
    proof: "a final 96-step forecast, plus the wnnforecast r package with roxygen docs and a vignette.",
    aside: "still testing how far the recursive horizon can stretch before error compounds too much.",
    frag: {
      file: "time-series-electricity-forecasting / WNN_Package/R/wnn_forecast.R",
      code: `dists <- apply(model$X, 1, function(row) euclidean_distance(row, window))
idx <- order(dists)[1:model$k]
weights <- 1/(dists[idx] + 1e-8)
weights <- weights / sum(weights)
sum(weights * model$y[idx])`,
    },
  },
  {
    id: "diabetes",
    variant: "flip",
    title: "Machine Learning for Diabetes Risk Prediction",
    what: "96% accuracy, 0.993 auc, and a web form to act on it.",
    meta: "team project · clinical ML · XGBoost · FastAPI",
    tags: ["XGBoost", "Random Forest", "FastAPI", "Clinical Data"],
    link: "https://github.com/JayaSaiKishore7/diabetes_prediction",
    notes: {
      why: "a model sitting in a notebook doesn't help anyone. i wanted the prediction to be one form-submit away.",
      inside:
        "15,000 clinical records are cleaned down to 10,471, then random forest and xgboost are compared; xgboost won (0.993 vs 0.983 auc) and ships behind a fastapi endpoint.",
      learning: "the feature-engineering pass moved the needle more than swapping algorithms did.",
    },
    proof: "0.993 auc and 96.1% accuracy on 2,095 held-out records.",
    aside: "the fastapi endpoint returns a diabetes probability from the saved xgboost model.",
    frag: {
      file: "diabetes-prediction / models/XGBClassifier.ipynb",
      code: `xgb_model = XGBClassifier()
xgb_model.fit(X_train, y_train)
y_proba = xgb_model.predict_proba(X_test)[:, 1]
# test AUC: 0.993`,
    },
  },
];
