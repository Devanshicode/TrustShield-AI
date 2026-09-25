"""TrustShield AI backend.  Run:  python app.py   ->  http://127.0.0.1:5000"""
import os, re, joblib, requests
from urllib.parse import urlparse
from flask import Flask, request, jsonify
from flask_cors import CORS
from features import extract, explain, FEATURE_NAMES, TOP_DOMAINS

app = Flask(__name__); CORS(app)
def load(p): return joblib.load(p) if os.path.exists(p) else None
URL_BUNDLE, SMS_MODEL = load('models/url_model.joblib'), load('models/sms_model.joblib')
NAMES = {'phishing': 'Phishing', 'fake_job': 'Fake job', 'fake_loan': 'Fake loan', 'prize': 'Prize scam', 'safe': 'Safe'}
URL_RE = re.compile(r'(https?://\S+|www\.\S+|\b[\w-]+(?:\.[\w-]+)+/\S*)', re.I)

def safe_browsing(url):
    """Layer 2: Google Safe Browsing. Returns True (bad), False (clean) or None (no API key)."""
    key = os.getenv('GSB_API_KEY')
    if not key: return None
    body = {'client': {'clientId': 'trustshield', 'clientVersion': '1.0'},
            'threatInfo': {'threatTypes': ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
                           'platformTypes': ['ANY_PLATFORM'], 'threatEntryTypes': ['URL'], 'threatEntries': [{'url': url}]}}
    try:
        r = requests.post('https://safebrowsing.googleapis.com/v4/threatMatches:find', params={'key': key}, json=body, timeout=5)
        return bool(r.json().get('matches'))
    except Exception:
        return None

def is_known_good_domain(url):
    """Return True when the registered domain is in our known legitimate-domain list."""
    try:
        p = urlparse(url if '://' in url else 'http://' + url)
        host = (p.hostname or '').lower()

        for domain in TOP_DOMAINS:
            if host == domain or host.endswith('.' + domain):
                return True

        return False
    except Exception:
        return False


def scan_url(url):
    f = extract(url)

    p = float(
        URL_BUNDLE['model'].predict_proba(
            [[f[k] for k in FEATURE_NAMES]]
        )[0][1]
    )

    score = int(round(p * 100))

    if p >= URL_BUNDLE['threshold']:
        score = max(score, 60)

    reasons = explain(url, f)

    # Known legitimate domains should not receive a medium-risk
    # score from the ML model just because of statistical uncertainty.
    if is_known_good_domain(url):
        if url.lower().startswith('https://'):
            score = min(score, 5)
        else:
            score = min(score, 15)

    # Layer 2: Google Safe Browsing
    g = safe_browsing(url)

    # Safe Browsing always overrides the local/model result.
    if g:
        score = 100
        reasons.insert(0, 'Google Safe Browsing lists this link as dangerous')

    layer2 = (
        'Known bad (Safe Browsing)'
        if g
        else 'Clean'
        if g is False
        else 'Not configured'
    )

    return {
        'score': min(score, 100),
        'reasons': reasons,
        'layer2': layer2,
        'ml_probability': round(p, 3)
    }

@app.get('/api/health')
def health(): return {'url_model': URL_BUNDLE is not None, 'sms_model': SMS_MODEL is not None, 'safe_browsing': bool(os.getenv('GSB_API_KEY'))}

@app.post('/api/scan/url')
def api_url():
    if URL_BUNDLE is None: return jsonify(error='Train the URL model first: python train_url.py'), 503
    url = (request.get_json(silent=True) or {}).get('url', '').strip()
    if not url: return jsonify(error='url is required'), 400
    return jsonify(scan_url(url))

@app.post('/api/scan/sms')
def api_sms():
    if SMS_MODEL is None: return jsonify(error='Train the SMS model first: python train_sms.py'), 503
    text = (request.get_json(silent=True) or {}).get('text', '').strip()
    if not text: return jsonify(error='text is required'), 400
    proba = SMS_MODEL.predict_proba([text])[0]; classes = list(SMS_MODEL.classes_)
    cats = {NAMES.get(c, c): int(round(p * 100)) for c, p in zip(classes, proba) if c != 'safe'}
    best = classes[proba.argmax()]
    score = int(round((1 - proba[classes.index('safe')]) * 100)) if 'safe' in classes else int(proba.max() * 100)
    reasons = []
    if best != 'safe':                                   # explain with the words that pushed the decision
        vec, clf = SMS_MODEL.named_steps['tfidf'], SMS_MODEL.named_steps['clf']
        c = vec.transform([text]).multiply(clf.coef_[classes.index(best)]).toarray()[0]
        words = [vec.get_feature_names_out()[j] for j in c.argsort()[::-1][:4] if c[j] > 0]
        if words: reasons.append(f"Words typical of {NAMES.get(best, best).lower()} messages: " + ', '.join(words))
    links = URL_RE.findall(text)
    if links and URL_BUNDLE is not None:
        worst = max((scan_url(l.rstrip('.,)')) for l in links), key=lambda r: r['score'])
        if worst['score'] >= 25: reasons.append(f"A link in the message looks risky ({worst['score']}/100)")
        score = max(score, int(worst['score'] * 0.6))
    if best == 'safe' and score >= 25: best = max(cats, key=cats.get, default='Phishing')
    return jsonify({'category': NAMES.get(best, best) if best != 'safe' else 'Safe', 'score': score, 'cats': cats, 'reasons': reasons, 'links': len(links)})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
