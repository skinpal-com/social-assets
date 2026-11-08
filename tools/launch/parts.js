// Shared building blocks for the Skinpal 2.1 skin-report launch (carousel + reels).
// The report mock mirrors the real in-app report (sections "At a glance", "Course day by day")
// and uses made-up example data only.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const F = (n) => 'file://' + path.join(ROOT, 'node_modules/@fontsource', n);
const A = (f) => 'file://' + path.join(ROOT, 'assets', f);
const LOGO = fs.readFileSync(path.join(ROOT, 'assets/logo.svg'), 'utf8');
const C = { peach: '#FFD6C1', peachL: '#FFE9DD', coral: '#E98D73', jade: '#8CB8A1', jadeL: '#B9D6C6', forest: '#1F4D48', word: '#386560', cream: '#F9F5EE', ink: '#2E3B39', grey: '#8C9693' };

function logo(kind, width, wordColor = C.word) {
  const vb = { full: '0 0 395 271', word: '58 15 278 92', waves: '0 112 395 160' }[kind];
  const [, , w, h] = vb.split(' ').map(Number);
  return LOGO.replace(/<svg[^>]*>/, `<svg width="${width}" height="${Math.round(width * h / w)}" viewBox="${vb}" fill="none" xmlns="http://www.w3.org/2000/svg">`)
    .replace(/fill="#386560" class="word"/g, `fill="${wordColor}"`);
}

const fontCss = `
@font-face{font-family:Gabarito;font-weight:600;src:url(${F('gabarito/files/gabarito-latin-600-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:700;src:url(${F('gabarito/files/gabarito-latin-700-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:800;src:url(${F('gabarito/files/gabarito-latin-800-normal.woff2')})}
@font-face{font-family:Gabarito;font-weight:900;src:url(${F('gabarito/files/gabarito-latin-900-normal.woff2')})}
*{box-sizing:border-box;margin:0;padding:0}
.abs{position:absolute}
.g{font-family:Gabarito}
.t{font-family:Inter,-apple-system,Helvetica,sans-serif}
.k{font:700 30px Gabarito;letter-spacing:4px;text-transform:uppercase}
.h{font-family:Gabarito;font-weight:900;line-height:.98;letter-spacing:-1.5px}
img{display:block}`;

// 90 days of example data: 0 not logged, 1 noticeable, 2 mild, 3 moderate, 4 severe, 5 extreme
function days() {
  const d = [];
  let s = 7;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < 90; i++) {
    let v = rnd() < 0.08 ? 0 : (rnd() < 0.5 ? 2 : 1);
    if (i >= 14 && i <= 17) v = 5;
    if (i === 13 || i === 18) v = 3;
    if (i >= 52 && i <= 60) v = [5, 5, 4, 5, 4, 4, 4, 5, 5][i - 52];
    if (i === 51 || i === 61) v = 3;
    if (i === 30 || i === 41) v = 3;
    d.push(v);
  }
  return d;
}
const SEV = ['transparent', '#7FA894', C.jadeL, '#FBDCCB', '#E7A08B', C.coral];
const sleepShort = (i) => (i >= 14 && i <= 17) || (i >= 52 && i <= 61) || i === 3 || i === 5 || i === 21 || i === 27;

// Report page header + disclaimer + "At a glance". `anim` adds count-up spans with data-to.
function reportTop({ w = 900, count = false } = {}) {
  const stat = (n, label) => `<div style="flex:1;background:#FFF1EA;border-radius:18px;padding:26px 24px">
    <div class="g" style="font-weight:800;font-size:58px;color:${C.forest}">${count ? `<span class="cnt" data-to="${n}">0</span>` : n}</div>
    <div class="t" style="font-size:22px;color:${C.ink};margin-top:6px;line-height:1.3">${label}</div></div>`;
  return `<div class="report" style="width:${w}px;background:#fff;border-radius:34px;padding:46px 46px 40px;box-shadow:0 30px 80px rgba(31,77,72,.18)">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>${logo('word', 150)}<div class="g" style="font-weight:700;font-size:38px;color:${C.forest};margin-top:10px">Skin log summary, 90 days</div></div>
      <div class="t" style="font-size:19px;color:${C.ink};line-height:1.7;text-align:right">Patient: Anna E.<br>Period: Aug 1 – Oct 29<br>Days logged: 84</div>
    </div>
    <div style="height:3px;background:${C.jade};margin:24px 0 22px"></div>
    <div class="t" style="background:#F6F3EE;border-radius:12px;padding:16px 20px;font-size:19px;color:${C.ink};line-height:1.45">Everything below is counted from what the patient recorded in the Skinpal app. No assessment, diagnosis or recommendation.</div>
    <div class="g" style="font-weight:700;font-size:30px;color:${C.forest};margin:30px 0 16px"><span style="color:${C.jade};margin-right:14px">1</span>At a glance</div>
    <div style="display:flex;gap:16px">${stat(14, 'days rated severe or extreme')}${stat(72, 'days with itching logged')}${stat(30, 'nights under 6 h sleep')}</div>
  </div>`;
}

// "Course day by day" card. With `grow`, bars carry class .bar for animation.
function timeline({ w = 900, grow = false } = {}) {
  const d = days();
  const bw = (w - 92 - 170) / 90;
  const bars = d.map((v, i) => {
    const h = v === 0 ? 4 : [0, 34, 40, 62, 92, 104][v];
    return `<div class="${grow ? 'bar' : ''}" style="position:absolute;left:${i * bw}px;bottom:0;width:${bw - 2}px;height:${h}px;background:${v === 0 ? '#D9D4CC' : SEV[v]};border-radius:2px;${grow ? `--d:${i}` : ''}"></div>`;
  }).join('');
  const sleep = d.map((v, i) => sleepShort(i) ? `<div class="${grow ? 'sl' : ''}" style="position:absolute;left:${i * bw}px;top:0;width:${bw - 2}px;height:22px;background:#9AA39F;border-radius:2px;${grow ? `--d:${i}` : ''}"></div>` : '').join('');
  const legend = [['Noticeable', SEV[1]], ['Mild', SEV[2]], ['Moderate', SEV[3]], ['Severe', SEV[4]], ['Extreme', SEV[5]]]
    .map(([l, c]) => `<span style="display:inline-flex;align-items:center;margin-right:22px"><span style="width:18px;height:18px;border-radius:4px;background:${c};margin-right:8px"></span>${l}</span>`).join('');
  return `<div style="width:${w}px;background:#fff;border-radius:34px;padding:42px 46px 38px;box-shadow:0 30px 80px rgba(0,0,0,.18)">
    <div class="g" style="font-weight:700;font-size:34px;color:${C.forest};margin-bottom:26px"><span style="color:${C.jade};margin-right:14px">2</span>Course day by day</div>
    <div style="display:flex;align-items:flex-end">
      <div class="t" style="width:170px;font-size:18px;color:${C.ink};line-height:1.3;padding-right:14px"><b>Highest severity</b><br>of any symptom</div>
      <div style="position:relative;flex:1;height:110px;border-bottom:2px solid #E6E1D9">${bars}</div>
    </div>
    <div style="display:flex;align-items:center;margin-top:14px">
      <div class="t" style="width:170px;font-size:18px;color:${C.ink};font-weight:700">Sleep under 6 h</div>
      <div style="position:relative;flex:1;height:22px">${sleep}</div>
    </div>
    <div class="t" style="display:flex;margin:14px 0 0 170px;font-size:17px;color:${C.grey};justify-content:space-between;padding-right:20px"><span>Aug 1</span><span>Aug 31</span><span>Sep 30</span><span>Oct 29</span></div>
    <div class="t" style="margin-top:22px;font-size:18px;color:${C.ink}">${legend}</div>
    <div class="t" style="margin-top:20px;font-size:20px;color:${C.ink}">2 periods of 2 or more severe or extreme days in a row. Longest: 9 days (Sep 22 – Sep 30).</div>
  </div>`;
}

// Photo picker: up to 12 own photos. Tiles are abstract (no real photos).
function photoPicker({ w = 760, picked = [0, 2, 3, 5, 7, 8] } = {}) {
  const tones = ['#EBC3AD', '#E4B49B', '#F0CDB9', '#DDAA92', '#E9BBA3', '#F2D3C2', '#E1B39C', '#EAC1AB', '#DFAF97', '#F1CFBD', '#E6B8A0', '#EDC6B1'];
  const tile = (i) => `<div style="position:relative;aspect-ratio:1;border-radius:16px;background:linear-gradient(140deg,${tones[i]},#C98F77);overflow:hidden">
      <svg class="abs" style="left:50%;top:50%;transform:translate(-50%,-50%);opacity:.45" width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/></svg>
      ${picked.includes(i) ? `<div class="pick" style="position:absolute;right:10px;top:10px;width:40px;height:40px;border-radius:50%;background:${C.forest};border:3px solid #fff;display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg></div>` : ''}
    </div>`;
  return `<div style="width:${w}px;background:#fff;border-radius:34px;padding:36px;box-shadow:0 30px 80px rgba(31,77,72,.18)">
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:24px">
      <div class="g" style="font-weight:700;font-size:34px;color:${C.forest}">Add photos</div>
      <div class="t" style="font-size:22px;color:${C.grey}"><span class="pc">${picked.length}</span> of 12</div></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${tones.map((_, i) => tile(i)).join('')}</div>
  </div>`;
}

const shareBtn = (scale = 1) => `<div style="display:inline-flex;align-items:center;gap:16px;background:${C.forest};color:#fff;border-radius:999px;padding:${22 * scale}px ${40 * scale}px;font:700 ${36 * scale}px Inter,sans-serif;box-shadow:0 14px 34px rgba(31,77,72,.3)">
  <svg width="${34 * scale}" height="${34 * scale}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>Share report</div>`;

module.exports = { C, logo, fontCss, reportTop, timeline, photoPicker, shareBtn, A, ROOT };
