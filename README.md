# TrustShield AI: frontend + backend

```
trustshield/
├── index.html  style.css  script.js     <- the website
└── backend/
    ├── features.py     23 link-text clues (FireEye paper, Table 1)
    ├── train_url.py    trains Layer 1 (Random Forest)
    ├── train_sms.py    trains the scam-text classifier (TF-IDF + Logistic Regression)
    ├── app.py          Flask API + Google Safe Browsing (Layer 2)
    ├── sms_seed.csv    tiny starter dataset (replace with a real one)
    └── requirements.txt
```

## 1. Set up
```bash
cd backend
python -m venv venv && source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Get data and train
**URL model.** Download a labelled URL CSV, for example the Kaggle "Malicious URLs dataset"
(columns `url`, `type`) or the 651,191-link dataset from the 2026 paper.
```bash
python train_url.py --csv malicious_phish.csv --url-col url --label-col type
```
It prints precision and recall, picks a cut-off that catches about 90% of threats, and saves `url_model.joblib`.

**SMS model.** Build `sms_data.csv` with columns `text,label` and labels
`safe, phishing, fake_job, fake_loan, prize`. Sources: UCI SMS Spam Collection (spam text to phishing or prize),
EMSCAD (fake job ads), plus your own collected examples for fake loans.
```bash
python train_sms.py --csv sms_data.csv
```

## 3. Layer 2: Google Safe Browsing (optional )
Create a free API key in Google Cloud (enable "Safe Browsing API"), then:
```bash
export GSB_API_KEY=your_key_here          # Windows: set GSB_API_KEY=your_key_here
```

## 4. Run
```bash
python app.py                              # API on http://127.0.0.1:5000
# check http://127.0.0.1:5000/api/health

# new terminal, from the trustshield folder:
python -m http.server 8000                 # open http://localhost:8000
```
Open `localhost` (not a file path) so the camera works for the QR scanner.
If the API is off, the site falls back to its built-in rules automatically.

## 5. Deploy
Backend: Render, Railway or PythonAnywhere (run `gunicorn app:app`, set `GSB_API_KEY`).
Frontend: GitHub Pages or Netlify. Then change `API_URL` at the bottom of `script.js`
to your deployed backend address.
