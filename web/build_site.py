import json,re
h=open('home.html').read()
# 1) home nav: Story -> TSW guide + Blog
story='<a href="#story" style="color: #1F4D48; text-decoration: none;">Story</a>'
newnav=('<a href="/topical-steroid-withdrawal" style="color: #1F4D48; text-decoration: none;">TSW guide</a>\n'
        '        <a href="/blog" style="color: #1F4D48; text-decoration: none;">Blog</a>')
if story in h:
    j=open('home.js').read()
    for a,b in [(story,newnav)]:
        h=h.replace(a,b)
        ja=json.dumps(a,ensure_ascii=False)[1:-1]; jb=json.dumps(b,ensure_ascii=False)[1:-1]
        assert j.count(ja)==1; j=j.replace(ja,jb)
    open('home.html','w').write(h); open('home.js','w').write(j)
header=re.search(r'  <header.*?</header>',h,re.S).group(0)
footer=re.search(r'  <footer.*?</footer>',h,re.S).group(0)
header=(header.replace('href="#top"','href="/"').replace('href="#product"','href="/#product"')
        .replace('href="#faq"','href="/#faq"').replace('href="#download"','href="/#download"'))
css=r"""
body.sp-sub{background:#F9F5EE!important}
body.sp-sub #header,body.sp-sub header.Header,body.sp-sub #footer-sections,body.sp-sub footer.sections{display:none!important}
body.sp-sub .page-section,body.sp-sub .page-section .section-background,body.sp-sub .blog-list,body.sp-sub article{background-color:#F9F5EE!important}
body.sp-sub .page-section{color:#3A3330}
.sp-chrome{font-family:Inter,system-ui,sans-serif;color:#1F4D48;background:#F9F5EE;-webkit-font-smoothing:antialiased}
.sp-chrome *{box-sizing:border-box}
.sp-chrome a{text-decoration:none}
.sp-chrome footer a{text-decoration:underline;color:#1F4D48}
body.sp-sub h1,body.sp-sub h2,body.sp-sub h3,body.sp-sub h4,body.sp-sub .blog-title,body.sp-sub .entry-title{font-family:Gabarito,sans-serif!important;color:#1F4D48!important;font-weight:800!important;letter-spacing:-.5px;text-transform:none!important}
body.sp-sub h1{line-height:1.02!important}
body.sp-sub h2{line-height:1.08!important}
body.sp-sub .sqs-html-content p,body.sp-sub .sqs-html-content li,body.sp-sub .blog-excerpt p,body.sp-sub .blog-item-content p{font-family:Inter,system-ui,sans-serif!important;color:#3A3330!important;font-size:18px!important;line-height:1.65!important;opacity:1!important}
body.sp-sub .sqs-html-content a,body.sp-sub .blog-item-content a{color:#1F4D48!important;text-decoration:underline!important;text-underline-offset:3px}
body.sp-sub .sqs-html-content strong{color:#1F4D48}
body.sp-sub .sqs-block-button-element,body.sp-sub .blog-more-link,body.sp-sub .sqs-button-element--primary{background:#1F4D48!important;color:#F9F5EE!important;border-radius:999px!important;font-family:Inter,sans-serif!important;font-weight:600!important;text-transform:none!important;letter-spacing:0!important;border:0!important}
body.sp-sub .blog-meta-section,body.sp-sub .blog-date,body.sp-sub .blog-categories-list{font-family:Inter,sans-serif!important;color:#6B7F7A!important}
body.sp-sub .preFade,body.sp-sub .fadeIn{opacity:1!important;transform:none!important;transition:none!important}
@media (max-width:820px){.sp-chrome header nav{gap:16px!important;font-size:14px!important}}
"""
fonts='<link href="https://fonts.googleapis.com/css2?family=Gabarito:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">'
js=("(function(){try{if(window.self!==window.top)return}catch(e){return}"
    "function go(){if(document.getElementById('skinpal-home')||document.querySelector('.sp-chrome'))return;document.body.classList.add('sp-sub');"
    "document.head.insertAdjacentHTML('beforeend',"+json.dumps(fonts+'<style>'+css+'</style>')+");"
    "var hd=document.createElement('div');hd.className='sp-chrome';hd.innerHTML="+json.dumps(header)+";"
    "document.body.insertBefore(hd,document.body.firstChild);"
    "var ft=document.createElement('div');ft.className='sp-chrome';ft.innerHTML="+json.dumps(footer)+";"
    "document.body.appendChild(ft);}"
    "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();})();")
open('site.js','w').write(js)
