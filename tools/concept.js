// Doctor-report concept as a 4-frame Instagram story set, in Skinpal brand style.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const out = process.argv[2] || 'out-concept';
fs.mkdirSync(out, { recursive: true });
const A = (f) => 'file://' + path.resolve(__dirname, 'assets', f);
const F = (n) => 'file://' + path.resolve(__dirname, 'node_modules/@fontsource', n);
const LOGO = fs.readFileSync(path.join(__dirname, 'assets/logo.svg'), 'utf8');
const C = { peach: '#FFD6C1', coral: '#E98D73', jade: '#8CB8A1', forest: '#1F4D48', word: '#386560', cream: '#F9F5EE', white: '#FFFFFF', light: '#FFF1E9' };

function logo(kind = 'full', width = 200, wordColor = C.word) {
  const vb = { full: '0 0 395 271', word: '58 15 278 92', waves: '0 112 395 160' }[kind];
  const [, , w, h] = vb.split(' ').map(Number);
  return LOGO.replace(/<svg[^>]*>/, `<svg width="${width}" height="${Math.round((width * h) / w)}" viewBox="${vb}" fill="none" xmlns="http://www.w3.org/2000/svg">`).replace(/fill="#386560" class="word"/g, `fill="${wordColor}"`);
}
function waves(width, height) {
  const p = LOGO.split('\n').filter((l) => l.startsWith('<path') && !l.includes('class="word"'));
  return `<svg width="${width}" height="${height}" viewBox="0 112 395 160" preserveAspectRatio="none">${p.join('')}</svg>`;
}
const head = (bg) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Gabarito;font-weight:600;src:url(${F('gabarito/files/gabarito-latin-600-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:700;src:url(${F('gabarito/files/gabarito-latin-700-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:800;src:url(${F('gabarito/files/gabarito-latin-800-normal.woff2')})}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;overflow:hidden;background:${bg};font-family:Gabarito;color:${C.forest};position:relative}
.abs{position:absolute}.h{font-weight:800;line-height:1.02;letter-spacing:-0.5px}
.p{font-family:Inter;font-weight:500}
.pill{display:inline-block;background:${C.white};color:${C.coral};border-radius:999px;padding:10px 24px;font:700 24px Gabarito;letter-spacing:2px}
.card{background:${C.white};border-radius:36px;box-shadow:0 18px 50px rgba(31,77,72,.10)}
.lbl{font:700 22px Gabarito;letter-spacing:2px;color:${C.word};text-transform:uppercase}
.row{display:flex;justify-content:space-between;font:500 26px Inter;padding:12px 0;border-bottom:1px solid #EFE6DE}
.row b{font-family:Gabarito;font-weight:800}
img{display:block}
</style></head><body>`;
const disclaimer = `<div class="abs p" style="left:80px;right:80px;top:1610px;font-size:24px;color:${C.word};opacity:.8">Concept for discussion. Example data, not a real person. Not a medical assessment.</div>`;
const top = (dark) => `<div class="abs" style="left:80px;top:250px">${logo('word', 170, dark ? C.cream : C.word)}</div><div class="abs" style="right:80px;top:258px"><span class="pill">CONCEPT · EXAMPLE DATA</span></div>`;

// Simple body outline in the app's thin-line style.
function body(x, y, s, label, dots) {
  const fig = `<svg class="abs" style="left:${x}px;top:${y}px" width="${200 * s}" height="${470 * s}" viewBox="0 0 200 470" fill="none" stroke="${C.forest}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="100" cy="38" rx="26" ry="31"/>
    <path d="M88 68 L86 84 Q60 88 46 100 Q36 112 34 150 L26 240 Q24 262 30 270 M112 68 L114 84 Q140 88 154 100 Q164 112 166 150 L174 240 Q176 262 170 270"/>
    <path d="M52 140 Q58 200 58 232 Q54 250 60 262 L66 444 Q68 458 84 458 L92 300 Q100 290 108 300 L116 458 Q132 458 134 444 L140 262 Q146 250 142 232 Q142 200 148 140"/>
  </svg><div class="abs p" style="left:${x}px;width:${200 * s}px;top:${y + 470 * s + 8}px;text-align:center;font-size:20px;color:${C.word}">${label}</div>`;
  const dot = dots.map(([dx, dy, v]) => { const c = v >= 6 ? C.coral : v >= 4 ? '#F2B49F' : C.jade; return `<div class="abs" style="left:${x + dx * s - 24}px;top:${y + dy * s - 24}px;width:48px;height:48px;border-radius:50%;background:${c};display:flex;align-items:center;justify-content:center;font:800 17px Gabarito;color:${C.white}">${v}</div>`; }).join('');
  return fig + dot;
}

// Deterministic 90-day timeline: more flare days in Aug–Sep, fewer in Oct–Nov.
function timeline() {
  let seed = 7; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const cells = [];
  for (let i = 0; i < 90; i++) { const pFlare = i < 57 ? 0.58 : 0.25; const x = r(); cells.push(x < 0.2 ? '#EEE7E1' : x < 0.2 + pFlare * 0.8 ? C.coral : '#C9DDD2'); }
  return `<div style="display:grid;grid-template-columns:repeat(18,1fr);gap:6px">${cells.map((c) => `<div style="height:30px;border-radius:7px;background:${c}"></div>`).join('')}</div>`;
}

const S = [];
// 1. Intro
S.push({ bg: C.peach, html: `${top()}
  <div class="abs lbl" style="left:80px;top:470px;color:${C.coral}">A concept we’re building</div>
  <div class="abs h" style="left:80px;right:80px;top:520px;font-size:118px">Your log, as one page your doctor can read.</div>
  <div class="abs p" style="left:80px;right:120px;top:940px;font-size:40px;line-height:1.35;color:${C.word}">Where it flares, how bad it gets and how it looked over time. All from what you already log.</div>
  <div class="abs p" style="left:80px;top:1130px;font-size:36px;font-weight:700;color:${C.forest}">Tap for an example →</div>
  <img class="abs" src="${A('yeti-thumb.png')}" style="right:70px;top:1050px;width:330px">
  <div class="abs" style="left:0;top:1340px">${waves(1080, 170)}</div>
  <div class="abs" style="left:0;top:1500px;width:1080px;height:420px;background:${C.forest}"></div>
  <div class="abs p" style="left:80px;right:80px;top:1550px;font-size:24px;color:${C.cream}">Concept for discussion. Example data, not a real person. Not a medical assessment.</div>` });

// 2. Summary page
const bars = [['Aug', 6.4, C.coral], ['Sep', 6.9, C.coral], ['Oct', 5.2, C.jade], ['Nov*', 4.4, C.jade]];
S.push({ bg: C.light, html: `${top()}
  <div class="abs h" style="left:80px;right:80px;top:340px;font-size:72px">Built from the entries you already log.</div>
  <div class="abs card" style="left:60px;right:60px;top:530px;height:1050px;padding:50px 50px">
    <div class="h" style="font-size:46px">Skin log summary</div>
    <div class="p" style="font-size:22px;color:${C.word};margin-top:6px">5 Aug – 3 Nov 2026 · 90 days · entries made by the user</div>
    <div style="height:3px;background:${C.coral};margin:22px 0 26px"></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
      ${[['71', 'days logged of 90'], ['38', 'flare days'], ['5.9 h', 'average sleep'], ['6.1', 'average itch, 0–10']].map(([a, b]) => `<div style="background:${C.light};border-radius:20px;padding:20px 18px"><div class="h" style="font-size:46px">${a}</div><div class="p" style="font-size:19px;color:${C.word};margin-top:6px">${b}</div></div>`).join('')}
    </div>
    <div class="lbl" style="margin:34px 0 16px">Average severity per month</div>
    <div style="display:flex;gap:16px;align-items:flex-end;height:150px">${bars.map(([m, v, c]) => `<div style="flex:1;height:${(v / 7) * 140}px;background:${c};border-radius:14px 14px 4px 4px"></div>`).join('')}</div>
    <div style="display:flex;gap:16px;margin-top:8px">${bars.map(([m, v]) => `<div class="p" style="flex:1;text-align:center;font-size:21px;color:${C.word}">${m} ${v}</div>`).join('')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:30px">
      <div><div class="lbl" style="margin-bottom:6px">Areas logged most</div>${[['Hands', '52 days'], ['Neck', '44 days'], ['Lower legs', '31 days']].map(([a, b]) => `<div class="row"><span>${a}</span><b>${b}</b></div>`).join('')}</div>
      <div><div class="lbl" style="margin-bottom:6px">Also logged</div>${[['Nights under 6 h', '29'], ['High-stress days', '22'], ['Flare + poor sleep', '19']].map(([a, b]) => `<div class="row"><span>${a}</span><b>${b}</b></div>`).join('')}</div>
    </div>
    <div class="lbl" style="margin:30px 0 10px">The user’s own notes</div>
    ${['Woke up three times, itch worst around 3 am.', 'Cancelled dinner again. Hands too sore to hold a pen.', 'A better day. Slept through.'].map((n) => `<div class="p" style="font-size:24px;font-style:italic;color:${C.forest};margin:6px 0">“${n}”</div>`).join('')}
  </div>${disclaimer}` });

// 3. Body map + timeline
const front = [[100, 38, 4.1], [100, 78, 6.8], [42, 150, 6.2], [158, 150, 6.2], [30, 262, 7.4], [170, 262, 7.4], [76, 380, 5.9], [124, 380, 5.9]];
const back = [[100, 130, 3.5], [74, 300, 5.1], [126, 300, 5.1]];
S.push({ bg: C.light, html: `${top()}
  <div class="abs h" style="left:80px;right:80px;top:340px;font-size:72px">Where, how bad, and how it changed.</div>
  <div class="abs card" style="left:60px;right:60px;top:530px;height:1050px;padding:46px 50px">
    <div class="lbl">Body map · average severity 0–10</div>
  </div>
  ${body(140, 640, 0.92, 'Front', front)}
  ${body(360, 640, 0.92, 'Back', back)}
  <div class="abs" style="left:620px;right:110px;top:650px">
    ${[['Hands', '7.4'], ['Neck', '6.8'], ['Inner elbows', '6.2'], ['Lower legs', '5.9'], ['Back of knees', '5.1'], ['Face', '4.1'], ['Upper back', '3.5']].map(([a, b]) => `<div class="row" style="font-size:24px"><span>${a}</span><b>${b}</b></div>`).join('')}
  </div>
  <div class="abs" style="left:110px;right:110px;top:1140px">
    <div class="lbl" style="margin-bottom:14px">Daily timeline · 90 days</div>
    ${timeline()}
    <div class="p" style="display:flex;gap:28px;font-size:20px;color:${C.word};margin-top:12px"><span>■ <span style="color:${C.coral}">flare</span></span><span style="color:#8FB9A3">■ logged</span><span style="color:#CFC6BE">■ no entry</span></div>
    <div class="lbl" style="margin:28px 0 12px">Photos added by the user</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${['12 Aug · hands', '9 Sep · hands', '14 Oct · neck', '2 Nov · hands'].map((t) => `<div><div style="height:96px;border-radius:16px;background:linear-gradient(135deg,#F6D3C4,#EDBBA6)"></div><div class="p" style="font-size:18px;color:${C.word};margin-top:6px;text-align:center">${t}</div></div>`).join('')}</div>
  </div>${disclaimer}` });

// 4. Question
S.push({ bg: C.forest, html: `${top(true)}
  <div class="abs lbl" style="left:80px;top:440px;color:${C.peach}">Your opinion</div>
  <div class="abs h" style="left:80px;right:80px;top:490px;font-size:130px;color:${C.cream}">Would you use this?</div>
  <div class="abs" style="left:80px;right:80px;top:800px;display:flex;flex-direction:column;gap:22px">
    ${['What would you want on it?', 'What would you leave off?', 'Who would you show it to?'].map((q, i) => `<div style="background:${C.cream};border-radius:28px;padding:30px 36px;font:700 44px Gabarito;color:${C.forest}"><span style="color:${C.coral}">${i + 1}.</span> ${q}</div>`).join('')}
  </div>
  <div class="abs p" style="left:80px;right:420px;top:1290px;font-size:38px;line-height:1.3;color:${C.peach}">Reply to this story. We read every answer.</div>
  <img class="abs" src="${A('yeti-handsup.png')}" style="right:60px;top:1230px;width:360px">
  <div class="abs p" style="left:80px;right:80px;top:1640px;font-size:22px;color:${C.jade}">Concept for discussion. Example data, not a real person. Not a medical assessment.</div>` });

(async () => {
  const b = await chromium.launch();
  for (let i = 0; i < S.length; i++) {
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
    const f = path.join(out, `concept-${i + 1}.html`);
    fs.writeFileSync(f, head(S[i].bg) + S[i].html + '</body></html>');
    await p.goto('file://' + path.resolve(f));
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(out, `concept-${i + 1}.png`) });
    await p.close();
  }
  await b.close();
})();
