const P={shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.500 4.500-5"/>',moon:'<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',link:'<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>',
msg:'<path d="M4 5h16v11H9l-5 4z"/>',qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h3M21 17v4"/>',
scan:'<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>',
cam:'<path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="4"/>',img:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
code:'<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',warn:'<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.01"/>'};
const svg=k=>`<svg class="ico" viewBox="0 0 24 24">${P[k]}</svg>`;
document.querySelectorAll('[data-i]').forEach(e=>e.innerHTML=svg(e.dataset.i));
document.body.insertAdjacentHTML('afterbegin','<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#13a3a0"/><stop offset="1" stop-color="#0b4f7a"/></linearGradient><linearGradient id="lh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs></svg>');
const LOGO='<svg viewBox="0 0 64 64" role="img" aria-label="TrustShield AI logo"><path d="M32 3l25 9v17c0 16-10.5 27-25 32C17.5 56 7 45 7 29V12z" fill="url(#lg)"/><path d="M32 8l20 7v14c0 12.5-8 22-20 26-12-4-20-13.5-20-26V15z" fill="url(#lh)"/><path d="M32 3l25 9v17c0 16-10.5 27-25 32" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/><path d="M21 32.5l8.5 8.5L44 24" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="3" r="2.5" fill="#ffc93c"/><circle cx="57" cy="12" r="2" fill="#fff"/><circle cx="7" cy="12" r="2" fill="#fff"/></svg>';
document.querySelectorAll('[data-logo]').forEach(e=>e.innerHTML=LOGO);
const $=id=>document.getElementById(id),esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=m=>{const t=$('toast');t.textContent=m;t.className='show';clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',2200)};
$('theme').onclick=()=>{const r=document.documentElement;r.dataset.theme=getComputedStyle(r).getPropertyValue('--bg').trim()==='#081a2e'?'light':'dark'};

/* ---------- Layer 1 + 2: link scanner ---------- */
const SHORT=['bit.ly','tinyurl.com','t.co','goo.gl','is.gd','cutt.ly','rb.gy','shorturl.at'],TLD=['zip','xyz','top','tk','ml','ga','cf','gq','click','link','icu','buzz','work','rest'],
BRANDS=['paypal','amazon','google','sbi','hdfc','icici','paytm','phonepe','netflix','apple','microsoft','instagram','facebook','flipkart'],
KW=['login','verify','secure','update','account','kyc','bonus','free','claim','reward','password','otp','upi','refund','suspend'],
BAD=['secure-kyc-update.top','testsafebrowsing.appspot.com','free-reward-claim.xyz'];
function urlScan(raw){
 raw=raw.trim();const R=[];let s=0;const add=(p,t)=>{s+=p;R.push(t)};let u;
 try{u=new URL(/^[a-z]+:\/\//i.test(raw)?raw:'http://'+raw)}catch(e){return null}
 const h=u.hostname.toLowerCase(),full=raw,parts=h.split('.');
 if(u.protocol!=='https:')add(10,'Not using https, so the connection is not encrypted');
 if(full.length>75)add(12,`Very long link (${full.length} characters)`);else if(full.length>54)add(6,`Long link (${full.length} characters)`);
 if(/^\d{1,3}(\.\d{1,3}){3}$/.test(h))add(30,'Uses a raw IP address instead of a website name');
 if(full.includes('@'))add(20,'Contains an @ sign, which can hide the real destination');
 const hy=(h.match(/-/g)||[]).length;if(hy>=2)add(10,`${hy} hyphens in the domain name`);
 if(parts.length>=4)add(12,`${parts.length-2} subdomains stacked before the main domain`);
 if(h.includes('xn--'))add(18,'Uses look-alike (punycode) characters');
 if(TLD.includes(parts[parts.length-1]))add(14,`Ends in .${parts[parts.length-1]}, common in throwaway scam sites`);
 if(SHORT.includes(h))add(14,'Shortened link hides where it really goes');
 const kw=KW.filter(k=>full.toLowerCase().includes(k));if(kw.length)add(Math.min(20,kw.length*6),'Pressure words in the link: '+kw.slice(0,4).join(', '));
 const br=BRANDS.find(b=>h.includes(b)&&!new RegExp('(^|\\.)'+b+'\\.(com|in|co\\.in|net|org)$').test(h));if(br)add(25,`Name of "${br}" used on a domain that is not theirs`);
 if((h.replace(/\D/g,'').length/h.length)>.25&&!/^\d/.test(h))add(8,'Many digits in the domain name');
 if((full.match(/[;_?=&%]/g)||[]).length>6)add(6,'Lots of special characters in the link');
 if(/\/\/.+\/\//.test(u.pathname+u.search)||u.pathname.includes('//'))add(6,'Unusual double slash in the path');
 const hit=BAD.some(b=>h===b||h.endsWith('.'+b));if(hit)add(45,'Found on the reputation list of known bad sites');
 s=Math.min(100,s);
 return{score:s,reasons:R,l2:hit?'Known bad':'Not on list',host:h};
}
const lvl=s=>s<25?['Low risk','var(--ok)']:s<55?['Medium risk','var(--warn)']:['High risk','var(--bad)'];
const conf=s=>Math.min(97,Math.round(62+Math.abs(s-40)*.7));

/* ---------- SMS classifier ---------- */
const CL={
'Phishing':[[/\b(kyc|verify|verification|suspended|blocked|deactivat|expire[sd]?|unauthori[sz]ed)\b/i,18,'Threatens your account or asks you to verify it'],[/\b(otp|password|pin|cvv|card number)\b/i,20,'Asks for a secret like OTP, PIN or password'],[/\b(bank|sbi|hdfc|icici|upi|paytm|account)\b/i,8,'Mentions a bank or payment account']],
'Fake job':[[/\b(work from home|part[- ]time|earn|per day|daily income|no experience)\b/i,20,'Promises easy money for little or no experience'],[/\b(registration fee|deposit|security fee|training fee)\b/i,28,'Asks for a fee before you get the job'],[/\b(hiring|vacancy|job offer|hr|recruit)/i,12,'Job offer you did not apply for'],[/whatsapp|telegram/i,10,'Moves the chat to WhatsApp or Telegram']],
'Fake loan':[[/\b(instant loan|pre-?approved|loan (approved|offer)|no cibil|without documents)\b/i,28,'Offers a loan with no checks'],[/\b(processing fee|advance fee|insurance fee)\b/i,28,'Asks for an upfront loan fee'],[/\b(emi|interest|credit limit)\b/i,8,'Loan or credit wording']],
'Prize scam':[[/\b(you (have )?won|lottery|lucky draw|winner|congratulations|jackpot)\b/i,26,'Says you won something you never entered'],[/\b(claim|prize|gift|reward|cashback)\b/i,14,'Pushes you to claim a prize or reward'],[/\b(lakh|crore|₹\s?\d{2,}|rs\.?\s?\d{3,}|\$\d{3,})/i,10,'Mentions a large sum of money']]};
const URG=/\b(urgent|immediately|now|today|within \d+ (hours|hrs|minutes)|last chance|final|act fast)\b/i;
function smsScan(t){
 const sc={},R=[];let any=0;
 for(const c in CL){sc[c]=0;CL[c].forEach(([re,p,why])=>{if(re.test(t)){sc[c]+=p;R.push([c,why])}})}
 const urls=t.match(/((https?:\/\/|www\.)[^\s]+|\b[\w-]+(\.[\w-]+)*\.(top|xyz|click|link|icu|tk|zip)\b[^\s]*|\b(bit\.ly|tinyurl\.com)\/[^\s]+)/gi)||[];let um=0;
 urls.forEach(x=>{const r=urlScan(x.replace(/[.,)]+$/,''));if(r){um=Math.max(um,r.score);if(r.score>=25)R.push(['Link',`Link "${x.slice(0,40)}" looks risky (${r.score}/100)`])}});
 if(urls.length&&!R.some(r=>r[0]==='Link'))R.push(['Link','Contains a link. Check it in the URL tab before opening']);
 const urg=URG.test(t);if(urg)R.push(['Urgency','Rushes you to act right now']);
 const boost=(urg?10:0)+(urls.length?8:0)+um*.25;
 let best='Safe',b=0;for(const c in sc){if(sc[c]>b){b=sc[c];best=c}}
 let score=b?Math.min(100,Math.round(b+boost)):Math.min(30,Math.round(boost));if(b===0&&best==='Safe')best='Safe';
 if(b&&b<15&&score<25)best='Safe';
 for(const c in sc)sc[c]=Math.min(100,Math.round(sc[c]+(sc[c]?boost:0)));
 return{score,category:best,cats:sc,reasons:R.map(r=>r[1]),links:urls.length};
}

/* ---------- rendering ---------- */
let n=0,threats=0;
function show(o){
 const [name,col]=lvl(o.score),cf=o.category==='Safe'&&o.score<25?conf(o.score):conf(o.score);
 n++;if(o.score>=25)threats++;$('s1').textContent=n;$('s2').textContent=threats;
 const cats=o.cats?`<div class="cats">${Object.entries(o.cats).map(([k,v])=>`<div class="cat"><span>${k}</span><i><s style="width:${v}%"></s></i><span>${v}</span></div>`).join('')}</div>`:'';
 const lay=o.l2?`<div class="layers"><div class="layer"><b>Layer 1: link clues</b>${o.score}/100</div><div class="layer"><b>Layer 2: reputation (demo)</b>${o.l2}</div></div>`:'';
 const rs=o.reasons.length?o.reasons.map(r=>`<li>${svg('warn')}<span>${esc(r)}</span></li>`).join(''):`<li>${svg('shield').replace('class="ico"','class="ico" style="color:var(--ok)"')}<span>No warning signs found in the clues we check.</span></li>`;
 const cat=o.category?`<h3>${o.category==='Safe'?'Looks safe':o.category}</h3>`:`<h3>${o.score<25?'Looks safe':'Suspicious link'}</h3>`;
 $('res').style.borderStyle='solid';$('res').style.borderColor=col;$('res').classList.remove('pop','shake');void $('res').offsetWidth;$('res').classList.add(o.score>=55?'shake':'pop');
 $('res').innerHTML=`<div class="top"><div class="ring" style="--c:${col};--p:0"><b>${o.score}</b></div><div><span class="lv" style="--c:${col}">${o.score<25?'😌':o.score<55?'🤔':'🚨'} ${name}</span>${cat}<small>Confidence ${cf}% ${o.src?'· from '+o.src:''}</small></div></div>${lay}${cats}<ul class="why">${rs}</ul>${o.note?`<p style="font-size:13px;color:var(--mute);margin:12px 0 0">${o.note}</p>`:''}`;
 requestAnimationFrame(()=>setTimeout(()=>$('res').querySelector('.ring').style.setProperty('--p',o.score),30));
 const li=document.createElement('li');li.innerHTML=`<i class="dot" style="background:${col}"></i><span></span><small>${name}</small>`;li.children[1].textContent=(o.label||'').slice(0,80);
 const h=$('hist');if(!h.querySelector('.dot'))h.innerHTML='';h.prepend(li);while(h.children.length>6)h.lastChild.remove();
 if(o.score>=55)toast('High risk. Do not open this.')}
function doUrl(v,src){const r=urlScan(v);if(!r)return toast('That does not look like a link');show({...r,l2:r.l2,label:v,src,note:'Only the link text was analysed. The site was never opened.'})}
function doSms(t,src){if(t.trim().length<8)return toast('Paste a longer message');const r=smsScan(t);show({...r,label:t,src,note:r.links?`${r.links} link(s) inside the message were also scanned.`:''})}
function handlePayload(t){if(/^(https?:\/\/|www\.)/i.test(t)||/^[\w-]+(\.[\w-]+)+(\/|$)/.test(t))doUrl(t,'QR code');else doSms(t.length<8?t+' (QR text)':t,'QR code')}

/* ---------- tabs & samples ---------- */
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('on',p.id==='p-'+b.dataset.t))});
const SAMP={u:[['Google','https://www.google.com'],['Fake bank','http://sbi-kyc-update.top/login?verify=1&otp=now'],['IP link','http://192.168.4.77/paytm@refund'],['Shortened','http://bit.ly/3xYzAb']],
m:[['KYC alert','URGENT: Your SBI account will be blocked today. Verify your KYC now: http://sbi-kyc-update.top/login and share OTP'],['Fake job','Hiring! Work from home, earn Rs. 5000 per day. No experience needed. Pay registration fee Rs.500 and join our WhatsApp group.'],['Loan','Pre-approved instant loan of 5 lakh, no CIBIL check. Pay processing fee today to receive money.'],['Prize','Congratulations! You won the lucky draw of Rs. 25 lakh. Claim your prize now: free-reward-claim.xyz'],['Normal','Hi, the meeting is moved to 4 pm tomorrow. See you in the lab.']]};
document.querySelectorAll('.samples').forEach(d=>{const k=d.dataset.for==='u'?'u':'m';SAMP[k].forEach(([l,v])=>{const b=document.createElement('button');b.textContent=l;b.onclick=()=>{$(d.dataset.for).value=v;k==='u'?doUrl(v,'sample'):doSms(v,'sample')};d.appendChild(b)})});
$('bu').onclick=()=>doUrl($('u').value,'URL');$('u').onkeydown = e => {
  if (e.key === 'Enter') doUrl($('u').value, 'URL');
};$('bm').onclick=()=>doSms($('m').value,'SMS');

/* ---------- QR scanner ---------- */
let stream,raf,last;const v=$('video'),cv=$('cv'),cx=cv.getContext('2d',{willReadFrequently:true});
function tick(){if(v.readyState===v.HAVE_ENOUGH_DATA){cv.width=v.videoWidth;cv.height=v.videoHeight;cx.drawImage(v,0,0);const d=cx.getImageData(0,0,cv.width,cv.height),q=jsQR(d.data,d.width,d.height);
 if(q&&q.data&&q.data!==last){last=q.data;handlePayload(q.data);setTimeout(()=>last=null,3500)}}raf=requestAnimationFrame(tick)}
$('qs').onclick=async()=>{try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});v.srcObject=stream;await v.play();$('vid').classList.add('live');$('qs').hidden=true;$('qx').hidden=false;tick()}catch(e){toast('Camera blocked. Use Upload QR or Demo scan.')}};
$('qx').onclick=()=>{cancelAnimationFrame(raf);stream&&stream.getTracks().forEach(t=>t.stop());$('vid').classList.remove('live');$('qs').hidden=false;$('qx').hidden=true};
$('qf').onchange=e=>{const f=e.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{cv.width=im.width;cv.height=im.height;cx.drawImage(im,0,0);const d=cx.getImageData(0,0,cv.width,cv.height),q=jsQR(d.data,d.width,d.height);q?handlePayload(q.data):toast('No QR code found in that image')};im.src=URL.createObjectURL(f)};
let di=0;const DEMO=['https://www.wikipedia.org','http://free-reward-claim.xyz/claim?otp=1','http://203.0.113.9/hdfc-login'];$('qd').onclick=()=>handlePayload(DEMO[di++%3]);

/* ---------- papers ---------- */
const PAPERS=[['EMSCAD Fake Job Ads','2017','Warning-sign approach for scam text (missing details, money talk). Gave us the fake-job clues. Gap: too many false alarms and only one scam type.'],
['Malicious URL Survey','2019','Advice to prefer text-only clues over visiting risky sites, and to stay explainable. Gap: concept drift and black-box models.'],
['Classical vs Quantum ML','2024','Trimmed link-text clue list; classical ML wins. Gap: accuracy fell to about 47% on brand-new phishing links.'],
['FireEye Lexical Model','2019','The 23 link clues used in Layer 1, proven in production at 92% accuracy. Gap: no reputation check, email only.'],
['DT/RF/GB Comparison','2026','Shows phishing recall is weak (about 35%) even when overall accuracy looks high. Our top priority to fix with Layer 2.'],
['Quishing Detection','2025','QR codes can hide bad links, so check them before opening. Gap: only URL-based QR codes, tested in controlled conditions.']];
$('pp').innerHTML=PAPERS.map(p=>`<button class="pp"><b>${p[0]}<em>${p[1]}</em></b><p>${p[2]}</p></button>`).join('');
document.querySelectorAll('.pp').forEach(b=>b.onclick=()=>b.classList.toggle('on'));
/* fun bits */
document.querySelectorAll('.orbit button').forEach(b=>b.onclick=()=>toast(b.dataset.t));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('vis');
 e.target.querySelectorAll('[data-n]').forEach(c=>{const t=+c.dataset.n,s=performance.now();(function f(now){const p=Math.min(1,(now-s)/1200);c.textContent=Math.round(t*(1-Math.pow(1-p,3)))+(c.dataset.s||'');p<1&&requestAnimationFrame(f)})(s)});io.unobserve(e.target)}),{threshold:.15});
document.querySelectorAll('.rv').forEach((e,i)=>{e.style.setProperty('--d',(i%6)*.08+'s');io.observe(e)});
const Q=[['📱 "Your parcel is held. Pay ₹49 at india-post-fee.top to release it."',1,'A fee on a .top site is a fake delivery scam.'],['🏫 "Lab test moved to 3 pm tomorrow. - Prof. Rao"',0,'No link and no ask, just normal information.'],['💸 "Earn ₹5000/day from home! Pay ₹500 registration fee."',1,'Paying a fee before a job is a fake job.'],['🔐 "Never share your OTP with anyone. - HDFC Bank"',0,'Real banks warn you. They never ask for it.'],['🎁 "You won a lucky draw! Claim now: free-reward-claim.xyz"',1,'You cannot win what you never entered.']];
let qi=0,qs=0;
function qshow(){if(qi>=Q.length){$('gq').textContent='🏆 Score: '+qs+'/'+Q.length;$('gf').textContent=qs>=4?'Scam radar: expert 🕵️':'Keep practising 💪';$('gb').innerHTML='<button class="btn" id="gr">Play again</button>';$('gr').onclick=()=>{qi=qs=0;qshow()};return}
 $('gq').textContent=Q[qi][0];$('gf').textContent='Question '+(qi+1)+' of '+Q.length;$('gb').innerHTML='<button class="btn" data-a="1">🚨 Scam</button><button class="btn alt" data-a="0">✅ Safe</button>';
 $('gb').querySelectorAll('button').forEach(b=>b.onclick=()=>{const ok=+b.dataset.a===Q[qi][1];if(ok)qs++;$('gf').textContent=(ok?'🎉 Correct! ':'😅 Not quite. ')+Q[qi][2];$('gb').innerHTML='<button class="btn" id="gn">Next</button>';$('gn').onclick=()=>{qi++;qshow()}})}
qshow();

/* ==========================================================
   BACKEND CONNECTION (optional)
   Start the Flask server (see README), then set API_URL.
   If the server is offline, the built-in rules above are used.
   ========================================================== */
const API_URL='http://127.0.0.1:5000';
const localUrl=doUrl,localSms=doSms;
async function callApi(path,body){
 const r=await fetch(API_URL+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 if(!r.ok)throw new Error('API '+r.status);return r.json();
}
doUrl=async function(v,src){
 try{const d=await callApi('/api/scan/url',{url:v});
  show({score:d.score,reasons:d.reasons,l2:d.layer2,label:v,src:src||'URL',note:'Scored by the trained Random Forest and Safe Browsing on the server. The site was never opened.'});
 }catch(e){toast('Backend offline. Using built-in rules.');localUrl(v,src)}
};
doSms=async function(t,src){
 if(t.trim().length<8)return toast('Paste a longer message');
 try{const d=await callApi('/api/scan/sms',{text:t});
  show({score:d.score,category:d.category,cats:d.cats,reasons:d.reasons,label:t,src:src||'SMS',note:d.links?d.links+' link(s) inside the message were also scanned.':''});
 }catch(e){toast('Backend offline. Using built-in rules.');localSms(t,src)}
};
