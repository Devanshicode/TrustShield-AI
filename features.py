"""23 link-text (lexical) features, following Table 1 of the FireEye paper (Joshi et al., 2019).
No website is opened: everything comes from the URL string itself."""
import re
from urllib.parse import urlparse

SUSPICIOUS_TLDS = {'zip','xyz','top','tk','ml','ga','cf','gq','click','link','icu','buzz','work','rest'}
TOP_DOMAINS = {'google.com','youtube.com','facebook.com','amazon.com','wikipedia.org','twitter.com',
    'instagram.com','linkedin.com','microsoft.com','apple.com','netflix.com','github.com','yahoo.com',
    'flipkart.com','paytm.com','sbi.co.in','hdfcbank.com','icicibank.com'}   # replace with the Tranco top-100 list

def _split(host):
    parts = host.split('.')
    if len(parts) >= 3 and parts[-2] in {'co','com','org','net','gov','ac'} and len(parts[-1]) == 2:
        return '.'.join(parts[-3:]), parts[:-3], parts[-1]
    return '.'.join(parts[-2:]), parts[:-2], parts[-1]

def extract(url):
    u = url.strip()
    p = urlparse(u if '://' in u else 'http://' + u)
    host = (p.hostname or '').lower(); path = p.path or ''; q = p.query or ''
    dom, sub, tld = _split(host)
    letters = sum(c.isalpha() for c in u); digits = sum(c.isdigit() for c in u)
    dirs = [d for d in path.split('/') if d]
    lower = sum(c.islower() for c in path); upper = sum(c.isupper() for c in path)
    return {
        'url_len': len(u),
        'url_special': sum(u.count(c) for c in ';_?=&'),
        'digit_letter_ratio': digits / max(letters, 1),
        'susp_tld': int(tld in SUSPICIOUS_TLDS),
        'has_ip': int(bool(re.fullmatch(r'\d{1,3}(\.\d{1,3}){3}', host))),
        'dom_len': len(dom),
        'dom_digits': sum(c.isdigit() for c in dom),
        'dom_nonalnum': sum(not c.isalnum() for c in dom),
        'dom_hyphens': dom.count('-'),
        'dom_at': p.netloc.count('@'),
        'dom_top': int(dom in TOP_DOMAINS),
        'sub_dots': '.'.join(sub).count('.'),
        'n_sub': len(sub),
        'dbl_slash': path.count('//'),
        'n_dirs': len(dirs),
        'pct20': int('%20' in path),
        'upper_dirs': sum(any(c.isupper() for c in d) for d in dirs),
        'single_dirs': sum(len(d) == 1 for d in dirs),
        'path_special': sum((not c.isalnum()) and c != '/' for c in path),
        'path_zeros': path.count('0'),
        'path_case_ratio': upper / max(lower, 1),
        'param_len': len(q),
        'n_queries': len([x for x in q.split('&') if x]),
    }

FEATURE_NAMES = list(extract('http://a.com').keys())

def explain(url, f):
    r = []
    if not url.lower().startswith('https'): r.append('Not using https')
    if f['url_len'] > 75: r.append(f"Very long link ({f['url_len']} characters)")
    if f['has_ip']: r.append('Uses a raw IP address instead of a website name')
    if f['dom_at']: r.append('Contains an @ sign that can hide the real destination')
    if f['dom_hyphens'] >= 2: r.append(f"{f['dom_hyphens']} hyphens in the domain name")
    if f['n_sub'] >= 2: r.append(f"{f['n_sub']} subdomains before the main domain")
    if f['susp_tld']: r.append('Ends in a top-level domain common in throwaway scam sites')
    if f['url_special'] > 6: r.append('Lots of special characters in the link')
    if f['digit_letter_ratio'] > .3: r.append('Many digits compared with letters')
    return r
