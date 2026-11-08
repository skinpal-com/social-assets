// Animated trial reel: "POV: your doctor asks how the last 3 months have been". Usage: node reelB.js outDir
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process'), { chromium } = require('playwright');
const P = require('./parts'); const { C } = P;
const out = process.argv[2]; const frames = path.join(out, 'framesB'); fs.mkdirSync(frames, { recursive: true });
const DUR = 11, FPS = 30;
const words = (txt, start) => txt.split(' ').map((w, i) => `<span class="w" style="animation-delay:${(start + i * 0.11).toFixed(2)}s">${w}</span>`).join(' ');
const css = `${P.fontCss}
body{width:1080px;height:1920px;overflow:hidden;position:relative;background:${C.forest}}
.scene{position:absolute;inset:0;overflow:hidden;animation:wipe .5s cubic-bezier(.7,0,.2,1) both}
@keyframes wipe{from{transform:translateY(100%)}to{transform:none}}
.w{display:inline-block;animation:wup .45s cubic-bezier(.2,.9,.3,1.2) both}
@keyframes wup{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
.pop{animation:pop .45s cubic-bezier(.2,.9,.3,1.3) both}@keyframes pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
.fade{animation:fade .45s ease both}@keyframes fade{from{opacity:0}to{opacity:1}}
.up{animation:up .7s cubic-bezier(.2,.8,.2,1) both}@keyframes up{from{opacity:0;transform:translateY(600px)}to{opacity:1;transform:rotate(-2deg)}}
.dot{display:inline-block;width:46px;height:46px;border-radius:50%;background:${C.forest};margin:0 14px;animation:dot .9s ease-in-out infinite both}
@keyframes dot{0%,100%{transform:translateY(0);opacity:.35}50%{transform:translateY(-26px);opacity:1}}
.bar{transform-origin:bottom;animation:grow .3s ease-out both;animation-delay:calc(7.0s + var(--d)*0.012s)}
.sl{animation:fade .3s ease both;animation-delay:calc(7.1s + var(--d)*0.012s)}
@keyframes grow{from{transform:scaleY(0)}to{transform:none}}`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="scene" style="background:${C.forest};animation:none">
  <div class="abs k fade" style="left:80px;top:560px;color:${C.peach};font-size:40px;animation-delay:.1s">POV: your doctor asks</div>
  <div class="abs h" style="left:80px;right:80px;top:650px;font-size:128px;color:${C.cream}">${words('“How have the last three months been?”', 0.4)}</div>
</div>
<div class="scene" style="background:${C.peach};animation-delay:2.9s">
  <div class="abs h fade" style="left:80px;top:620px;font-size:120px;color:${C.forest};animation-delay:3.2s">You:</div>
  <div class="abs" style="left:66px;top:880px"><span class="dot" style="animation-delay:3.3s"></span><span class="dot" style="animation-delay:3.45s"></span><span class="dot" style="animation-delay:3.6s"></span></div>
  <div class="abs t fade" style="left:84px;top:1060px;font-size:46px;color:${C.word};animation-delay:3.9s">Brain.exe has stopped working.</div>
</div>
<div class="scene" style="background:linear-gradient(180deg,#FFF0E7,${C.peach});animation-delay:5.0s">
  <div class="abs h" style="left:80px;right:80px;top:280px;font-size:118px;color:${C.forest}">${words('Or you open this.', 5.25)}</div>
  <div class="abs up" style="left:60px;top:520px;animation-delay:5.6s">${P.reportTop({ w: 960 })}</div>
  <div class="abs up" style="left:40px;top:1090px;animation-delay:6.5s">${P.timeline({ w: 1000, grow: true })}</div>
</div>
<div class="scene" style="background:${C.forest};animation-delay:8.6s">
  <div class="abs pop" style="left:0;right:0;top:380px;display:flex;justify-content:center;animation-delay:8.85s">${P.logo('full', 400, C.cream)}</div>
  <div class="abs k fade" style="left:0;right:0;top:760px;text-align:center;color:${C.peach};animation-delay:9.1s">New: skin report</div>
  <div class="abs h" style="left:80px;right:80px;top:830px;text-align:center;font-size:96px;color:${C.cream}">${words('Your last 90 days in one clear report.', 9.2)}</div>
  <div class="abs t fade" style="left:0;right:0;top:1230px;text-align:center;font-size:46px;font-weight:700;color:${C.peach};animation-delay:9.9s">Free for 14 days · Link in bio</div><div class="abs t fade" style="left:0;right:0;top:1310px;text-align:center;font-size:38px;color:${C.cream};animation-delay:10.1s">Your memory can take the day off.</div>
  <div class="abs t fade" style="left:0;right:0;top:1460px;text-align:center;font-size:28px;color:${C.jadeL};animation-delay:10s">A summary of what you logged. Not a diagnosis.</div>
</div></body></html>`;
(async () => {
  const f = path.join(out, 'reelB.html'); fs.writeFileSync(f, html);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  for (let i = 0; i < Math.round(DUR * FPS); i++) {
    await p.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t * 1000; }), i / FPS);
    await p.screenshot({ path: path.join(frames, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 90 });
  }
  await b.close();
  const mp4 = path.join(out, 'reel-pov-doctor.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'), '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', mp4]);
  console.log(mp4);
})();
