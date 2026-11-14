"""Build the 2.3 homepage code block (home-block.html), JSON-LD and llms.txt
from the approved Seasons design (/home/claude/web/root/project/Seasons.dc.html)."""
import re, json, html as H, sys
ASHA = sys.argv[1]                       # commit holding web/v23 assets
BSHA = sys.argv[2] if len(sys.argv) > 2 else ASHA   # commit holding home-boot.js
CDN = 'https://cdn.jsdelivr.net/gh/skinpal-com/social-assets@%s/web/v23/' % ASHA
APPLE = 'https://apps.apple.com/se/app/skinpal/id6755601252'
PLAY = 'https://play.google.com/store/apps/details?id=com.skinpal.skinpalapp'

src = open('/home/claude/web/root/project/Seasons.dc.html').read()
css = re.search(r'<helmet>.*?<style>(.*?)</style>', src, re.S).group(1)
body = re.search(r'</helmet>\s*(.*)</x-dc>', src, re.S).group(1)

blob = {
 'f59e165fbd37323e280cece6b7861a89': 'Gabarito_800ExtraBold.ttf', 'e82c790e04d1094d6ae4ea7430f99024': 'Gabarito_700Bold.ttf',
 'f8cd7ae32af062530e7e9038736ca2a3': 'phone-home.webp', 'd132bda7dda73b4fafad640483d89000': 'phone-logstart.webp',
 'a5f10fa85080a197a4482e4b33a13377': 'phone-bodymap.webp', '1d4e8c9547369463c0195fc2daf72080': 'phone-calendar.webp',
 'ea3b69fda85aa6f59a304694f7b574d2': 'phone-welcome.webp', 'c9277455da737e2aa67329108dacf4b8': 'report.webp',
 'fba135524fa8add7f5e6371f437a2029': 'yeti-s-community.webp', '9e576194bb1f1b37aefd59166441dc67': 'yeti-sleepy.webp',
 'd909821f8d56ba52f7ca2df42bf3febc': 'logo-green.png', '888c169e57f0d7248e9cd1e05022cf1f': 'logo-white.png',
 '8db145f1b43ce89711eacb1237086e04': 'portrait.webp', '27c383f1b532bbf46fa36395bd77bc91': 'kayak2020.webp',
 '4ca04532469be2608775924bf93a5598': 'hat2022.webp',
}
def fix_urls(s):
    s = re.sub(r'/_blob/([0-9a-f]{32})', lambda m: CDN + blob[m.group(1)], s)
    assert '/_blob/' not in s
    return s

# ---- CSS: keep animation + layout rules, scope element rules to .sp-root
css = fix_urls(css)
keep = []
for line in css.strip().split('\n'):
    if line.startswith('#') or re.match(r'@keyframes (waving|logged|sleepy|happy)-', line):
        continue                      # yeti keyframes now live inside the yeti SVG files
    keep.append(line)
css = '\n'.join(keep)
css = css.replace('body{margin:0;background:#F8F5EF}', '')
css = css.replace('a{color:#1F4E48}a:hover{color:#C4674F}', '.sp-root a{color:#1F4E48}.sp-root a:hover{color:#C4674F}')
css = css.replace('.land{position:absolute;inset:0;width:100%;height:100%;z-index:0;display:block}',
                  '.sp-root .land{position:absolute;inset:0;width:100%;height:100%;z-index:0;display:block;object-fit:cover;object-position:50% 100%;pointer-events:none}')
css = re.sub(r'@media \(prefers-reduced-motion: reduce\)\{[^\n]*\}\}?', '', css)
for cls in ['.chapter{', '.strip{', '.live{', '.live >', '.bob{', '.h1{', '.h2{', '.navlinks{', '.strip img']:
    css = css.replace(cls, '.sp-root ' + cls)
css = re.sub(r'(?m)^(\.sway|\.drift|\.glow|\.snow|\.rain|\.petal|\.fly|\.twinkle)\{[^\n]*\n', '', css)
base = r"""
.sp-root{width:100%;margin:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
.sp-root *{box-sizing:border-box}
.sp-root h1,.sp-root h2,.sp-root h3,.sp-root p,.sp-root blockquote{text-transform:none;font-style:normal;letter-spacing:normal}
.sp-root img{max-width:100%}
.sp-root summary{list-style:none}
.sp-root summary::-webkit-details-marker{display:none}
.sp-root summary::after{content:"+";float:right;font-weight:400}
.sp-root details[open] summary::after{content:"\2013"}
.sp-root .yeti{position:absolute;z-index:1;pointer-events:none}
.sp-root .bob{animation:bob 4s ease-in-out infinite}
body.sp-home #siteWrapper,body.sp-home .sqs-announcement-bar-dropzone,body.sp-home #header,body.sp-home header.Header,body.sp-home #footer-sections,body.sp-home footer.sections{display:none!important}
body.sp-home{background:#F8F5EF!important}
body.sp-home .page-section,body.sp-home .content-wrapper{padding-top:0!important;padding-bottom:0!important}
@media (max-width:900px){.sp-root .yeti{transform:scale(.7);transform-origin:bottom}.sp-root .hero-yeti-left{display:none}}
@media (prefers-reduced-motion: reduce){.sp-root .bob{animation:none}}
"""
css = base + css

# ---- markup
b = fix_urls(body)
# landscapes -> animated SVG images
order = iter(['winter', 'late', 'thaw', 'spring', 'summer', 'evening', 'spring'])
b = re.sub(r'<svg class="land".*?</svg>', lambda m: '<img class="land" src="%sland-%s.svg" alt="" aria-hidden="true">' % (CDN, next(order)), b, flags=re.S)
# inline yetis -> animated SVG images (keep their position styles)
def yimg(m):
    tag = m.group(0)
    st = re.search(r'style="([^"]*)"', tag).group(1)
    pose = {'wa': 'waving', 'lo': 'logged', 'sl': 'sleepy', 'ha': 'happy'}[re.search(r'id="(\w\w)-', tag).group(1)]
    extra = ' hero-yeti-left' if pose == 'logged' else ''
    return '<img class="yeti%s" src="%syeti-%s.svg" alt="" aria-hidden="true" style="%s">' % (extra, CDN, pose, st)
b = re.sub(r'<svg class="yeti".*?</svg>', yimg, b, flags=re.S)
assert '<svg class="yeti"' not in b and '<svg class="land"' not in b

# pricing toggle: x-dc branches -> plain buttons + tiny script
on = 'background: #1F4E48; color: #FFFFFF'; off = 'background: transparent; color: #1F4E48'
b = re.sub(r'<sc-if value="\{\{ yearly \}\}".*?</sc-if>\s*<sc-if value="\{\{ monthly \}\}".*?</sc-if>',
           '<button type="button" data-plan="monthly" aria-pressed="false" style="border: 0; cursor: pointer; font-family: Inter, sans-serif; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 999px; min-height: 44px; %s">Monthly</button>\n'
           '      <button type="button" data-plan="yearly" aria-pressed="true" style="border: 0; cursor: pointer; font-family: Inter, sans-serif; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 999px; min-height: 44px; %s">Yearly</button>' % (off, on), b, flags=re.S)
b = b.replace('{{ price }}', '<span id="sp-price">$39.99</span>').replace('{{ per }}', '<span id="sp-per">per year, about two months free</span>')
assert '{{' not in b and 'sc-if' not in b

# links and nav
b = b.replace('href="https://apps.apple.com/app/id6755601252"', 'href="%s"' % APPLE)
b = b.replace('<a href="#" style="display: inline-flex; align-items: center; text-decoration: none; background: #FFFFFF; color: #1F4E48; padding: 14px 28px; border-radius: 16px; font-weight: 600; font-size: 16px; min-height: 56px; box-sizing: border-box">Download for Android</a>',
              '<a href="%s" style="display: inline-flex; align-items: center; text-decoration: none; background: #FFFFFF; color: #1F4E48; padding: 14px 28px; border-radius: 16px; font-weight: 600; font-size: 16px; min-height: 56px; box-sizing: border-box">Download for Android</a>' % PLAY)
b = b.replace('Start 14 days free</a>\n        <a href="#how"', 'Start 14 days free</a>\n        <a href="#how"')
b = b.replace('href="%s" style="display: inline-flex; align-items: center; text-decoration: none; background: #1F4E48; color: #FFFFFF; padding: 14px 28px; border-radius: 16px; font-weight: 600; font-size: 16px; min-height: 56px; box-sizing: border-box">Start 14 days free' % APPLE,
              'href="#get" style="display: inline-flex; align-items: center; text-decoration: none; background: #1F4E48; color: #FFFFFF; padding: 14px 28px; border-radius: 16px; font-weight: 600; font-size: 16px; min-height: 56px; box-sizing: border-box">Start 14 days free')
navold = re.search(r'<div class="navlinks".*?</div>', b, re.S).group(0)
navnew = re.sub(r'(<div class="navlinks"[^>]*>).*?(</div>)', r'''\1
        <a href="#how" style="text-decoration: none">How it works</a>
        <a href="#community" style="text-decoration: none">Community</a>
        <a href="/topical-steroid-withdrawal" style="text-decoration: none">TSW guide</a>
        <a href="/blog" style="text-decoration: none">Blog</a>
        <a href="#price" style="text-decoration: none">Pricing</a>
      \2''', navold, flags=re.S)
b = b.replace(navold, navnew)
b = b.replace('<a href="#top" aria-label="Skinpal home">', '<a href="/" aria-label="Skinpal home">')
b = b.replace('href="https://www.instagram.com/tswlukas"', 'href="https://www.instagram.com/tswlukas/"').replace('href="https://www.instagram.com/skinpal.app"', 'href="https://www.instagram.com/skinpal.app/"')

# SEO: keyword h1 as the eyebrow, display line becomes h2
b = b.replace('<p style="display: inline-block; margin: 0; background: #E98D74; color: #1A1A1A; font-size: 14px; font-weight: 600; padding: 8px 16px; border-radius: 999px">Skinpal 2.3 · out now on iPhone and Android</p>',
              '<h1 style="display: inline-block; margin: 0; background: #E98D74; color: #1A1A1A; font-family: Inter, sans-serif; font-size: 14px; line-height: 1.4; font-weight: 600; padding: 8px 16px; border-radius: 999px">Skinpal: a tracker and community for topical steroid withdrawal (TSW) and eczema</h1>')
b = b.replace('<h1 class="h1"', '<p role="heading" aria-level="2" class="h1"').replace('Meet the new Skinpal.</h1>', 'Meet the new Skinpal.</p>')

# facts from the current site that should stay
b = b.replace('Lukas, founder. Living with TSW since January 2022, and still logging.',
              'Lukas Löfgren, founder. Living with TSW since January 2022, still logging, and sharing the whole thing with 40,000+ people who follow his story.')
b = b.replace("share the small wins, and check in on the bad weeks.", "share the small wins, and check in on the bad weeks. There are spaces for TSW, for parents, and for the emotional side of it.")
b = b.replace('<p style="font-size: 19px; margin: 16px 0 36px">Then one simple plan. Cancel any time in your app store settings.</p>',
              '<p style="font-size: 19px; margin: 16px 0 36px">Then one simple plan. Cancel any time in your app store settings.</p>\n    <p style="font-size: 15px; font-weight: 600; color: #1F4E48; margin: -20px 0 32px">AES-256 encrypted · Never sold · Delete any time</p>')
b = b.replace('It is made by TSW Nordic AB in Sweden, founded by someone living with TSW.',
              'It is made by TSW Nordic AB in Gothenburg, Sweden, and was founded by Lukas Löfgren, who has lived with TSW since January 2022.')
faqdata = '''      <details style="border-top: 1px solid rgba(31,78,72,.14); padding: 22px 0">
        <summary style="cursor: pointer; font-size: 19px; font-weight: 600; color: #1F4E48">Is my data safe?</summary>
        <p style="font-size: 17px; line-height: 1.6; margin: 12px 0 0">Your data is encrypted with AES-256, it is never sold, and you can delete your account and all your health data at any time.</p>
      </details>
'''
i = b.index('What does Skinpal cost?'); j = b.rfind('<details', 0, i); b = b[:j] + faqdata.lstrip() + '      ' + b[j:]

# footer: real links
foot_old = re.search(r'<div style="display: flex; gap: 28px; flex-wrap: wrap; font-size: 15px">.*?</div>', b, re.S).group(0)
links = [('https://www.instagram.com/skinpal.app/', 'Instagram'), ('https://www.linkedin.com/company/skinpalapp/', 'LinkedIn'),
         ('mailto:info@skinpal.com', 'info@skinpal.com'), ('/topical-steroid-withdrawal', 'TSW guide'), ('/blog', 'Blog'),
         ('/termsofservice', 'Terms'), ('/privacypolicy', 'Privacy'), ('/eula', 'EULA'), ('/delete-your-account', 'Delete account')]
b = b.replace(foot_old, '<nav aria-label="Footer" style="display: flex; gap: 22px; flex-wrap: wrap; font-size: 15px">\n' +
              ''.join('        <a href="%s" style="color: #FFEFE7; text-decoration: none">%s</a>\n' % l for l in links) + '      </nav>')
b = b.replace('© 2026 TSW Nordic AB.', '© 2026 TSW Nordic AB, Gothenburg, Sweden.')

script = '''<script>(function(){var r=document.getElementById('skinpal-home');if(!r)return;var bs=r.querySelectorAll('[data-plan]'),p=r.querySelector('#sp-price'),q=r.querySelector('#sp-per');
var on='%s',off='%s';function set(y){bs.forEach(function(x){var a=(x.getAttribute('data-plan')==='yearly')===y;x.setAttribute('aria-pressed',a);x.style.background=a?'#1F4E48':'transparent';x.style.color=a?'#FFFFFF':'#1F4E48'});p.textContent=y?'$39.99':'$3.99';q.textContent=y?'per year, about two months free':'per month'}
bs.forEach(function(x){x.addEventListener('click',function(){set(x.getAttribute('data-plan')==='yearly')})})})();</script>''' % (on, off)

block = ('<div id="skinpal-home">\n<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">\n'
         '<style>' + css + '</style>\n<div class="sp-root" style="font-family: Inter, system-ui, sans-serif; color: #3E6F69; background: #F8F5EF; overflow: hidden">' +
         b.split('<div style="font-family: Inter, system-ui, sans-serif; color: #3E6F69; background: #F8F5EF; overflow: hidden">', 1)[1] +
         '</div>\n' + script + '\n<script src="https://cdn.jsdelivr.net/gh/skinpal-com/social-assets@%s/web/home-boot.js"></script>\n' % BSHA)
block = block.replace('minmax(320px, 1fr)', 'minmax(min(320px, 100%), 1fr)')
block = block.replace('border-radius: 36px; padding: 56px;', 'border-radius: 36px; padding: clamp(22px, 5vw, 56px);')
block = block.replace('<img src="%syeti-s-community.webp" alt="" aria-hidden="true" style="width: 200px;' % CDN, '<img class="comm-yeti" src="%syeti-s-community.webp" alt="" aria-hidden="true" style="width: 200px;' % CDN)
block = block.replace('@media (max-width:900px){.sp-root .yeti', '@media (max-width:900px){.sp-root .strip{margin-top:-40px!important}.sp-root .comm-yeti{display:none}.sp-root blockquote{font-size:30px!important}.sp-root #community{padding-top:96px!important}.sp-root .yeti')
block = re.sub(r'\n\s*\n', '\n', block)
open('web/home-block.html', 'w').write(block)

# ---- JSON-LD from the visible FAQ
faq = re.findall(r'<summary[^>]*>(.*?)</summary>\s*<p[^>]*>(.*?)</p>', block, re.S)
clean = lambda s: H.unescape(re.sub(r'<[^>]+>', '', s)).strip()
faq = [(clean(q), clean(a)) for q, a in faq]
ld = json.load(open('web/home-ld.json'))
ld[0]['logo'] = CDN + 'logo-green.png'
ld[1]['description'] = ('A tracker and community for topical steroid withdrawal (TSW) and eczema. Log your day in one tap or by voice, '
                        'see your own patterns in a calendar coloured by itch, and bring a 90-day report to your doctor. Not medical advice.')
ld[1]['softwareVersion'] = '2.3'
ld[2]['mainEntity'] = [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]
json.dump(ld, open('web/home-ld.json', 'w'), ensure_ascii=False)
head = open('web/home-head.html').read()
head = re.sub(r'<script type="application/ld\+json">.*?</script>', lambda m: '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>', head, flags=re.S)
open('web/home-head.html', 'w').write(head)
print('block', len(block), 'faq', len(faq), [q for q, _ in faq])

# ---- subpage chrome (site.js): same nav and footer as the new homepage
navm = re.search(r'<nav style="max-width: 1240px.*?</nav>', block, re.S).group(0)
for a in ['#how', '#community', '#price', '#get']:
    navm = navm.replace('href="%s"' % a, 'href="/%s"' % a)
footm = re.search(r'<footer.*?</footer>', block, re.S).group(0)
FONT = CDN
sub_css = r"""
@font-face{font-family:'Gabarito';font-weight:800;src:url(%sGabarito_800ExtraBold.ttf) format('truetype');font-display:swap}
@font-face{font-family:'Gabarito';font-weight:700;src:url(%sGabarito_700Bold.ttf) format('truetype');font-display:swap}
body.sp-sub{background:#F8F5EF!important}
body.sp-sub #header,body.sp-sub header.Header,body.sp-sub #footer-sections,body.sp-sub footer.sections{display:none!important}
body.sp-sub .page-section,body.sp-sub .page-section .section-background,body.sp-sub .blog-list,body.sp-sub article{background-color:#F8F5EF!important}
.sp-chrome{font-family:Inter,system-ui,sans-serif;color:#3E6F69;-webkit-font-smoothing:antialiased}
.sp-chrome *{box-sizing:border-box}
.sp-chrome a{color:#1F4E48}
.sp-chrome.sp-top{background:#F8F5EF;border-bottom:1px solid rgba(31,78,72,.08)}
body.sp-sub h1,body.sp-sub h2,body.sp-sub h3,body.sp-sub h4,body.sp-sub .blog-title,body.sp-sub .entry-title{font-family:Gabarito,sans-serif!important;color:#1F4E48!important;font-weight:800!important;letter-spacing:-.02em;text-transform:none!important}
body.sp-sub h1{line-height:1.02!important}
body.sp-sub h2{line-height:1.08!important}
body.sp-sub .sqs-html-content p,body.sp-sub .sqs-html-content li,body.sp-sub .blog-excerpt p,body.sp-sub .blog-item-content p{font-family:Inter,system-ui,sans-serif!important;color:#3A4A47!important;font-size:18px!important;line-height:1.65!important;opacity:1!important}
body.sp-sub .sqs-html-content a,body.sp-sub .blog-item-content a{color:#1F4E48!important;text-decoration:underline!important;text-underline-offset:3px}
body.sp-sub .sqs-block-button-element,body.sp-sub .blog-more-link,body.sp-sub .sqs-button-element--primary{background:#1F4E48!important;color:#FFFFFF!important;border-radius:999px!important;font-family:Inter,sans-serif!important;font-weight:600!important;text-transform:none!important;letter-spacing:0!important;border:0!important}
body.sp-sub .blog-meta-section,body.sp-sub .blog-date,body.sp-sub .blog-categories-list{font-family:Inter,sans-serif!important;color:#5E7773!important}
body.sp-sub .preFade,body.sp-sub .fadeIn{opacity:1!important;transform:none!important;transition:none!important}
@media (max-width:900px){.sp-chrome .navlinks{display:none!important}}
""" % (FONT, FONT)
fonts = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">'
js = ("(function(){try{if(window.self!==window.top)return}catch(e){return}"
      "function go(){if(document.getElementById('skinpal-home')||document.querySelector('.sp-chrome'))return;document.body.classList.add('sp-sub');"
      "document.head.insertAdjacentHTML('beforeend'," + json.dumps(fonts + '<style>' + sub_css + '</style>') + ");"
      "var hd=document.createElement('div');hd.className='sp-chrome sp-top';hd.innerHTML=" + json.dumps(navm) + ";"
      "document.body.insertBefore(hd,document.body.firstChild);"
      "var ft=document.createElement('div');ft.className='sp-chrome';ft.innerHTML=" + json.dumps(footm) + ";"
      "document.body.appendChild(ft);}"
      "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();})();")
open('web/site.js', 'w').write(js)
print('site.js', len(js))
