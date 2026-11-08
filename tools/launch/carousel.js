// Skinpal 2.1 launch carousel, 6 slides 1080x1350. Usage: node carousel.js outDir
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const P = require('./parts');
const { C } = P;
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });

const days = (() => { const d = []; let s = 11; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < 90; i++) { let v = r() < .5 ? 2 : 1; if ((i > 12 && i < 18) || (i > 50 && i < 60)) v = r() < .5 ? 5 : 4; if (i === 31 || i === 40 || i === 12 || i === 60) v = 3; d.push(v); } return d; })();
const SEVC = ['', '#6E9C88', '#B9D6C6', '#FBDCCB', '#E7A08B', C.coral];
const swipe = (col) => `<div class="abs t" style="right:70px;bottom:62px;font-size:26px;font-weight:600;color:${col};display:flex;align-items:center;gap:10px">Swipe <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>`;
const num = (n, col) => `<div class="abs t" style="left:70px;bottom:62px;font-size:24px;font-weight:600;color:${col}">${n}/6</div>`;

const S = {
  1: { bg: C.cream, html: `
    <div class="abs g" style="left:64px;top:160px;font-weight:900;font-size:260px;line-height:1;color:${C.coral}">“</div>
    <div class="abs h" style="left:70px;right:70px;top:380px;font-size:88px;color:${C.forest}">My brain during a flare: remembers every itch at 3am. Forgets all of it at the doctor’s.</div>
    <div class="abs t" style="left:74px;top:1060px;font-size:32px;color:${C.word};line-height:1.45"><b>Lukas</b>, founder of Skinpal<br>Living with TSW since 2022</div>
    ${num(1, C.word)}${swipe(C.forest)}` },
  2: { bg: C.forest, html: `
    <div class="abs h" style="left:70px;top:110px;font-size:82px;color:${C.cream}">Three months of TSW.</div>
    <div class="abs h" style="left:70px;top:205px;font-size:82px;color:${C.peach}">Ten minutes to explain it.</div>
    <div class="abs" style="left:70px;top:470px;width:940px;display:grid;grid-template-columns:repeat(15,1fr);gap:10px">
      ${days.map((v) => `<div style="aspect-ratio:1;border-radius:9px;background:${SEVC[v]}"></div>`).join('')}</div>
    <div class="abs t" style="left:70px;top:1080px;font-size:38px;line-height:1.35;color:${C.cream}">90 days of flares and short nights. Summarise<br>between “hi” and “any questions?” Easy.</div>
    ${num(2, C.jade)}${swipe(C.cream)}` },
  3: { bg: `linear-gradient(180deg,${C.peach} 0%,#FFEFE6 100%)`, html: `
    <div class="abs" style="left:70px;top:96px;background:${C.coral};color:#fff;border-radius:999px;padding:12px 26px" ><span class="k" style="color:#fff">New in Skinpal 2.1</span></div>
    <div class="abs h" style="left:70px;top:190px;font-size:100px;color:${C.forest}">So we built a skin report.</div><div class="abs g" style="left:72px;top:400px;font-weight:700;font-size:40px;color:${C.coral}">Your memory can take the day off.</div>
    <div class="abs t" style="left:72px;top:480px;font-size:36px;line-height:1.35;color:${C.word}">Your last 90 days in one clear PDF,<br>made only from what you logged.</div>
    <div class="abs" style="left:70px;top:620px;transform:rotate(-2deg);transform-origin:left top">${P.reportTop({ w: 1000 })}</div>
    ${num(3, C.word)}${swipe(C.forest)}` },
  4: { bg: `linear-gradient(180deg,${C.forest} 0%,#2F6A61 100%)`, html: `
    <div class="abs h" style="left:70px;top:110px;font-size:96px;color:${C.cream}">Flares and short nights, day by day. In a chart. Very official.</div>
    <div class="abs t" style="left:72px;top:440px;font-size:34px;line-height:1.4;color:${C.peach}">Plus body areas, mood and stress, and what<br>you take or apply.</div>
    <div class="abs" style="left:40px;top:620px">${P.timeline({ w: 1000 })}</div>
    ${num(4, C.jade)}${swipe(C.cream)}` },
  5: { bg: C.cream, html: `
    <div class="abs h" style="left:70px;top:110px;font-size:96px;color:${C.forest}">Up to 12 of your own photos.</div>
    <div class="abs t" style="left:72px;top:360px;font-size:38px;line-height:1.35;color:${C.word}">You choose what goes in. No surprise<br>flare pics. You decide who sees it.</div>
    <div class="abs" style="left:70px;top:540px;transform:rotate(2deg)">${P.photoPicker({ w: 660 })}</div>
    <div class="abs" style="left:560px;top:1060px">${P.shareBtn(1)}</div>
    ${num(5, C.word)}${swipe(C.forest)}` },
  6: { bg: C.forest, html: `
    <div class="abs" style="left:70px;top:100px">${P.logo('word', 260, C.cream)}</div>
    <div class="abs k" style="left:72px;top:250px;color:${C.peach}">New in Skinpal 2.1</div>
    <div class="abs h" style="left:70px;top:310px;font-size:104px;color:${C.cream}">Your last 90 days in one clear report.</div>
    <div class="abs t" style="left:72px;top:690px;font-size:44px;font-weight:700;color:${C.peach}">Free for 14 days.<br>Your memory will thank you.</div>
    <div class="abs t" style="left:72px;top:850px;font-size:30px;color:${C.jadeL}">iPhone and Android · Link in bio</div>
    <img class="abs" src="${P.A('yeti-thumb.png')}" style="right:40px;bottom:120px;width:330px">
    <div class="abs t" style="left:72px;bottom:62px;font-size:24px;color:${C.jadeL}">A summary of what you logged. Not a diagnosis.</div>` },
};

(async () => {
  const b = await chromium.launch();
  for (const [k, s] of Object.entries(S)) {
    const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
    const f = path.join(out, `launch-${k}.html`);
    fs.writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${P.fontCss}body{width:1080px;height:1350px;overflow:hidden;position:relative;background:${s.bg}}</style></head><body>${s.html}</body></html>`);
    await p.goto('file://' + f);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(out, `launch-${k}.jpg`), type: 'jpeg', quality: 92 });
    await p.close();
  }
  await b.close();
  console.log('ok');
})();
