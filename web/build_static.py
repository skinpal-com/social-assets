import json,re,html as H
CDN='https://cdn.jsdelivr.net/gh/skinpal-com/social-assets@{sha}/web/'
h=open('home.html').read()
# --- one-time content edits (idempotent) ---
eyebrow='<p style="margin: 0; display: inline-block; background: #FFFFFF; border-radius: 999px; padding: 8px 18px; font-size: 14px; font-weight: 600; color: #386560; box-shadow: 0 1px 0 rgba(31,77,72,.08);">For topical steroid withdrawal and eczema</p>'
if eyebrow in h:
    h=h.replace(eyebrow,eyebrow.replace('<p style="margin: 0;','<h1 style="margin: 0; font-family: Inter, sans-serif; line-height: 1.4;').replace('For topical steroid withdrawal and eczema</p>','Skinpal: a daily tracker for topical steroid withdrawal (TSW) and eczema</h1>'))
    h=re.sub(r'<h1 (style="margin: 28px 0 0; font-family: Gabarito;[^"]*")>(Know if it.*?)</h1>',r'<h2 \1>\2</h2>',h,count=1,flags=re.S)
h=h.replace('.sp-root{width:100vw;margin-left:calc(50% - 50vw);','.sp-root{width:100%;margin:0;')
h=h.replace('body.sp-home #header,','body.sp-home #siteWrapper,body.sp-home .sqs-announcement-bar-dropzone,body.sp-home #header,') if '#siteWrapper' not in h else h
what=('        <details open style="border-top: 1.5px solid #D9D2C5; padding: 24px 0;">\n'
 '          <summary style="font-family: Gabarito; font-weight: 800; font-size: 22px; cursor: pointer;">What is Skinpal?</summary>\n'
 '          <p style="margin: 14px 0 0; font-size: 17px; line-height: 1.6; color: #47635E;">Skinpal is a mobile app for people living with topical steroid withdrawal (TSW) and eczema. You log mood, symptoms on a body map, sleep, stress, food and photos in about 30 seconds a day, and Skinpal turns your logs into weekly summaries so you can see what changed over time. It also has a community for people going through the same thing. Skinpal is made by TSW Nordic AB in Gothenburg, Sweden, and was founded by Lukas Löfgren, who has lived with TSW since January 2022. It runs on iPhone and Android in English and Spanish, and costs $3.99 a month or $39.99 a year after a 14-day free trial.</p>\n'
 '        </details>\n')
if 'What is Skinpal?' not in h:
    h=h.replace('        <details open style="border-top: 1.5px solid #D9D2C5; padding: 24px 0;">\n          <summary style="font-family: Gabarito; font-weight: 800; font-size: 22px; cursor: pointer;">Does Skinpal give medical advice?',
                what+'        <details style="border-top: 1.5px solid #D9D2C5; padding: 24px 0;">\n          <summary style="font-family: Gabarito; font-weight: 800; font-size: 22px; cursor: pointer;">Does Skinpal give medical advice?',1)
    assert 'What is Skinpal?' in h
open('home.html','w').write(h)
# --- FAQ for JSON-LD, taken from the visible page ---
faq=re.findall(r'<summary[^>]*>(.*?)</summary>\s*<p[^>]*>(.*?)</p>',h,re.S)
clean=lambda s:H.unescape(re.sub(r'<[^>]+>','',s)).strip()
faq=[(clean(q),clean(a)) for q,a in faq]
ld=[{
 "@context":"https://schema.org","@type":"Organization","@id":"https://www.skinpal.com/#org",
 "name":"Skinpal","legalName":"TSW Nordic AB","url":"https://www.skinpal.com/",
 "logo":CDN.format(sha='SHA')+"img/logo.svg","email":"info@skinpal.com",
 "address":{"@type":"PostalAddress","addressLocality":"Gothenburg","addressCountry":"SE"},
 "founder":{"@type":"Person","name":"Lukas Löfgren","sameAs":["https://www.instagram.com/tswlukas/"]},
 "sameAs":["https://www.instagram.com/skinpal.app/","https://www.linkedin.com/company/skinpalapp/",
   "https://apps.apple.com/se/app/skinpal/id6755601252","https://play.google.com/store/apps/details?id=com.skinpal.skinpalapp"]},
 {"@context":"https://schema.org","@type":"MobileApplication","name":"Skinpal",
 "description":"A daily tracker for topical steroid withdrawal (TSW) and eczema: log symptoms, mood, sleep and photos in about 30 seconds and see what changed week by week. Not medical advice.",
 "operatingSystem":"iOS, Android","applicationCategory":"HealthApplication","inLanguage":["en","es"],
 "url":"https://www.skinpal.com/","publisher":{"@id":"https://www.skinpal.com/#org"},
 "downloadUrl":["https://apps.apple.com/se/app/skinpal/id6755601252","https://play.google.com/store/apps/details?id=com.skinpal.skinpalapp"],
 "offers":[{"@type":"Offer","price":"3.99","priceCurrency":"USD","description":"Monthly subscription after a 14-day free trial"},
           {"@type":"Offer","price":"39.99","priceCurrency":"USD","description":"Yearly subscription after a 14-day free trial"}]},
 {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faq]}]
json.dump(ld,open('home-ld.json','w'),ensure_ascii=False)
boot=("(function(){try{if(window.self!==window.top)return}catch(e){return}"
 "var t=document.querySelector('.sp-root');if(!t)return;var w=t.parentNode;"
 "document.body.classList.add('sp-home');document.body.insertBefore(w,document.body.firstChild);"
 "if(!location.hash)window.scrollTo(0,0);})();")
open('home-boot.js','w').write(boot)
print(len(h), len(faq), [q for q,_ in faq])
