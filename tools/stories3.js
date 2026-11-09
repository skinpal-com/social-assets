// Story renderer v3: full-frame 9:16 compositions.
// Rules: content between y=250 and y=1590 (IG header above, reply bar below), nothing faded out,
// one message per story, no filler taglines. Devices either fully visible or cut by the frame edge.
// Usage: node stories3.js outDir [ids]
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const [, , outDir, only] = process.argv;
fs.mkdirSync(outDir, { recursive: true });

const A = (f) => 'file://' + path.resolve(__dirname, 'assets', f);
const F = (n) => 'file://' + path.resolve(__dirname, 'node_modules/@fontsource', n);
const LOGO = fs.readFileSync(path.join(__dirname, 'assets/logo.svg'), 'utf8');
const C = { peach: '#FFD6C1', coral: '#E98D73', jade: '#8CB8A1', forest: '#1F4D48', deep: '#163C38', word: '#386560', cream: '#F9F5EE' };

function logo(kind, width, wordColor = C.word) {
  const vb = { full: '0 0 395 271', word: '58 15 278 92', waves: '0 112 395 160' }[kind];
  const [, , w, h] = vb.split(' ').map(Number);
  return LOGO.replace(/<svg[^>]*>/, `<svg width="${width}" height="${Math.round(width * h / w)}" viewBox="${vb}" fill="none" xmlns="http://www.w3.org/2000/svg">`)
    .replace(/fill="#386560" class="word"/g, `fill="${wordColor}"`);
}
function waves(width, height, colors) {
  let p = LOGO.split('\n').filter((l) => l.startsWith('<path') && !l.includes('class="word"'));
  if (colors) p = p.map((l, i) => l.replace(/fill="#[0-9A-F]+"/i, `fill="${colors[i % colors.length]}"`));
  return `<svg width="${width}" height="${height}" viewBox="0 112 395 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${p.join('')}</svg>`;
}
const head = (bg) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Gabarito;font-weight:700;src:url(${F('gabarito/files/gabarito-latin-700-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:800;src:url(${F('gabarito/files/gabarito-latin-800-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:900;src:url(${F('gabarito/files/gabarito-latin-900-normal.woff2')})}
@font-face{font-family:Caveat;font-weight:600;src:url(${F('caveat/files/caveat-latin-600-normal.woff2')})}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;overflow:hidden;background:${bg};font-family:Gabarito;color:${C.forest};position:relative}
.abs{position:absolute}.k{font:700 34px Gabarito;letter-spacing:5px;text-transform:uppercase}
.h{font-family:Gabarito;font-weight:900;line-height:.92;letter-spacing:-2px}
img{display:block}
</style></head><body>`;

// Hand-drawn arrow pointing at the reply bar, like the IG draw tool.
const arrow = (x, y, color, rot = 0) => `<svg class="abs" style="left:${x}px;top:${y}px;transform:rotate(${rot}deg)" width="120" height="170" viewBox="0 0 120 170" fill="none"><path d="M60 8 C 40 50, 78 92, 58 150" stroke="${color}" stroke-width="9" stroke-linecap="round"/><path d="M30 118 L58 154 L88 120" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const hand = (x, y, txt, color, size = 64, rot = -4) => `<div class="abs" style="left:${x}px;top:${y}px;font:600 ${size}px Caveat;color:${color};transform:rotate(${rot}deg);white-space:nowrap">${txt}</div>`;
// IG "classic" text with background, as typed on a phone.
const igText = (lines, bg, ink, size, top) => `<div class="abs" style="left:60px;right:60px;top:${top}px;text-align:center">${lines.map((l) => `<div style="margin:12px 0"><span style="display:inline-block;background:${bg};color:${ink};padding:14px 30px 20px;border-radius:22px;font:700 ${size}px/1.08 -apple-system,Inter,Helvetica,sans-serif">${l}</span></div>`).join('')}</div>`;

const S = {
  // Fri: this or that. Two full halves; the seam is left clear for a native poll sticker.
  'sp-s3': () => ({ bg: C.forest, html: `
    <div class="abs" style="left:0;top:0;width:1080px;height:960px;background:${C.deep}"></div>
    <div class="abs k" style="left:0;right:0;top:290px;text-align:center;color:${C.jade}">This or that</div>
    <div class="abs" style="left:0;right:0;top:440px;text-align:center">
      <div style="font:800 64px Gabarito;color:${C.coral}">A</div>
      <div class="h" style="font-size:190px;color:${C.cream}">Night<br>itch</div></div>
    <div class="abs" style="left:0;top:925px">${waves(1080, 90, [C.deep, C.jade, C.coral, C.cream])}</div>
    <div class="abs" style="left:0;top:1010px;width:1080px;height:910px;background:${C.cream}"></div>
    <div class="abs" style="left:0;right:0;top:1090px;text-align:center">
      <div style="font:800 64px Gabarito;color:${C.coral}">B</div>
      <div class="h" style="font-size:190px;color:${C.forest}">Morning<br>itch</div></div>
    ${hand(360, 1560, 'reply A or B', C.coral, 72, -4)}${arrow(700, 1545, C.coral, 24)}` }),

  // Sat: bingo teaser, the real card peeking up from the bottom.
  'sp-s4': () => ({ bg: C.peach, html: `
    <div class="abs k" style="left:90px;top:300px;color:${C.coral}">Later today on the feed</div>
    <div class="abs h" style="left:84px;top:360px;font-size:250px;color:${C.forest}">TSW<br>Bingo</div>
    <div class="abs" style="left:92px;top:880px;font:700 52px Gabarito;color:${C.forest}">How many squares do you get?</div>
    <img class="abs" src="file://${path.resolve('/home/claude/social-assets/2026-w45-v3/sp-p4.jpg')}" style="left:150px;top:1040px;width:780px;border-radius:36px;transform:rotate(-4deg);box-shadow:0 30px 70px rgba(31,77,72,.28)">` }),

  // Sun: the whole story is a camera viewfinder.
  'sp-s5': () => {
    const c = (l, t, b) => `<div class="abs" style="left:${l}px;top:${t}px;width:150px;height:150px;border:0 solid ${C.cream};${b}"></div>`;
    return { bg: C.forest, html: `
    <div class="abs" style="left:360px;top:250px;width:2px;height:1340px;background:rgba(249,245,238,.18)"></div>
    <div class="abs" style="left:720px;top:250px;width:2px;height:1340px;background:rgba(249,245,238,.18)"></div>
    <div class="abs" style="left:0;top:700px;width:1080px;height:2px;background:rgba(249,245,238,.18)"></div>
    <div class="abs" style="left:0;top:1150px;width:1080px;height:2px;background:rgba(249,245,238,.18)"></div>
    ${c(70, 260, 'border-width:14px 0 0 14px')}${c(860, 260, 'border-width:14px 14px 0 0')}
    ${c(70, 1440, 'border-width:0 0 14px 14px')}${c(860, 1440, 'border-width:0 14px 14px 0')}
    <div class="abs k" style="left:0;right:0;top:340px;text-align:center;color:${C.peach}">Sunday task</div>
    <div class="abs h" style="left:110px;right:110px;top:560px;text-align:center;font-size:140px;color:${C.cream}">Take one photo of your skin.</div>
    <div class="abs" style="left:150px;right:150px;top:1060px;text-align:center;font:700 50px/1.25 Gabarito;color:${C.peach}">Same room, same light, every Sunday. In a month you can see what changed.</div>
    <div class="abs" style="left:465px;top:1290px;width:130px;height:130px;border-radius:50%;border:10px solid ${C.cream};padding:12px"><div style="width:100%;height:100%;border-radius:50%;background:${C.cream}"></div></div>` };
  },

  // Mon: the fact, as big as it gets.
  'sp-s6': () => ({ bg: C.jade, html: `
    <div class="abs k" style="left:90px;top:300px;color:${C.forest}">Monday check-in</div>
    <div class="abs h" style="left:84px;right:60px;top:370px;font-size:170px;color:${C.forest}">How many hours did you <span style="color:${C.cream}">sleep?</span></div>
    <img class="abs" src="${A('yeti-sleep.png')}" style="left:200px;top:990px;width:680px">
    ${hand(150, 1560, 'reply with a number', C.forest, 70, -4)}${arrow(700, 1530, C.forest, 22)}` }),

  // Tue: the offer, with the real app filling the bottom half and cut by the frame.
  'sp-s7': () => ({ bg: C.cream, html: `
    <div class="abs" style="left:90px;top:290px">${logo('word', 220)}</div>
    <div class="abs h" style="left:84px;top:430px;font-size:190px;color:${C.forest}">14 days<br><span style="color:${C.coral}">free.</span></div>
    <div class="abs" style="left:92px;top:820px;font:700 50px Gabarito;color:${C.word}">Then $3.99 a month. Cancel any time.</div>
    <div class="abs" style="left:60px;top:1000px;width:960px;height:590px;background:${C.peach};border-radius:64px;overflow:hidden"><img src="${A('phone-home.png')}" style="margin:60px 0 0 140px;width:680px"></div>
    ${hand(660, 905, 'link in bio', C.coral, 72, -5)}` }),

  // ---- @tswlukas: personal, native IG look, message in the visual centre, drawn reply cue ----
  'lk-s2': () => ({ bg: '#C9B8A6', html: `
    ${igText(['What should my', 'next video', 'be about?'], '#1A1A1A', '#FFFFFF', 96, 640)}
    ${hand(330, 1300, 'tell me here', '#1A1A1A', 76, -5)}${arrow(640, 1390, '#1A1A1A', 10)}` }),
  'lk-s3': () => ({ bg: C.forest, html: `
    ${igText(['In case you missed it:', 'I built an app for TSW.'], '#FFFFFF', '#111111', 72, 280)}
    <img class="abs" src="${A('phone-mood.png')}" style="left:215px;top:560px;width:650px;transform:rotate(3deg)">` }),
  'lk-s4': () => ({ bg: '#2B2B2B', html: `
    ${igText(['What’s been', 'hardest', 'this month?'], C.coral, '#FFFFFF', 104, 600)}
    ` }),
};

(async () => {
  const browser = await chromium.launch();
  for (const id of Object.keys(S)) {
    if (only && !only.split(',').includes(id)) continue;
    const { bg, html } = S[id]();
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    const f = path.join(outDir, id + '.html');
    fs.writeFileSync(f, head(bg) + html + '</body></html>');
    await page.goto('file://' + path.resolve(f));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(outDir, id + '.jpg'), type: 'jpeg', quality: 92 });
    await page.close();
    console.log(id);
  }
  await browser.close();
})();
