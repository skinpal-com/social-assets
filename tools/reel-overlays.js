const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const F=(n)=>'file://'+path.resolve(__dirname,'../node_modules/@fontsource',n);
const LOGO=fs.readFileSync(path.join(__dirname,'../assets/logo.svg'),'utf8');
const out=process.argv[2];
const C={peach:'#FFD6C1',coral:'#E98D73',jade:'#8CB8A1',forest:'#1F4D48',cream:'#F9F5EE'};
const logo=(w,col)=>LOGO.replace(/<svg[^>]*>/,`<svg width="${w}" height="${Math.round(w*271/395)}" viewBox="0 0 395 271" fill="none" xmlns="http://www.w3.org/2000/svg">`).replace(/fill="#386560" class="word"/g,`fill="${col}"`);
const css=`@font-face{font-family:G;font-weight:900;src:url(${F('gabarito/files/gabarito-latin-900-normal.woff2')})}@font-face{font-family:G;font-weight:700;src:url(${F('gabarito/files/gabarito-latin-700-normal.woff2')})}
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;background:transparent;position:relative;font-family:G;overflow:hidden}.a{position:absolute}`;
// frame: forest everywhere except a rounded window where the video shows through
const frame=(t1,t2)=>`<svg class="a" style="left:0;top:0" width="1080" height="1920"><defs><mask id="m"><rect width="1080" height="1920" fill="white"/><rect x="170" y="640" width="740" height="1000" rx="56" fill="black"/></mask></defs><rect width="1080" height="1920" fill="${C.forest}" mask="url(#m)"/></svg>
<div class="a" style="left:90px;right:90px;top:300px;text-align:center;font:900 112px/0.95 G;color:${C.cream};letter-spacing:-2px">${t1}</div>
<div class="a" style="left:90px;right:90px;top:${t1.includes('<br>')?'530':'440'}px;text-align:center;font:700 46px G;color:${C.peach}">${t2}</div>`;
const pages={
 frameA:frame('Day 1,693<br>of TSW.',''),
 frameB:frame('30 seconds a day.','Then see what changed.'),
 end:`<div class="a" style="inset:0;background:${C.forest}"></div><div class="a" style="left:0;right:0;top:560px;display:flex;justify-content:center">${logo(520,C.cream)}</div>
 <div class="a" style="left:0;right:0;top:1000px;text-align:center;font:900 96px G;color:${C.cream}">Track your TSW.</div>
 <div class="a" style="left:0;right:0;top:1130px;text-align:center;font:700 50px G;color:${C.peach}">14 days free · iPhone & Android</div>`};
(async()=>{const b=await chromium.launch();for(const[k,h]of Object.entries(pages)){const p=await b.newPage({viewport:{width:1080,height:1920}});const f=path.join(out,k+'.html');fs.writeFileSync(f,`<html><head><style>${css}</style></head><body>${h}</body></html>`);await p.goto('file://'+f);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(200);await p.screenshot({path:path.join(out,k+'.png'),omitBackground:true});await p.close();console.log(k)}await b.close()})();
