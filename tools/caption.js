// Renders IG-native-looking caption overlays (transparent PNG 1080x1920).
// Usage: node caption.js outDir '[{"id":"c1","text":"How I log my TSW"}]'
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const [,,out,json]=process.argv; const items=JSON.parse(json);
(async()=>{const b=await chromium.launch();for(const it of items){const p=await b.newPage({viewport:{width:1080,height:1920}});
const lines=it.text.split('|');
const html=`<html><head><style>*{margin:0;padding:0}body{width:1080px;height:1920px;background:transparent;position:relative}
.w{position:absolute;left:60px;right:60px;top:${it.top||300}px;text-align:center}
.l{display:inline-block;background:${it.bg||'#FFFFFF'};color:${it.ink||'#111'};font:700 ${it.size||68}px/1.1 Inter,Helvetica,sans-serif;padding:14px 30px 20px;border-radius:22px;margin:8px 0}</style></head>
<body><div class="w">${lines.map(l=>`<div><span class="l">${l}</span></div>`).join('')}</div></body></html>`;
const f=path.join(out,it.id+'.html');fs.writeFileSync(f,html);await p.goto('file://'+f);await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:path.join(out,it.id+'.png'),omitBackground:true});await p.close();}await b.close();console.log('ok')})();
