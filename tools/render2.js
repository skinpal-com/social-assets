// Skinpal social renderer v2 — uses the real logo SVG, real mascots and real app screens from Figma.
// Usage: node render2.js content.json outDir [ids]
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [, , src, outDir, only] = process.argv;
const items = JSON.parse(fs.readFileSync(src, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

const A = (f) => 'file://' + path.resolve(__dirname, 'assets', f);
const F = (n) => 'file://' + path.resolve(__dirname, 'node_modules/@fontsource', n);
const LOGO = fs.readFileSync(path.join(__dirname, 'assets/logo.svg'), 'utf8');

// Brand palette (Figma brand guidelines)
const C = { peach: '#FFD6C1', coral: '#E98D73', jade: '#8CB8A1', forest: '#1F4D48', word: '#386560', cream: '#F9F5EE', ink: '#333333', white: '#FFFFFF' };

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Logo variants from the official SVG: full lockup, wordmark only, waves only.
function logo(kind = 'full', width = 200, wordColor = C.word) {
  const vb = { full: '0 0 395 271', word: '58 15 278 92', waves: '0 112 395 160' }[kind];
  const [, , w, h] = vb.split(' ').map(Number);
  const height = Math.round((width * h) / w);
  return LOGO.replace(/<svg[^>]*>/, `<svg width="${width}" height="${height}" viewBox="${vb}" fill="none" xmlns="http://www.w3.org/2000/svg">`)
    .replace(/fill="#386560" class="word"/g, `fill="${wordColor}"`);
}

// A strip of the brand waves, stretched to any width (the "waves of unevenness").
function waves(width, height, colors) {
  const svg = LOGO.match(/<path d="M28\.9126 143[\s\S]*?\/>/g) || [];
  const paths = LOGO.split('\n').filter((l) => l.startsWith('<path') && !l.includes('class="word"'));
  let p = paths;
  if (colors) p = paths.map((l, i) => l.replace(/fill="#[0-9A-F]+"/i, `fill="${colors[i % colors.length]}"`));
  return `<svg width="${width}" height="${height}" viewBox="0 112 395 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${p.join('')}</svg>`;
}

const head = (W, H, bg) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Gabarito;font-weight:500;src:url(${F('gabarito/files/gabarito-latin-500-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:600;src:url(${F('gabarito/files/gabarito-latin-600-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:700;src:url(${F('gabarito/files/gabarito-latin-700-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:800;src:url(${F('gabarito/files/gabarito-latin-800-normal.woff2')})}
*{box-sizing:border-box;margin:0;padding:0}
body{width:${W}px;height:${H}px;overflow:hidden;background:${bg};font-family:Gabarito;color:${C.forest};position:relative}
.abs{position:absolute}
.h{font-family:Gabarito;font-weight:800;line-height:1.02;letter-spacing:-0.5px}
.up{text-transform:uppercase}
.p{font-family:Inter;font-weight:500;line-height:1.35}
img{display:block}
</style></head><body>`;

// Feed posts are 1080x1350 (4:5). Instagram's profile grid shows a 3:4 centre crop (~1012px wide),
// so key content stays inside x=60..1020. Stories are 1080x1920 with top 250 / bottom 330 kept clear.
const T = {
  // ---------- @skinpal.app feed ----------
  quotes(d) {
    const rot = [-2.5, 1.8, -1.2, 2.4, -1.8];
    const col = [[C.white, C.forest], [C.forest, C.cream], [C.white, C.forest], [C.coral, C.white], [C.white, C.forest]];
    const pos = [[120, 470], [430, 600], [110, 760], [470, 880], [150, 1020]];
    return { bg: C.peach, html: `
      <div class="abs" style="left:0;right:0;top:90px;display:flex;justify-content:center">${logo('word', 190)}</div>
      <div class="abs h up" style="left:90px;right:90px;top:190px;text-align:center;font-size:74px">${esc(d.headline)}</div>
      ${d.items.map((t, i) => `<div class="abs" style="left:${pos[i][0]}px;top:${pos[i][1]}px;transform:rotate(${rot[i]}deg);background:${col[i][0]};color:${col[i][1]};border-radius:44px;padding:26px 38px;font:600 40px Gabarito;box-shadow:0 6px 0 rgba(31,77,72,.12)">“${esc(t)}”</div>`).join('')}
      <div class="abs p" style="left:0;right:0;bottom:70px;text-align:center;font:600 32px Inter;color:${C.forest}">${esc(d.footer)} ↓</div>` };
  },
  phones(d) {
    return { bg: C.jade, html: `
      <div class="abs" style="left:80px;top:70px">${logo('word', 140, C.forest)}</div>
      <div class="abs h" style="left:80px;right:120px;top:150px;font-size:72px;color:${C.forest}">${esc(d.headline)}</div>
      <div class="abs p" style="left:80px;top:405px;font-size:36px;color:${C.cream}">${esc(d.sub)}</div>
      <img class="abs" src="${A('phone-mood.png')}" style="left:80px;top:500px;width:480px;transform:rotate(-4deg)">
      <div class="abs" style="left:520px;top:550px;width:480px;height:900px;border-radius:56px;overflow:hidden;transform:rotate(3deg);box-shadow:0 20px 50px rgba(0,0,0,.18)"><img src="${A('phone-day.png')}" style="width:480px"></div>
` };
  },
  talk(d) {
    return { bg: C.forest, html: `
      <div class="abs" style="left:0;right:0;top:90px;display:flex;justify-content:center">${logo('word', 180, C.cream)}</div>
      <div class="abs" style="left:0;right:0;top:250px;text-align:center"><span style="display:inline-block;border:3px solid ${C.peach};color:${C.peach};border-radius:999px;padding:14px 36px;font:700 32px Gabarito;letter-spacing:3px;text-transform:uppercase">Let’s talk about</span></div>
      <div class="abs h up" style="left:0;right:0;top:340px;text-align:center;font-size:200px;color:${C.coral}">${esc(d.word)}</div>
      <div class="abs" style="left:110px;right:110px;top:570px;text-align:center;font:600 50px/1.2 Gabarito;color:${C.cream}">${esc(d.question)}</div>
      <img class="abs" src="${A('yeti-sleep.png')}" style="left:270px;top:790px;width:540px">
      <div class="abs p" style="left:0;right:0;bottom:60px;text-align:center;font-size:30px;color:${C.jade}">Share in the comments ↓</div>` };
  },
  bingo(d) {
    const fills = [C.peach, C.jade, C.white, C.coral];
    const ink = [C.forest, C.forest, C.forest, C.white];
    return { bg: C.cream, html: `
      <div class="abs" style="left:70px;top:80px">${logo('word', 170)}</div>
      <div class="abs h up" style="left:70px;top:150px;font-size:118px;color:${C.forest}">TSW Bingo</div>
      <div class="abs p" style="right:70px;top:182px;width:300px;text-align:right;font-size:28px;color:${C.word}">Count your squares. Comment your score.</div>
      <div class="abs" style="left:70px;right:70px;top:310px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
        ${d.cells.map((t, i) => { const k = (i * 7 + Math.floor(i / 4)) % 4; return `<div style="background:${fills[k]};color:${ink[k]};border-radius:24px;height:228px;display:flex;align-items:center;justify-content:center;padding:16px;text-align:center;font:700 29px/1.15 Gabarito">${esc(t)}</div>`; }).join('')}
      </div>
      <div class="abs" style="left:0;right:0;bottom:0">${waves(1080, 90)}</div>` };
  },
  scale(d) {
    const g = ['#E98D73', '#EC9A82', '#EFA891', '#F2B6A0', '#F5C4B0', '#D9C8B2', '#BCC4AE', '#A6BFA9', '#8CB8A1', '#76A68E'];
    return { bg: C.cream, html: `
      <div class="abs" style="left:0;right:0;top:90px;display:flex;justify-content:center">${logo('word', 170)}</div>
      <div class="abs h up" style="left:0;right:0;top:200px;text-align:center;font-size:104px">Sunday check-in</div>
      <div class="abs" style="left:0;right:0;top:330px;text-align:center;font:600 48px Gabarito;color:${C.word}">How was your skin this week?</div>
      <img class="abs" src="${A('yeti-wave.png')}" style="left:350px;top:440px;width:380px">
      <div class="abs" style="left:85px;right:85px;top:900px;display:flex;justify-content:space-between">${g.map((c, i) => `<div style="width:80px;height:80px;border-radius:50%;background:${c};display:flex;align-items:center;justify-content:center;font:800 34px Gabarito;color:${i < 5 ? C.white : C.forest}">${i + 1}</div>`).join('')}</div>
      <div class="abs p" style="left:90px;right:90px;top:1000px;display:flex;justify-content:space-between;font-size:26px;color:${C.word}"><span>1 = worst in a while</span><span>10 = best in months</span></div>
      <div class="abs" style="left:0;right:0;top:1110px;text-align:center;font:700 38px Gabarito">Comment a number. No explanation needed.</div>` };
  },
  seesdeal(d) {
    return { bg: C.white, html: `
      <div class="abs" style="left:0;top:0;width:1080px;height:560px;background:${C.peach}"></div>
      <div class="abs" style="left:0;top:560px;width:1080px;height:790px;background:${C.forest}"></div>
      <div class="abs h up" style="left:80px;top:80px;font-size:44px;letter-spacing:2px;color:${C.word}">What people see</div>
      ${d.pairs.map((p, i) => `<div class="abs" style="left:80px;top:${160 + i * 120}px;font:700 64px Gabarito;color:${C.forest}">${esc(p[0])}</div>`).join('')}
      <div class="abs" style="left:0;top:505px">${waves(1080, 110, [C.peach, C.coral, C.jade, C.forest])}</div>
      <div class="abs h up" style="left:80px;top:660px;font-size:44px;letter-spacing:2px;color:${C.jade}">What we deal with</div>
      ${d.pairs.map((p, i) => `<div class="abs" style="left:80px;right:80px;top:${750 + i * 170}px;font:700 58px/1.1 Gabarito;color:${C.cream}">${esc(p[1])}</div>`).join('')}
      <div class="abs" style="right:80px;bottom:60px">${logo('word', 150, C.cream)}</div>` };
  },
  offer(d) {
    return { bg: C.peach, html: `
      <div class="abs" style="left:80px;top:90px">${logo('full', 210)}</div>
      <div class="abs" style="left:80px;top:300px"><span style="background:${C.forest};color:${C.cream};border-radius:999px;padding:12px 28px;font:700 28px Gabarito;letter-spacing:2px">AFTER YOUR FREE TRIAL</span></div>
      <div class="abs h" style="left:80px;top:370px;font-size:150px;color:${C.forest}">$3.99<span style="font:600 42px Gabarito"> /month</span></div>
      <div class="abs" style="left:84px;top:540px;font:600 40px Gabarito;color:${C.word}">or $39.99 a year</div>
      <div class="abs h up" style="left:80px;top:640px;font-size:60px;color:${C.coral}">14 days free</div>
      <div class="abs p" style="left:84px;top:740px;width:470px;font-size:32px;color:${C.forest}">Log symptoms, sleep, stress and food. See your patterns. Bring notes to your doctor.</div>
      <img class="abs" src="${A('phone-insights.png')}" style="left:600px;top:230px;width:440px;transform:rotate(2deg)">
      <img class="abs" src="${A('yeti-thumb.png')}" style="left:70px;top:960px;width:360px">
      <div class="abs" style="left:470px;top:1180px;font:600 30px Inter;color:${C.forest}">iOS & Android · Link in bio</div>` };
  },

  // ---------- @skinpal.app stories (1080x1920) ----------
  s_question(d) {
    return { bg: C.coral, html: `
      <div class="abs" style="left:0;right:0;top:280px;display:flex;justify-content:center">${logo('word', 200, C.white)}</div>
      <div class="abs" style="left:80px;right:80px;top:470px;background:${C.white};border-radius:48px;padding:70px 60px 60px">
        <div style="font:700 30px Gabarito;letter-spacing:3px;color:${C.coral};text-transform:uppercase">${esc(d.label)}</div>
        <div class="h" style="font-size:96px;margin-top:22px">${esc(d.big)}</div>
        <div class="p" style="font-size:34px;margin-top:34px;color:${C.word}">${esc(d.footer)}</div>
      </div>
      <img class="abs" src="${A('yeti-wave.png')}" style="left:330px;top:1130px;width:430px">` };
  },
  s_phone(d) {
    return { bg: C.forest, html: `
      <div class="abs h" style="left:90px;right:90px;top:290px;font-size:120px;color:${C.cream}">${esc(d.big)}</div>
      <img class="abs" src="${A('phone-mood.png')}" style="left:180px;top:560px;width:720px;transform:rotate(-3deg)">
      <div class="abs" style="left:0;right:0;top:1440px;height:480px;background:linear-gradient(transparent,${C.forest} 30%)"></div>
      <div class="abs p" style="left:90px;right:90px;top:1520px;font-size:40px;color:${C.peach}">${esc(d.footer)}</div>` };
  },
  s_this(d) {
    return { bg: C.cream, html: `
      <div class="abs" style="left:0;top:0;width:1080px;height:960px;background:${C.forest}"></div>
      <div class="abs" style="left:0;right:0;top:300px;text-align:center;font:700 32px Gabarito;letter-spacing:4px;color:${C.jade}">THIS OR THAT</div>
      <div class="abs" style="left:0;right:0;top:420px;text-align:center"><div style="font:800 80px Gabarito;color:${C.coral}">A</div><div class="h up" style="font-size:130px;color:${C.cream}">${esc(d.a)}</div></div>
      <div class="abs" style="left:0;top:905px">${waves(1080, 110, [C.forest, C.jade, C.peach, C.cream])}</div>
      <div class="abs" style="left:0;right:0;top:1080px;text-align:center"><div style="font:800 80px Gabarito;color:${C.coral}">B</div><div class="h up" style="font-size:130px;color:${C.forest}">${esc(d.b)}</div></div>
      <div class="abs p" style="left:0;right:0;top:1460px;text-align:center;font-size:38px;color:${C.word}">${esc(d.footer)}</div>` };
  },
  s_teaser(d) {
    const cells = ['Shedding in bed', 'Awake at 3am', 'Cancelled plans', 'Hoodie in July', 'Vacuuming daily', 'Stained sheets'];
    const f = [C.peach, C.jade, C.white, C.coral, C.peach, C.jade];
    return { bg: C.cream, html: `
      <div class="abs" style="left:-60px;top:250px;width:1200px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;transform:rotate(-6deg)">${cells.map((t, i) => `<div style="background:${f[i]};border-radius:28px;height:300px;display:flex;align-items:center;justify-content:center;font:700 40px Gabarito;color:${f[i] === C.coral ? C.white : C.forest};text-align:center;padding:20px">${t}</div>`).join('')}</div>
      <div class="abs" style="left:0;right:0;top:1000px;height:920px;background:${C.cream}"></div>
      <div class="abs" style="left:90px;top:1070px;font:700 32px Gabarito;letter-spacing:4px;color:${C.coral}">TONIGHT, 21:00</div>
      <div class="abs h up" style="left:90px;top:1120px;font-size:150px">${esc(d.big)}</div>
      <div class="abs p" style="left:90px;right:90px;top:1300px;font-size:40px;color:${C.word}">${esc(d.footer)}</div>
      <div class="abs" style="left:90px;top:1460px">${logo('word', 170)}</div>` };
  },
  s_photo(d) {
    const corner = (l, t, r) => `<div class="abs" style="left:${l}px;top:${t}px;width:110px;height:110px;border:${r};"></div>`;
    return { bg: C.peach, html: `
      <div class="abs" style="left:0;right:0;top:290px;text-align:center;font:700 32px Gabarito;letter-spacing:4px;color:${C.coral}">SUNDAY TASK</div>
      ${corner(140, 420, `border-width:12px 0 0 12px;border-style:solid;border-color:${C.forest}`)}
      ${corner(830, 420, `border-width:12px 12px 0 0;border-style:solid;border-color:${C.forest}`)}
      ${corner(140, 1120, `border-width:0 0 12px 12px;border-style:solid;border-color:${C.forest}`)}
      ${corner(830, 1120, `border-width:0 12px 12px 0;border-style:solid;border-color:${C.forest}`)}
      <div class="abs h" style="left:210px;right:210px;top:600px;text-align:center;font-size:96px">${esc(d.big)}</div>
      <div class="abs p" style="left:140px;right:140px;top:1300px;text-align:center;font-size:38px">${esc(d.footer)}</div>
      <div class="abs" style="left:0;right:0;top:1480px;display:flex;justify-content:center">${logo('word', 170)}</div>` };
  },
  s_type(d) {
    return { bg: C.jade, html: `
      <div class="abs h" style="left:90px;right:90px;top:520px;font-size:180px;color:${C.forest}">${esc(d.big)}</div>
      <div class="abs p" style="left:90px;right:90px;top:1150px;font-size:42px;color:${C.cream}">${esc(d.footer)}</div>
      <div class="abs" style="left:0;bottom:200px">${waves(1080, 180)}</div>` };
  },
  s_cta(d) {
    return { bg: C.cream, html: `
      <div class="abs" style="left:0;right:0;top:300px;display:flex;justify-content:center">${logo('full', 360)}</div>
      <div class="abs h up" style="left:0;right:0;top:640px;text-align:center;font-size:150px;color:${C.coral}">${esc(d.big)}</div>
      <img class="abs" src="${A('yeti-handsup.png')}" style="left:240px;top:830px;width:600px">
      <div class="abs p" style="left:90px;right:90px;top:1460px;text-align:center;font-size:42px">${esc(d.footer)}</div>` };
  },

  // ---------- @tswlukas: personal, native-looking ----------
  notes(d) {
    return { bg: '#FBFAF6', html: `
      <div class="abs" style="left:0;right:0;top:0;height:120px;display:flex;align-items:center;justify-content:space-between;padding:0 50px;font:500 34px Inter;color:#C8A22C"><span>‹ Notes</span><span>⋯</span></div>
      <div class="abs" style="left:60px;top:140px;font:500 26px Inter;color:#9A9A9A">5 November 2026 at 21:14</div>
      <div class="abs" style="left:60px;right:60px;top:200px;font:800 92px Inter;color:#111">${esc(d.title)}</div>
      <div class="abs" style="left:60px;right:80px;top:340px;font:400 46px/1.38 Inter;color:#1A1A1A">${d.lines.map((l) => l ? esc(l) : '&nbsp;').join('<br>')}</div>` };
  },
  whybuilt(d) {
    return { bg: '#ECE6DE', html: `
      <div class="abs" style="left:70px;top:90px;font:600 30px Inter;color:#6B6157">Why I built Skinpal</div>
      <div class="abs" style="left:70px;right:470px;top:160px;font:800 76px/1.05 Inter;color:#1A1A1A">${esc(d.q1)}</div>
      <div class="abs" style="left:70px;right:470px;top:420px;font:800 76px/1.05 Inter;color:${C.coral}">${esc(d.q2)}</div>
      <div class="abs" style="left:70px;width:520px;top:720px;font:400 40px/1.35 Inter;color:#2A2A2A">${esc(d.body)}</div>
      <div class="abs" style="left:70px;top:1180px;font:600 32px Inter;color:#1A1A1A">@skinpal.app</div>
      <img class="abs" src="${A('phone-mood.png')}" style="left:620px;top:140px;width:420px;transform:rotate(3deg)">` };
  },
  igtext(d) {
    return { bg: d.bg, html: `
      <div class="abs" style="left:0;right:0;top:640px;text-align:center">${d.lines.map((l) => `<div style="margin:10px 0"><span style="display:inline-block;background:${d.hl};color:${d.ink};padding:10px 26px 14px;border-radius:16px;font:700 76px/1.1 Inter">${esc(l)}</span></div>`).join('')}</div>
      <div class="abs" style="left:0;right:0;top:1180px;text-align:center;font:500 40px Inter;color:${d.hl}">${esc(d.small)}</div>` };
  },
  igapp(d) {
    return { bg: d.bg, html: `
      <div class="abs" style="left:0;right:0;top:300px;text-align:center">${d.lines.map((l) => `<div style="margin:8px 0"><span style="display:inline-block;background:#fff;color:#111;padding:10px 24px 14px;border-radius:16px;font:700 64px/1.1 Inter">${esc(l)}</span></div>`).join('')}</div>
      <img class="abs" src="${A('phone-home.png')}" style="left:230px;top:560px;width:620px;transform:rotate(-2deg)">
      <div class="abs" style="left:0;right:0;top:1180px;height:740px;background:linear-gradient(transparent,${d.bg} 22%)"></div>
      <div class="abs" style="left:0;right:0;top:1500px;text-align:center"><span style="display:inline-block;background:${C.peach};color:#111;padding:10px 24px 14px;border-radius:16px;font:700 44px Inter">${esc(d.small)}</span></div>` };
  },

  // ---------- LinkedIn (1200x1200) ----------
  li_stat(d) {
    return { bg: C.cream, html: `
      <div class="abs" style="left:90px;top:90px">${logo('word', 190)}</div>
      <div class="abs h" style="left:84px;top:300px;font-size:250px;color:${C.coral};letter-spacing:-6px">${esc(d.stat)}</div>
      <div class="abs" style="left:92px;top:570px;font:600 44px Gabarito;color:${C.word}">${esc(d.statlabel)}</div>
      <div class="abs h" style="left:90px;right:90px;top:720px;font-size:84px">${esc(d.headline)}</div>
      <div class="abs" style="left:0;bottom:0">${waves(1200, 120)}</div>` };
  },
  li_phone(d) {
    return { bg: C.jade, html: `
      <div class="abs h" style="left:90px;width:600px;top:120px;font-size:96px;color:${C.forest}">${esc(d.headline)}</div>
      <div class="abs p" style="left:90px;width:560px;top:560px;font-size:40px;color:${C.cream}">${esc(d.sub)}</div>
      <div class="abs" style="left:90px;bottom:110px">${logo('word', 190, C.forest)}</div>
      <div class="abs" style="left:720px;top:110px;width:420px;height:1020px;border-radius:52px;overflow:hidden;transform:rotate(3deg);box-shadow:0 20px 50px rgba(0,0,0,.18)"><img src="${A('phone-day.png')}" style="width:420px"></div>` };
  },
  li_team(d) {
    return { bg: C.forest, html: `
      <div class="abs" style="left:90px;top:100px;font:700 32px Gabarito;letter-spacing:3px;color:${C.jade};text-transform:uppercase">${esc(d.kicker)}</div>
      <div class="abs h" style="left:90px;width:640px;top:170px;font-size:92px;color:${C.cream}">${esc(d.headline)}</div>
      <div class="abs" style="left:90px;top:900px">${logo('word', 220, C.cream)}</div>
      <img class="abs" src="${A('yeti-stand.png')}" style="left:730px;top:400px;width:430px">
      <div class="abs" style="left:0;bottom:0">${waves(1200, 110, [C.peach, C.coral, C.jade, '#163C38'])}</div>` };
  },
};

(async () => {
  const browser = await chromium.launch();
  for (const d of items) {
    if (only && !only.split(',').includes(d.id)) continue;
    const li = d.channel === 'skinpal_li';
    const W = li ? 1200 : 1080, H = li ? 1200 : d.type === 'story' ? 1920 : 1350;
    const { bg, html } = T[d.tpl](d);
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    const f = path.join(outDir, d.id + '.html');
    fs.writeFileSync(f, head(W, H, bg) + html + '</body></html>');
    await page.goto('file://' + path.resolve(f));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(outDir, d.id + '.png') });
    console.log(d.id, W + 'x' + H);
    await page.close();
  }
  await browser.close();
})();
