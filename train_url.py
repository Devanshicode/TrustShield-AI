"""Train the Layer-1 URL model (Random Forest on 23 lexical features).
Usage: python train_url.py --csv malicious_phish.csv --url-col url --label-col type
Label values 'benign' / 'safe' / 0 are treated as safe. Everything else counts as malicious."""
import argparse, joblib, pandas as pd, numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, precision_recall_curve
from features import extract, FEATURE_NAMES

ap = argparse.ArgumentParser()
ap.add_argument('--csv', required=True); ap.add_argument('--url-col', default='url')
ap.add_argument('--label-col', default='type'); ap.add_argument('--limit', type=int, default=200000)
a = ap.parse_args()

df = pd.read_csv(a.csv).dropna(subset=[a.url_col, a.label_col])
if len(df) > a.limit: df = df.sample(a.limit, random_state=42)
y = (~df[a.label_col].astype(str).str.lower().isin(['benign','safe','legitimate','0','good'])).astype(int).values
X = np.array([[extract(u)[k] for k in FEATURE_NAMES] for u in df[a.url_col]])
print('Rows:', len(X), '| malicious share:', round(y.mean(), 3))

Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
# class_weight fixes the weak-recall problem reported in the 2026 DT/RF/GB paper
model = RandomForestClassifier(n_estimators=100, max_depth=15, class_weight='balanced_subsample', n_jobs=-1, random_state=42)
model.fit(Xtr, ytr)

p = model.predict_proba(Xte)[:, 1]
prec, rec, thr = precision_recall_curve(yte, p)
ok = np.where(rec[:-1] >= 0.90)[0]                       # lowest cut-off that still catches 90% of threats
threshold = float(thr[ok[-1]]) if len(ok) else 0.5
print('Chosen threshold:', round(threshold, 3))
print(classification_report(yte, (p >= threshold).astype(int), target_names=['safe', 'malicious']))
joblib.dump({'model': model, 'threshold': threshold}, 'url_model.joblib')
print('Saved url_model.joblib')
