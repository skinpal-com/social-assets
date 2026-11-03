// Renders social images from a content JSON file using Playwright.
// Usage: node render.js week1.json out/
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [, , src, outDir] = process.argv;
const items = JSON.parse(fs.readFileSync(src, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

const F = (n) => 'file://' + path.resolve(__dirname, 'node_modules/@fontsource', n);
const C = {
  sage: '#8CB8A1', mint: '#BAD6C7', deep: '#1E5045', coral: '#E98D73',
  peach: '#FFD6C1', cream: '#FFF3EC', ink: '#1E5045', white: '#FFFFFF',
};
// text color per background
const TXT = { sage: C.deep, mint: C.deep, deep: C.cream, coral: C.cream, peach: C.deep, cream: C.deep };
const ACC = { sage: C.deep, mint: C.coral, deep: C.coral, coral: C.deep, peach: C.coral, cream: C.coral };
const ACCTXT = { sage: C.cream, mint: C.cream, deep: C.deep, coral: C.cream, peach: C.cream, cream: C.cream };

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wavePath(x0, y0, len, amp, period, vertical = false) {
  let d = '';
  for (let t = 0; t <= len; t += 4) {
    const o = Math.sin((t / period) * Math.PI * 2) * amp;
    const x = vertical ? x0 + o : x0 + t;
    const y = vertical ? y0 + t : y0 + o;
    d += (t === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
  }
  return d;
}

function logo(bg, scale = 1) {
  const word = bg === 'deep' || bg === 'coral' ? C.cream : C.deep;
  const cols = bg === 'deep' ? [C.peach, C.coral, C.sage] : bg === 'coral' ? [C.peach, C.cream, C.deep] : [C.peach, C.coral, C.deep];
  const w = 170 * scale, sw = 15 * scale, amp = 8 * scale;
  const waves = cols.map((c, i) => `<path d="${wavePath(0, amp + sw / 2 + i * sw * 0.98, w, amp, w / 2)}" stroke="${c}" stroke-width="${sw}" fill="none"/>`).join('');
  return `<div class="logo" style="display:flex;flex-direction:column;align-items:center;gap:${4 * scale}px">
    <div style="font:700 ${50 * scale}px Gabarito;color:${word};letter-spacing:-0.5px;line-height:1">skinpal</div>
    <svg width="${w}" height="${amp * 2 + sw * 3}">${waves}</svg></div>`;
}

function cornerWaves(bg, W, H, where = 'tr') {
  const cols = bg === 'deep' ? [C.coral, C.sage, C.peach] : bg === 'coral' ? [C.deep, C.peach, C.cream] : bg === 'sage' || bg === 'mint' ? [C.deep, C.coral, C.cream] : [C.deep, C.coral, C.sage];
  const sw = where === 'tr' ? 30 : 42, gap = 50;
  let paths = '';
  cols.forEach((c, i) => {
    if (where === 'tr') paths += `<path d="${wavePath(W - 95 + i * 40, -40, 300, 16, 140, true)}" stroke="${c}" stroke-width="${sw}" fill="none"/>`;
    else paths += `<path d="${wavePath(-40, H - 150 + i * gap, W + 80, 22, 220)}" stroke="${c}" stroke-width="${sw}" fill="none"/>`;
  });
  return `<svg style="position:absolute;inset:0" width="${W}" height="${H}">${paths}</svg>`;
}

const head = (W, H, bg) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Gabarito;font-weight:400;src:url(${F('poppins/files/poppins-latin-400-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:500;src:url(${F('poppins/files/poppins-latin-500-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:700;src:url(${F('poppins/files/poppins-latin-700-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:800;src:url(${F('poppins/files/poppins-latin-800-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:500;src:url(${F('gabarito/files/gabarito-latin-500-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:600;src:url(${F('gabarito/files/gabarito-latin-600-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:700;src:url(${F('gabarito/files/gabarito-latin-700-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:800;src:url(${F('gabarito/files/gabarito-latin-800-normal.woff2')})}
@font-face{font-family:Caveat;font-weight:700;src:url(${F('caveat/files/caveat-latin-700-normal.woff2')})}
*{box-sizing:border-box;margin:0;padding:0}
body{width:${W}px;height:${H}px;overflow:hidden;background:${C[bg]};color:${TXT[bg]};font-family:Gabarito;position:relative}
.h{font-weight:800;text-transform:uppercase;line-height:1.0;letter-spacing:-1px}
.wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;text-align:center}
.pill{display:inline-block;padding:14px 34px;border-radius:999px;font-weight:700;text-transform:uppercase;letter-spacing:2px}
</style></head><body>`;

const T = {
  list(d, W, H) {
    const bg = d.bg;
    return cornerWaves(bg, W, H, 'tr') + `<div class="wrap" style="padding:90px 90px 80px;justify-content:space-between">
      ${logo(bg)}
      <div class="h" style="font-size:76px;max-width:800px">${esc(d.headline)}</div>
      <div style="display:flex;flex-direction:column;gap:20px;width:100%">
        ${d.items.map((t) => `<div style="background:${C.cream};color:${C.deep};border-radius:28px;padding:24px 34px;font:600 38px Gabarito;text-align:left">${esc(t)}</div>`).join('')}
      </div>
      <div style="font:700 34px Gabarito">${esc(d.footer)} ↓</div></div>`;
  },
  phone(d, W, H) {
    const rows = [['Itch', 6], ['Burning', 4], ['Sleep', 5], ['Oozing', 2]];
    const card = (lbl, v) => `<div style="background:#fff;border-radius:22px;padding:18px 24px;display:flex;align-items:center;gap:18px">
      <div style="width:150px;text-align:left;font:600 26px Gabarito;color:${C.deep}">${lbl}</div>
      <div style="flex:1;height:14px;border-radius:9px;background:${C.mint};position:relative">
        <div style="position:absolute;left:0;top:0;bottom:0;width:${v * 10}%;border-radius:9px;background:${C.coral}"></div></div>
      <div style="font:700 26px Gabarito;color:${C.deep};width:40px">${v}</div></div>`;
    return `<div class="wrap" style="padding:80px 90px 0">
      <div class="h" style="font-size:66px;max-width:900px">${esc(d.headline)}</div>
      <div style="font:600 36px Gabarito;margin-top:26px">${esc(d.sub)}</div>
      <div style="margin-top:56px;width:560px;height:900px;border-radius:70px;background:${C.deep};padding:22px;box-shadow:0 30px 60px rgba(0,0,0,.18)">
        <div style="width:100%;height:100%;border-radius:52px;background:${C.cream};padding:60px 34px;display:flex;flex-direction:column;gap:18px">
          <div style="font:500 24px Inter;color:${C.deep};opacity:.7">Today’s check-in</div>
          <div style="font:800 54px Gabarito;color:${C.deep};margin-bottom:10px">Day 63</div>
          ${rows.map(([a, b]) => card(a, b)).join('')}
          <div style="background:${C.peach};border-radius:22px;padding:18px 24px;text-align:left;font:500 24px Inter;color:${C.deep}">+ Add photo · + Notes</div>
        </div></div></div>`;
  },
  question(d, W, H) {
    const bg = d.bg;
    return cornerWaves(bg, W, H, 'bottom') + `<div class="wrap" style="padding:90px 90px 260px;justify-content:space-between">
      ${logo(bg)}
      <div>
        <div class="pill" style="background:${ACC[bg]};color:${ACCTXT[bg]};font-size:30px">${esc(d.label)}</div>
        <div class="h" style="font-size:170px;margin-top:30px;color:${ACC[bg]}">${esc(d.word)}</div>
        <div style="font:700 54px Gabarito;line-height:1.2;margin-top:30px;max-width:860px">${esc(d.question)}</div>
      </div>
      <div style="font:600 32px Gabarito">${esc(d.footer)} ↓</div></div>`;
  },
  bingo(d, W, H) {
    const cols = [C.mint, C.peach];
    return `<div class="wrap" style="padding:70px 70px 60px;justify-content:space-between">
      ${logo(d.bg, 0.8)}
      <div class="h" style="font-size:120px;color:${C.coral}">${esc(d.headline)}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;width:100%">
        ${d.cells.map((t, i) => `<div style="background:${cols[(i + Math.floor(i / 4)) % 2]};border-radius:22px;height:205px;display:flex;align-items:center;justify-content:center;padding:14px;font:700 27px/1.2 Gabarito;color:${C.deep}">${esc(t)}</div>`).join('')}
      </div>
      <div style="font:800 40px Gabarito;text-transform:uppercase">${esc(d.footer)}</div></div>`;
  },
  scale(d, W, H) {
    const grad = ['#E8876A', '#EB9478', '#EEA286', '#E8B29A', '#D9BCA6', '#C4C3AE', '#ADC4AD', '#9CC1AA', '#8DBEA6', '#7FB59C'];
    return cornerWaves(d.bg, W, H, 'tr') + `<div class="wrap" style="padding:90px 80px 90px;justify-content:space-between">
      ${logo(d.bg)}
      <div><div class="h" style="font-size:110px">${esc(d.headline)}</div>
      <div style="font:600 48px Gabarito;margin-top:24px">${esc(d.sub)}</div></div>
      <div style="width:100%"><div style="display:flex;gap:12px;justify-content:center">
        ${grad.map((g, i) => `<div style="width:80px;height:80px;border-radius:50%;background:${g};display:flex;align-items:center;justify-content:center;font:800 34px Gabarito;color:${C.cream};border:4px solid ${C.cream}">${i + 1}</div>`).join('')}</div>
        <div style="display:flex;justify-content:space-between;font:600 28px Gabarito;margin-top:20px;padding:0 6px"><span>1 = ${esc(d.lo)}</span><span>10 = ${esc(d.hi)}</span></div></div>
      <div style="font:700 36px Gabarito;max-width:800px">${esc(d.footer)}</div></div>`;
  },
  split(d, W, H) {
    return `<div class="wrap" style="padding:80px 70px 70px;justify-content:space-between">
      ${logo(d.bg)}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;width:100%">
        <div class="h" style="font-size:52px;text-align:left;opacity:.85">${esc(d.left)}</div>
        <div class="h" style="font-size:52px;text-align:left;color:${C.deep}">${esc(d.right)}</div>
        ${d.pairs.map(([a, b]) => `<div style="background:rgba(251,240,231,.22);border-radius:26px;padding:30px;text-align:left;font:600 36px/1.25 Gabarito;display:flex;align-items:center;min-height:200px">${esc(a)}</div>
          <div style="background:${C.cream};color:${C.deep};border-radius:26px;padding:30px;text-align:left;font:700 36px/1.25 Gabarito;display:flex;align-items:center;min-height:200px">${esc(b)}</div>`).join('')}
      </div>
      <div style="font:700 32px Gabarito">Share with someone who only sees the left side</div></div>`;
  },
  offer(d, W, H) {
    const badge = (t) => `<div style="background:#000;color:#fff;border-radius:16px;padding:14px 28px;font:600 28px Gabarito;border:2px solid #555">${t}</div>`;
    return cornerWaves(d.bg, W, H, 'tr') + `<div class="wrap" style="padding:90px 90px 80px;justify-content:space-between">
      ${logo(d.bg)}
      <div><div class="pill" style="background:${C.coral};color:${C.cream};font-size:30px">${esc(d.headline)}</div>
        <div style="display:flex;gap:40px;justify-content:center;align-items:flex-end;margin-top:34px">
          <div><span class="h" style="font-size:120px;color:${C.peach}">${d.monthly}</span><span style="font:600 34px Gabarito"> /month</span></div>
          <div style="font:600 34px Gabarito;padding-bottom:22px">or ${d.yearly}/year</div></div></div>
      <div style="display:flex;flex-direction:column;gap:16px;width:100%;text-align:left">
        ${d.items.map((t) => `<div style="font:500 34px Inter;display:flex;gap:20px;align-items:center"><span style="width:18px;height:18px;border-radius:50%;background:${C.coral};flex:none"></span>${esc(t)}</div>`).join('')}</div>
      <div><div class="h" style="font-size:56px;color:${C.sage}">${esc(d.footer)}</div>
        <div style="display:flex;gap:20px;justify-content:center;margin-top:26px">${badge('App Store')}${badge('Google Play')}</div></div></div>`;
  },
  month(d, W, H) {
    return cornerWaves(d.bg, W, H, 'bottom') + `<div class="wrap" style="padding:110px 90px 260px;justify-content:center;gap:10px">
      <div style="font:800 380px/0.9 Gabarito;color:${C.peach};letter-spacing:-12px">${d.num}</div>
      <div style="font:700 110px Caveat;color:${C.coral};margin-top:-10px">${esc(d.hand)}</div>
      ${d.lines.map((l) => `<div style="font:600 42px Gabarito;margin-top:14px">${esc(l)}</div>`).join('')}</div>`;
  },
  lukas(d, W, H) {
    return cornerWaves(d.bg, W, H, 'bottom') + `<div class="wrap" style="padding:110px 90px 260px;justify-content:center;gap:40px">
      <div style="font:700 92px Caveat;color:${C.coral}">${esc(d.hand)}</div>
      <div class="h" style="font-size:86px">${esc(d.q1)}</div>
      <div class="h" style="font-size:86px">${esc(d.q2)}</div>
      <div style="font:500 40px/1.35 Inter;max-width:820px">${esc(d.body)}</div>
      <div class="pill" style="background:${C.deep};color:${C.cream};font-size:30px;text-transform:none;letter-spacing:0">${esc(d.footer)}</div></div>`;
  },
  listat(d, W, H) {
    return cornerWaves(d.bg, W, H, 'tr') + `<div class="wrap" style="padding:100px 90px 90px;justify-content:space-between;align-items:flex-start;text-align:left">
      ${logo(d.bg, 0.8)}
      <div><div style="font:800 260px/0.9 Gabarito;color:${C.coral};letter-spacing:-10px">${d.stat}</div>
        <div style="font:700 50px Gabarito;margin-top:10px">${esc(d.statlabel)}</div></div>
      <div style="width:120px;height:12px;background:${C.coral};border-radius:6px"></div>
      <div class="h" style="font-size:72px;text-transform:none;letter-spacing:-2px">${esc(d.headline)}</div></div>`;
  },
  liquote(d, W, H) {
    return cornerWaves(d.bg, W, H, 'bottom') + `<div class="wrap" style="padding:100px 90px 260px;justify-content:space-between;align-items:flex-start;text-align:left">
      ${logo(d.bg, 0.8)}
      <div class="h" style="font-size:110px;text-transform:none;letter-spacing:-3px">${esc(d.headline)}</div>
      <div style="font:600 44px/1.3 Gabarito;max-width:860px">${esc(d.sub)}</div></div>`;
  },
  lidef(d, W, H) {
    return cornerWaves(d.bg, W, H, 'tr') + `<div class="wrap" style="padding:100px 90px 90px;justify-content:space-between;align-items:flex-start;text-align:left">
      ${logo(d.bg, 0.8)}
      <div><div style="font:700 34px Gabarito;color:${C.coral};text-transform:uppercase;letter-spacing:2px">${esc(d.kicker)}</div>
      <div class="h" style="font-size:150px;margin-top:20px">${esc(d.headline)}</div></div>
      <div style="font:500 46px/1.35 Inter;max-width:880px">${esc(d.body)}</div>
      <div style="font:600 32px Gabarito;color:${C.sage}">TSW Nordic AB · Skinpal</div></div>`;
  },
  // stories 1080x1920: keep top 250 and bottom 300 clear of key text
  sq(d, W, H) {
    const bg = d.bg;
    return cornerWaves(bg, W, H, 'tr') + `<div class="wrap" style="padding:300px 90px 340px;justify-content:space-between">
      <div class="pill" style="background:${ACC[bg]};color:${ACCTXT[bg]};font-size:34px">${esc(d.label)}</div>
      <div class="h" style="font-size:${d.big.length > 30 ? 104 : 130}px;max-width:900px">${esc(d.big)}</div>
      <div><div style="font:600 42px/1.3 Gabarito;max-width:820px;margin-bottom:60px">${esc(d.footer)}</div>${d.handle ? `<div style="font:700 40px Gabarito">${esc(d.handle)}</div>` : logo(bg)}</div></div>`;
  },
  sthis(d, W, H) {
    const bg = d.bg;
    const box = (k, t, c) => `<div style="background:${c};color:${C.deep};border-radius:40px;padding:60px 40px;width:100%"><div style="font:800 60px Gabarito">${k}</div><div class="h" style="font-size:90px;margin-top:10px">${esc(t)}</div></div>`;
    return cornerWaves(bg, W, H, 'tr') + `<div class="wrap" style="padding:300px 90px 340px;justify-content:space-between">
      <div class="pill" style="background:${C.coral};color:${C.cream};font-size:34px">${esc(d.label)}</div>
      <div style="display:flex;flex-direction:column;gap:40px;width:100%;align-items:center">${box('A', d.a, C.peach)}<div style="font:800 50px Gabarito">or</div>${box('B', d.b, C.mint)}</div>
      <div><div style="font:600 42px Gabarito;margin-bottom:60px">${esc(d.footer)}</div>${logo(bg)}</div></div>`;
  },
};

(async () => {
  const browser = await chromium.launch();
  const only = process.argv[4];
  for (const d of items) {
    if (only && !only.split(',').includes(d.id)) continue;
    const story = d.type === 'story';
    const W = 1080, H = story ? 1920 : 1350;
    const html = head(W, H, d.bg) + T[d.tpl](d, W, H) + '</body></html>';
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    const f = path.join(outDir, d.id + '.html');
    fs.writeFileSync(f, html);
    await page.goto('file://' + path.resolve(f));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(outDir, d.id + '.png') });
    // overflow check
    const over = await page.evaluate(() => [...document.querySelectorAll('.wrap')].some((w) => w.scrollHeight > w.clientHeight + 2));
    console.log(d.id, over ? 'OVERFLOW' : 'ok');
    await page.close();
  }
  await browser.close();
})();
