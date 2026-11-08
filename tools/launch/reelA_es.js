// Animated product reel: Skinpal 2.1 skin report. 1080x1920, 30 fps, frame-stepped CSS animations.
// Usage: node reelA.js outDir
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const P = require('./parts_es');
const { C } = P;
const out = process.argv[2];
const frames = path.join(out, 'framesA_es');
fs.mkdirSync(frames, { recursive: true });
const DUR = 16.5, FPS = 30;

const sq = (() => { const d = []; let s = 11; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < 90; i++) { let v = r() < .5 ? 2 : 1; if ((i > 12 && i < 18) || (i > 50 && i < 60)) v = r() < .5 ? 5 : 4; if (i === 31 || i === 40 || i === 12 || i === 60) v = 3; d.push(v); } return d; })();
const SEVC = ['', '#6E9C88', '#B9D6C6', '#FBDCCB', '#E7A08B', C.coral];

const words = (txt, start, cls = '') => txt.split(' ').map((w, i) => `<span class="w ${cls}" style="animation-delay:${(start + i * 0.12).toFixed(2)}s">${w}</span>`).join(' ');

const css = `${P.fontCss}
body{width:1080px;height:1920px;overflow:hidden;position:relative;background:${C.peach}}
.scene{position:absolute;inset:0;overflow:hidden;animation:wipe .55s cubic-bezier(.7,0,.2,1) both}
@keyframes wipe{from{transform:translateY(100%)}to{transform:none}}
.w{display:inline-block;animation:wup .5s cubic-bezier(.2,.9,.3,1.2) both}
@keyframes wup{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
.pop{animation:pop .5s cubic-bezier(.2,.9,.3,1.3) both}
@keyframes pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
.up{animation:up .8s cubic-bezier(.2,.8,.2,1) both}
@keyframes up{from{opacity:0;transform:translateY(500px) rotate(4deg)}to{opacity:1;transform:rotate(-2deg)}}
.sq{border-radius:12px;animation:pop .25s ease-out both}
.blur{animation:blur 1.2s ease-in both}
@keyframes blur{from{filter:blur(0)}to{filter:blur(14px);opacity:.55}}
.bar{transform-origin:bottom;animation:grow .35s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(9.25s + var(--d) * 0.018s)}
.sl{animation:pop .3s ease-out both;animation-delay:calc(9.4s + var(--d) * 0.018s)}
@keyframes grow{from{transform:scaleY(0)}to{transform:none}}
.tap{animation:tap .7s ease-out both}
@keyframes tap{0%{opacity:0;transform:scale(.2)}30%{opacity:.5}100%{opacity:0;transform:scale(2.2)}}
.press{animation:press .3s ease-in-out both}
@keyframes press{50%{transform:scale(.93)}}
.sheet{animation:sheet .55s cubic-bezier(.2,.8,.2,1) both}
@keyframes sheet{from{transform:translateY(110%)}to{transform:none}}
.fade{animation:fade .5s ease both}
@keyframes fade{from{opacity:0}to{opacity:1}}`;

const app = (label, bg, glyph) => `<div style="text-align:center;width:150px"><div style="width:120px;height:120px;margin:0 auto;border-radius:30px;background:${bg};display:flex;align-items:center;justify-content:center">${glyph}</div><div class="t" style="font-size:26px;color:#333;margin-top:12px">${label}</div></div>`;
const glyph = (d) => `<svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<!-- 1: the question -->
<div class="scene" style="background:${C.peach};animation:none">
  <div class="abs h" style="left:80px;right:80px;top:640px;font-size:150px;color:${C.forest}">${words('¿Cómo ha estado desde la última vez?', 0.2)}</div>
  <div class="abs t fade" style="left:84px;top:1250px;font-size:44px;color:${C.word};animation-delay:1.4s">Y tu mente se queda en blanco.</div>
</div>
<!-- 2: the blur -->
<div class="scene" style="background:${C.forest};animation-delay:2.6s">
  <div class="abs blur" style="left:80px;top:420px;width:920px;display:grid;grid-template-columns:repeat(10,1fr);gap:12px;animation-delay:3.75s">
    ${sq.map((v, i) => `<div class="sq" style="aspect-ratio:1;background:${SEVC[v]};animation-delay:${(2.9 + i * 0.009).toFixed(3)}s"></div>`).join('')}</div>
  <div class="abs h" style="left:80px;right:80px;top:1460px;font-size:96px;color:${C.cream}">${words('Los días se mezclan en una sola picazón.', 3.7)}</div>
</div>
<!-- 3: the report -->
<div class="scene" style="background:linear-gradient(180deg,${C.peach},#FFF0E7);animation-delay:4.9s">
  <div class="abs pop" style="left:80px;top:300px;background:${C.coral};border-radius:999px;padding:14px 30px;animation-delay:5.3s"><span class="k" style="color:#fff">Nuevo en Skinpal 2.1</span></div>
  <div class="abs h" style="left:80px;right:80px;top:410px;font-size:120px;color:${C.forest}">${words('Tu informe de piel.', 5.45)}</div>
  <div class="abs t fade" style="left:84px;top:690px;font-size:44px;line-height:1.35;color:${C.word};animation-delay:6.0s">Tu memoria puede tomarse el día libre.<br>90 días, hechos con tus propios registros.</div>
  <div class="abs up" style="left:60px;top:900px;animation-delay:6.2s">${P.reportTop({ w: 960, count: true })}</div>
</div>
<!-- 4: day by day -->
<div class="scene" style="background:linear-gradient(180deg,${C.forest},#2F6A61);animation-delay:8.7s">
  <div class="abs h" style="left:80px;right:80px;top:330px;font-size:104px;color:${C.cream}">${words('Cada brote y cada mala noche, día a día.', 8.95)}</div>
  <div class="abs" style="left:40px;top:820px">${P.timeline({ w: 1000, grow: true })}</div>
  <div class="abs t fade" style="left:80px;right:80px;top:1360px;font-size:42px;line-height:1.35;color:${C.peach};animation-delay:10.4s">Además: zonas del cuerpo, ánimo, estrés y lo que tomas o aplicas.</div>
</div>
<!-- 5: share -->
<div class="scene" style="background:${C.cream};animation-delay:11.6s">
  <div class="abs h" style="left:80px;right:80px;top:330px;font-size:110px;color:${C.forest}">${words('Compártelo. Que el informe hable por ti.', 11.85)}</div>
  <div class="abs pop" style="left:0;right:0;top:900px;text-align:center;animation-delay:12.3s"><div class="press" style="display:inline-block;animation-delay:12.9s">${P.shareBtn(1.25)}</div></div>
  <div class="abs tap" style="left:470px;top:880px;width:140px;height:140px;border-radius:50%;background:#fff;animation-delay:12.9s"></div>
  <div class="abs sheet" style="left:0;right:0;bottom:0;height:560px;background:#F2F2F4;border-radius:44px 44px 0 0;padding:40px 70px;animation-delay:13.15s">
    <div style="width:90px;height:10px;border-radius:5px;background:#CFCFD4;margin:0 auto 34px"></div>
    <div class="t" style="font-size:30px;font-weight:700;color:#333;margin-bottom:30px">informe-piel-90-dias.pdf</div>
    <div style="display:flex;justify-content:space-between">
      ${app('Mail', '#3D8BF5', glyph('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'))}
      ${app('Mensajes', '#34C759', glyph('<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1.1-4.4A8 8 0 1121 12z"/>'))}
      ${app('Archivos', '#2F7DF6', glyph('<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>'))}
      ${app('Imprimir', '#8E8E93', glyph('<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z"/>'))}
    </div>
  </div>
</div>
<!-- 6: end card -->
<div class="scene" style="background:${C.forest};animation-delay:14.2s">
  <div class="abs pop" style="left:0;right:0;top:330px;display:flex;justify-content:center;animation-delay:14.5s">${P.logo('full', 430, C.cream)}</div>
  <div class="abs h" style="left:80px;right:80px;top:760px;text-align:center;font-size:100px;color:${C.cream}">${words('Tus últimos 90 días en un informe claro.', 14.7)}</div>
  <div class="abs t fade" style="left:0;right:0;top:1180px;text-align:center;font-size:48px;font-weight:700;color:${C.peach};animation-delay:15.4s">Gratis 14 días · Link en la bio</div>
  <div class="abs t fade" style="left:0;right:0;top:1270px;text-align:center;font-size:46px;font-weight:700;color:${C.cream};animation-delay:15.5s">Ahora en español · iPhone y Android</div>
  <div class="abs t fade" style="left:0;right:0;top:1480px;text-align:center;font-size:28px;color:${C.jadeL};animation-delay:15.6s">Un resumen de lo que registraste. No es un diagnóstico.</div>
</div>
</body></html>`;

(async () => {
  const f = path.join(out, 'reelA_es.html');
  fs.writeFileSync(f, html);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + f);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  const total = Math.round(DUR * FPS);
  for (let i = 0; i < total; i++) {
    const t = i / FPS;
    await p.evaluate((t) => {
      document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t * 1000; });
      // count-up for report stats between 6.9s and 7.9s
      const k = Math.min(1, Math.max(0, (t - 6.9) / 1.0));
      const e = 1 - Math.pow(1 - k, 3);
      document.querySelectorAll('.cnt').forEach((el) => { el.textContent = Math.round(+el.dataset.to * e); });
    }, t);
    await p.screenshot({ path: path.join(frames, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 90 });
  }
  await b.close();
  const mp4 = path.join(out, 'reel-skin-report-es.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'),
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19',
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', mp4]);
  console.log(mp4);
})();
