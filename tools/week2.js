// Week 2 (Nov 9-15): launch stories, Skinpal stories + feed posts, @tswlukas posts + stories.
// Tone: warm banter (Lukas: "a bit Ryan Reynolds, loving but cheeky"). No medical advice, no clock times.
// Usage: node week2.js outDir [ids]
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const P = require('./launch/parts');
const [, , outDir, only] = process.argv;
fs.mkdirSync(outDir, { recursive: true });
const C = { ...P.C, deep: '#163C38' };
const A = P.A;
const F = (n) => 'file://' + path.resolve(__dirname, 'node_modules/@fontsource', n);
const LOGO = fs.readFileSync(path.join(__dirname, 'assets/logo.svg'), 'utf8');
function waves(width, height, colors) {
  let p = LOGO.split('\n').filter((l) => l.startsWith('<path') && !l.includes('class="word"'));
  if (colors) p = p.map((l, i) => l.replace(/fill="#[0-9A-F]+"/i, `fill="${colors[i % colors.length]}"`));
  return `<svg width="${width}" height="${height}" viewBox="0 112 395 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${p.join('')}</svg>`;
}
const extraCss = `@font-face{font-family:Caveat;font-weight:600;src:url(${F('caveat/files/caveat-latin-600-normal.woff2')})}`;
const arrow = (x, y, color, rot = 0) => `<svg class="abs" style="left:${x}px;top:${y}px;transform:rotate(${rot}deg)" width="120" height="170" viewBox="0 0 120 170" fill="none"><path d="M60 8 C 40 50, 78 92, 58 150" stroke="${color}" stroke-width="9" stroke-linecap="round"/><path d="M30 118 L58 154 L88 120" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const hand = (x, y, txt, color, size = 64, rot = -4) => `<div class="abs" style="left:${x}px;top:${y}px;font:600 ${size}px Caveat;color:${color};transform:rotate(${rot}deg);white-space:nowrap">${txt}</div>`;
const igText = (lines, bg, ink, size, top) => `<div class="abs" style="left:60px;right:60px;top:${top}px;text-align:center">${lines.map((l) => `<div style="margin:12px 0"><span style="display:inline-block;background:${bg};color:${ink};padding:14px 30px 20px;border-radius:22px;font:700 ${size}px/1.08 -apple-system,Inter,Helvetica,sans-serif">${l}</span></div>`).join('')}</div>`;
const H = 1920, FEED = 1350;

const S = {
  // ---------- Launch story sequence (posted manually by Lukas: poll + link stickers) ----------
  'launch-s1': { h: H, bg: C.peach, html: `
    <div class="abs k" style="left:90px;top:300px;color:${C.coral}">Be honest</div>
    <div class="abs h" style="left:84px;right:70px;top:370px;font-size:132px;color:${C.forest}">Do you feel heard at your skin appointments?</div>` },
  'launch-s2': { h: H, bg: C.forest, html: `
    <div class="abs h" style="left:84px;top:300px;font-size:150px;color:${C.cream}">Same.</div>
    <div class="abs h" style="left:84px;top:460px;font-size:96px;color:${C.peach}">So we built something.</div>
    <div class="abs" style="left:50px;top:760px;transform:rotate(-3deg)">${P.reportTop({ w: 980 })}</div>
    <div class="abs t" style="left:90px;top:1420px;font-size:38px;color:${C.jadeL}">The skin report. New in Skinpal 2.1.</div>` },
  'launch-s4': { h: H, bg: C.cream, html: `
    <div class="abs" style="left:90px;top:290px">${P.logo('word', 230)}</div>
    <div class="abs h" style="left:84px;right:70px;top:430px;font-size:140px;color:${C.forest}">Your last 90 days. One report.</div>
    <div class="abs t" style="left:90px;top:1010px;font-size:46px;line-height:1.35;color:${C.word}">Already have Skinpal? Update the app.<br>New here? Free for 14 days.</div>` },

  // ---------- Skinpal stories, week 2 ----------
  'w2-sp-s11': { h: H, bg: C.forest, html: `
    <div class="abs k" style="left:90px;top:300px;color:${C.peach}">Skinpal 2.1 is out</div>
    <div class="abs h" style="left:84px;right:70px;top:370px;font-size:150px;color:${C.cream}">Update the app.</div>
    <div class="abs t" style="left:90px;top:720px;font-size:46px;line-height:1.35;color:${C.peach}">Then go to Profile and make your<br>first skin report. Show-off.</div>
    <div class="abs" style="left:60px;top:960px;transform:rotate(-3deg)">${P.reportTop({ w: 960 })}</div>` },
  'w2-sp-s12': { h: H, bg: C.forest, html: `
    <div class="abs" style="left:0;top:0;width:1080px;height:960px;background:${C.deep}"></div>
    <div class="abs k" style="left:0;right:0;top:290px;text-align:center;color:${C.jade}">Worst 3am sound</div>
    <div class="abs" style="left:0;right:0;top:450px;text-align:center"><div style="font:800 64px Gabarito;color:${C.coral}">A</div>
      <div class="h" style="font-size:170px;color:${C.cream}">Scratching</div></div>
    <div class="abs" style="left:0;top:925px">${waves(1080, 90, [C.deep, C.jade, C.coral, C.cream])}</div>
    <div class="abs" style="left:0;top:1010px;width:1080px;height:910px;background:${C.cream}"></div>
    <div class="abs" style="left:0;right:0;top:1090px;text-align:center"><div style="font:800 64px Gabarito;color:${C.coral}">B</div>
      <div class="h" style="font-size:150px;color:${C.forest}">The vacuum.<br>Again.</div></div>
    ${hand(380, 1560, 'reply A or B', C.coral, 72, -4)}${arrow(720, 1545, C.coral, 24)}` },
  'w2-sp-s13': { h: H, bg: C.jade, html: `
    <div class="abs k" style="left:90px;top:300px;color:${C.forest}">Asking for everyone in month one</div>
    <div class="abs h" style="left:84px;right:70px;top:400px;font-size:142px;color:${C.forest}">What was the first sign things were turning?</div>
    <img class="abs" src="${A('yeti-wave.png')}" style="left:600px;top:1050px;width:400px">
    ${hand(110, 1500, 'tell us below', C.forest, 76, -4)}${arrow(500, 1520, C.forest, 18)}` },
  'w2-sp-s14': { h: H, bg: C.peach, html: `
    <div class="abs k" style="left:90px;top:300px;color:${C.coral}">Later today on the feed</div>
    <div class="abs h" style="left:84px;right:70px;top:370px;font-size:132px;color:${C.forest}">5 things to write down before your next skin appointment.</div>
    <div class="abs t" style="left:90px;top:1130px;font-size:46px;line-height:1.35;color:${C.word}">Save it. Your future self, mid-appointment,<br>mind suddenly blank, says thanks.</div>` },

  // ---------- Skinpal feed, week 2 ----------
  'w2-sp-p13': { h: FEED, bg: C.forest, html: `
    <div class="abs k" style="left:70px;top:110px;color:${C.peach}">Parents of TSW kids</div>
    <div class="abs h" style="left:70px;right:70px;top:180px;font-size:104px;color:${C.cream}">What do you wish someone had told you in month one?</div>
    <div class="abs t" style="left:72px;top:730px;font-size:38px;line-height:1.4;color:${C.jadeL}">Another parent is in month one tonight.<br>Your answer might be the one they need.</div>
    <img class="abs" src="${A('yeti-wave.png')}" style="right:60px;bottom:40px;width:360px">
    <div class="abs t" style="left:72px;bottom:70px;font-size:28px;color:${C.jadeL}">Comments below. We read all of them.</div>` },
  'w2-sp-p15': { h: FEED, bg: C.cream, html: `
    <div class="abs k" style="left:70px;top:110px;color:${C.coral}">Sunday check-in</div>
    <div class="abs h" style="left:70px;right:70px;top:180px;font-size:110px;color:${C.forest}">Rate your skin week, 1 to 10.</div>
    <div class="abs" style="left:70px;top:560px;width:940px;display:grid;grid-template-columns:repeat(10,1fr);gap:10px">
      ${[...Array(10)].map((_, i) => `<div style="aspect-ratio:.8;border-radius:16px;background:${['#E98D73', '#EC9A82', '#F0AC97', '#F6C3B1', '#FBDCCB', '#DDE9E1', '#C3DCCD', '#A9CCB8', '#8CB8A1', '#6E9C88'][i]};display:flex;align-items:center;justify-content:center;font:800 44px Gabarito;color:${C.forest}">${i + 1}</div>`).join('')}</div>
    <div class="abs t" style="left:72px;top:720px;width:940px;display:flex;justify-content:space-between;font-size:28px;color:${C.word}"><span>“Don’t ask.”</span><span>“Who even am I?”</span></div>
    <div class="abs t" style="left:72px;top:880px;font-size:38px;line-height:1.4;color:${C.word}">One number in the comments. Essays welcome.<br>No judgement either way.</div>
    <img class="abs" src="${A('yeti-thumb.png')}" style="right:60px;bottom:30px;width:300px">` },
  // Save-worthy carousel: 5 things to write down (what to note, never what to do)
  'w2-sp-p14-1': { h: FEED, bg: C.peach, html: `
    <div class="abs k" style="left:70px;top:110px;color:${C.coral}">Save this one</div>
    <div class="abs h" style="left:70px;right:70px;top:180px;font-size:118px;color:${C.forest}">5 things to write down before a skin appointment.</div>
    <div class="abs t" style="left:72px;top:880px;font-size:40px;line-height:1.4;color:${C.word}">Because your brain deletes everything<br>the second you sit down. Every time.</div>
    <div class="abs t" style="right:70px;bottom:62px;font-size:26px;font-weight:600;color:${C.forest}">Swipe →</div>` },
};
const items = [
  ['When it started, and what changed since last time.', 'Dates beat “a while ago”. “A while ago” could mean anything.'],
  ['Your worst nights.', 'How many, how short. Counting sheep counts. Counting hours counts more.'],
  ['Where it flares.', 'Draw it, list it, or point at the body map. Interpretive dance is optional.'],
  ['What you take or apply, and since when.', 'All of it, even the stuff you think is “nothing”.'],
  ['Your top 3 questions.', 'Write them down. They will vanish at the door otherwise. Science.'],
];
items.forEach(([t, s], i) => {
  S[`w2-sp-p14-${i + 2}`] = { h: FEED, bg: i % 2 ? C.cream : C.forest, html: `
    <div class="abs g" style="left:66px;top:90px;font-weight:900;font-size:300px;line-height:1;color:${i % 2 ? C.coral : C.peach}">${i + 1}</div>
    <div class="abs h" style="left:70px;right:70px;top:470px;font-size:96px;color:${i % 2 ? C.forest : C.cream}">${t}</div>
    <div class="abs t" style="left:72px;right:90px;top:790px;font-size:40px;line-height:1.4;color:${i % 2 ? C.word : C.jadeL}">${s}</div>
    <div class="abs t" style="left:70px;bottom:62px;font-size:24px;font-weight:600;color:${i % 2 ? C.word : C.jade}">${i + 2}/7</div>` };
});
S['w2-sp-p14-7'] = { h: FEED, bg: `linear-gradient(180deg,${C.peach},#FFF0E7)`, html: `
  <div class="abs h" style="left:70px;right:70px;top:110px;font-size:96px;color:${C.forest}">Or let Skinpal write it for you.</div>
  <div class="abs t" style="left:72px;top:360px;font-size:38px;line-height:1.4;color:${C.word}">The skin report turns your logs into your<br>last 90 days on one PDF. New in 2.1.</div>
  <div class="abs" style="left:70px;top:540px;transform:rotate(-2deg)">${P.reportTop({ w: 980 })}</div>
  <div class="abs t" style="left:72px;bottom:62px;font-size:24px;color:${C.word}">A summary of what you logged. Not a diagnosis. Free for 14 days, link in bio.</div>` };

// ---------- @tswlukas ----------
S['w2-lk-p1'] = { h: FEED, bg: '#000', html: `<img class="abs" src="${A('lukas-table.jpg')}" style="left:0;top:-230px;width:1080px">` };
S['w2-lk-p2'] = { h: FEED, bg: '#C9B8A6', html: `
  ${igText(['Things I’ve been told', 'to try for TSW:'], '#1A1A1A', '#FFFFFF', 72, 90)}
  <div class="abs" style="left:110px;right:80px;top:420px;font:700 50px/1.75 -apple-system,Inter,Helvetica,sans-serif;color:#1A1A1A">
    “Have you tried coconut oil?”<br>“Just stop scratching.”<br>“Drink more water.”<br>“My cousin’s friend had a cream.”<br>“Have you tried… not stressing?”</div>
  ${hand(110, 1150, 'add yours below. weirdest one wins', '#1A1A1A', 60, -3)}` };
S['w2-lk-s1'] = { h: H, bg: C.forest, html: `
  ${igText(['Made a thing.'], '#FFFFFF', '#111111', 96, 300)}
  <div class="abs" style="left:50px;top:560px;transform:rotate(3deg)">${P.reportTop({ w: 980 })}</div>
  ${igText(['What should I add to it?'], C.peach, '#111111', 72, 1250)}
  ${hand(350, 1450, 'tell me', '#FFFFFF', 76, -5)}${arrow(600, 1480, '#FFFFFF', 14)}` };
S['w2-lk-s2'] = { h: H, bg: '#2B2B2B', html: `
  ${igText(['Describe your week', 'in one emoji.', 'Go.'], C.coral, '#FFFFFF', 100, 620)}
  ${hand(330, 1310, 'I’ll start: melting face', '#FFFFFF', 76, -4)}${arrow(640, 1400, '#FFFFFF', 14)}` };
S['w2-lk-s3'] = { h: H, bg: '#C9B8A6', html: `
  ${igText(['Sunday question:', 'one small win', 'this week?'], '#1A1A1A', '#FFFFFF', 100, 600)}
  ${hand(220, 1310, 'tiny counts. tiny is great.', '#1A1A1A', 70, -4)}${arrow(700, 1400, '#1A1A1A', 14)}` };

(async () => {
  const b = await chromium.launch();
  for (const [id, s] of Object.entries(S)) {
    if (only && !only.split(',').includes(id)) continue;
    const p = await b.newPage({ viewport: { width: 1080, height: s.h } });
    const f = path.join(outDir, id + '.html');
    fs.writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${P.fontCss}${extraCss}body{width:1080px;height:${s.h}px;overflow:hidden;position:relative;background:${s.bg}}</style></head><body>${s.html}</body></html>`);
    await p.goto('file://' + f);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(outDir, id + '.jpg'), type: 'jpeg', quality: 92 });
    await p.close();
  }
  await b.close();
  console.log('ok');
})();
