# 🛡️ TrustShield AI

### Your Personal Digital Safety Assistant

**Detect. Verify. Protect.**

TrustShield AI is a digital safety assistant designed to help users identify potentially suspicious **URLs, SMS messages, and QR codes**.

The project combines **Machine Learning, rule-based analysis, and explainable risk assessment** into a single platform. Instead of simply saying whether an input is safe or suspicious, TrustShield provides a **risk score, category, reasons, and a recommended action**.

> ⚠️ **Project Status:** TrustShield AI is currently a prototype/research project developed for academic purposes. Detection results should be treated as an assistance mechanism and not as a guarantee that a website, message, or QR code is completely safe.

---

## 📌 Problem Statement

Digital scams can reach users through different channels.

A user may receive:

* A suspicious phishing URL
* A fake job or loan message
* A prize or phishing SMS
* A QR code that redirects to a malicious website

Existing detection approaches often focus on a particular type of threat, such as URL detection, spam/SMS classification, or QR-based phishing.

TrustShield AI proposes a **single user-facing platform** where different types of potentially fraudulent inputs can be checked through one workflow.

---

## 🎯 Objectives

The main objectives of TrustShield AI are:

1. Detect suspicious URLs using machine-learning and lexical features.
2. Classify SMS messages into different scam-related categories.
3. Decode QR codes and analyze URL-based QR content.
4. Provide a risk score instead of only a binary result.
5. Explain the reasons contributing to the risk assessment.
6. Provide simple recommendations that can be understood by non-technical users.
7. Combine multiple detection approaches into one digital-safety assistant.

---

# 🔍 Main Features

## 1. 🌐 URL Scanner

The URL scanner analyzes a submitted website URL using lexical characteristics such as:

* URL length
* Number of special characters
* Number of dots
* Number of subdomains
* Presence of suspicious words
* HTTPS usage
* IP-address based URLs
* Other URL structure characteristics

The extracted features are processed by a **Random Forest classifier**.

The system then produces a risk assessment with:

* Risk score
* Detection result
* Reasons for suspicious characteristics
* Recommended action

The project also includes an optional **Google Safe Browsing integration**. This layer is only active when a valid API key is configured.

---

## 2. 📱 SMS Scanner

The SMS scanner analyzes the text of a message using:

**TF-IDF + Logistic Regression**

The current classification categories are:

| Category  | Meaning                                            |
| --------- | -------------------------------------------------- |
| Safe      | Normal/non-scam message                            |
| Phishing  | Message attempting to obtain sensitive information |
| Fake Job  | Suspicious job/recruitment message                 |
| Fake Loan | Suspicious loan/financial offer                    |
| Prize     | Prize/reward-related scam                          |

If a message contains a URL, the URL can also be passed through the URL-analysis pipeline.

This allows the system to consider both:

**Message content + URL characteristics**

---

## 3. 📷 QR Scanner

The QR scanner uses **jsQR** to decode QR codes.

The workflow is:

```text
QR Code
   ↓
Decode QR
   ↓
Extract Content
   ↓
If URL is detected
   ↓
Send URL for analysis
   ↓
Generate Risk Assessment
```

This allows a QR code containing a suspicious website link to be analyzed using the URL scanner.

---

# 🧠 Proposed System Architecture

```text
                 User Input
                     │
                     ▼
             Identify Input Type
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
         URL        SMS         QR
          │          │          │
          ▼          ▼          ▼
     URL Features  TF-IDF    QR Decoder
          │          │          │
          ▼          ▼          ▼
    Random Forest  Logistic    Extract
                    Regression   URL
          │          │          │
          │          └─────┬────┘
          │                │
          └────────────────┘
                   │
                   ▼
             Risk Assessment
                   │
                   ▼
       Risk Score + Category + Reasons
                   │
                   ▼
          User Recommendation
```

---

# 🤖 Machine Learning Approach

## URL Detection

The URL detection component uses a **Random Forest classifier**.

The model works with lexical URL features extracted by:

```text
backend/features.py
```

The trained model is stored as:

```text
models/url_model.joblib
```

---

## SMS Classification

The SMS classification component uses:

```text
TF-IDF
   ↓
Logistic Regression
   ↓
Scam Category
```

The trained model is stored as:

```text
models/sms_model.joblib
```

The system supports the following categories:

```text
safe
phishing
fake_job
fake_loan
prize
```

---

# 🛠️ Technology Stack

### Frontend

* HTML
* CSS
* JavaScript
* jsQR

### Backend

* Python
* Flask
* Flask-CORS

### Machine Learning

* Scikit-learn
* Random Forest
* TF-IDF
* Logistic Regression

### Data Processing

* Pandas
* NumPy

### Model Storage

* Joblib

### Security Integration

* Google Safe Browsing API (optional)

### Development

* VS Code
* Git
* GitHub

---

# 📁 Project Structure

```text
Trustshield-AI/
│
├── backend/
│   ├── app.py
│   ├── features.py
│   ├── sms_dataset.csv
│   ├── sms_seed.csv
│   ├── train_sms.py
│   └── train_url.py
│
├── data/
│   └── Project datasets/resources
│
├── docs/
│   └── Project documentation
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── jsQR.min.js
│
├── models/
│   ├── url_model.joblib
│   └── sms_model.joblib
│
├── research_papers/
│   └── Research papers used for literature review
│
├── screenshots/
│   └── Project screenshots
│
├── README.md
└── requirements.txt
```

---

# 🚀 How to Run the Project

## Step 1 — Clone the repository

Clone the project from GitHub:

```bash
git clone https://github.com/Devanshicode/TrustShield-AI.git
```

Move into the project directory:

```bash
cd TrustShield-AI
```

---

## Step 2 — Create a virtual environment

For Windows:

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

---

## Step 3 — Install dependencies

Run:

```bash
pip install -r requirements.txt
```

---

## Step 4 — Start the Flask backend

From the **project root directory**, run:

```bash
python backend\app.py
```

The backend should start at:

```text
http://127.0.0.1:5000
```

You can check the API health endpoint:

```text
http://127.0.0.1:5000/api/health
```

---

## Step 5 — Open the frontend

The frontend can be opened through a local HTTP server.

From the `frontend` directory:

```bash
cd frontend
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Using a local HTTP server is recommended instead of directly opening the HTML file, particularly for browser-based QR/camera functionality.

---

# 🔐 Google Safe Browsing

TrustShield AI includes support for Google Safe Browsing as an optional additional URL verification layer.

The system can work without the API key using its local URL-analysis functionality.

If a Google Safe Browsing API key is configured, the backend can additionally check submitted URLs through the Safe Browsing service.

The API key should **never be uploaded to GitHub**.

For local use, it should be stored as an environment variable:

### Windows

```cmd
set GSB_API_KEY=your_key_here
```

> Do not place the actual API key directly inside the source code or commit it to GitHub.

---

# 📊 Research Focus

The project is supported by a literature review covering research related to:

* Phishing URL detection
* Malicious URL classification
* SMS/spam/phishing detection
* Fake job and loan scams
* QR-code phishing and quishing
* Machine-learning-based cyber threat detection

The research papers are included in:

```text
research_papers/
```

The literature review was used to understand:

* Existing approaches
* Datasets
* Feature engineering methods
* Machine-learning algorithms
* Evaluation techniques
* Existing limitations
* Potential research gaps

---

# 🔬 Research Gap

From the literature review, we observed that many existing approaches concentrate on a particular threat type or input modality.

For example, a study may focus specifically on:

```text
URL → Phishing Detection
```

or:

```text
SMS → Spam/Scam Classification
```

or:

```text
QR Code → Malicious URL Detection
```

TrustShield AI explores a unified workflow:

```text
URL + SMS + QR
       ↓
Common Digital Safety Platform
       ↓
Risk Assessment
       ↓
Reasons + Recommendation
```

The project therefore focuses on **system-level integration and explainable risk assessment**, rather than claiming a completely new machine-learning algorithm.

---

# 🧪 Testing and Evaluation

Testing is an important part of the project.

The system is being evaluated for:

* Correct classification
* False positives
* False negatives
* Precision
* Recall
* F1-score
* Confusion matrix
* Generalization to unseen inputs

During development, false-positive cases were identified in the SMS classifier. These observations highlighted the importance of:

* Larger datasets
* Better class balance
* More representative examples
* Proper train/test separation
* Evaluation using unseen data

Therefore, model performance should not be judged only by predictions on the training data.

---

# 📈 Current Project Status

### Completed

* [x] Project concept and problem definition
* [x] Literature review
* [x] Research gap identification
* [x] URL scanning module
* [x] SMS scanning module
* [x] QR scanning module
* [x] Flask backend
* [x] Web frontend
* [x] Random Forest URL model
* [x] TF-IDF + Logistic Regression SMS model
* [x] Risk scoring and explanation
* [x] Project documentation
* [x] Research paper collection

### Ongoing / Future Work

* [ ] More extensive model evaluation
* [ ] Improve SMS dataset quality and balance
* [ ] Evaluate models on larger unseen test sets
* [ ] Further reduce false positives
* [ ] Complete optional external security API integration
* [ ] Further testing with real-world examples
* [ ] Deployment after validation

---

# 👩‍💻 Academic Project

**Project:** TrustShield AI
**Tagline:** Detect. Verify. Protect.

TrustShield AI is developed as an academic/research project to explore how machine learning and security-oriented analysis can be combined to assist users in identifying potentially fraudulent digital content.

---

## ⚠️ Disclaimer

TrustShield AI is a research prototype and should not be considered a replacement for professional cybersecurity tools or security advice.

A result marked **Safe** does not guarantee that an input is completely harmless, and a suspicious result does not by itself prove that an input is malicious.

Users should avoid sharing passwords, OTPs, banking credentials, or other sensitive information with untrusted websites or messages.

---

## 📚 Project Repository

The complete source code, trained models, documentation, project resources, and research papers are maintained in this repository.

**GitHub:**
https://github.com/Devanshicode/TrustShield-AI
