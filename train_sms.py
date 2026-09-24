"""Train the scam-text classifier (TF-IDF + Logistic Regression).
CSV columns: text,label   where label is one of: safe, phishing, fake_job, fake_loan, prize
Usage: python train_sms.py --csv sms_data.csv"""
import argparse, joblib, pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

ap = argparse.ArgumentParser(); ap.add_argument('--csv', default='sms_seed.csv'); a = ap.parse_args()
df = pd.read_csv(a.csv).dropna()
Xtr, Xte, ytr, yte = train_test_split(df['text'], df['label'], test_size=0.2, stratify=df['label'], random_state=42) if len(df) > 200 else (df['text'], df['text'], df['label'], df['label'])
pipe = Pipeline([('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True, lowercase=True)),
                 ('clf', LogisticRegression(max_iter=2000, class_weight='balanced'))])
pipe.fit(Xtr, ytr)
print(classification_report(yte, pipe.predict(Xte)))
joblib.dump(pipe, 'sms_model.joblib'); print('Saved sms_model.joblib')
