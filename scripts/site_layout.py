"""Shared static layout. Run python3 scripts/site_layout.py after editing navigation.
Pages remain ordinary HTML served directly by Vercel; no build service is required.
"""
from pathlib import Path
from html import escape
import re
ROOT = Path(__file__).resolve().parent.parent
ROUTES = {
 'home': ('/', '/index-fr'), 'solution': ('/our-solution', '/notre-solution'),
 'pricing': ('/pricing', '/pricing-fr'), 'faq': ('/faq', '/faq-fr'),
 'about': ('/about', '/a-propos'), 'careers': ('/careers', '/recrutement'),
 'media': ('/media', '/medias'), 'contact': ('/contact', '/contact-fr'),
 'privacy': ('/privacy', '/confidentialite'), 'terms': ('/terms', '/conditions'),
 'customers': ('/customers', '/clients'),
 'legacy': ('/lead-magnets', '/lead-magnets-fr')
}
LABELS = {
 'en': dict(customers='Customers',solution='Our solution',pricing='Pricing',faq='FAQ',about='About',careers='Careers',media='Media',contact='Contact',privacy='Privacy',terms='Terms',login='Log in',demo='Book a demo',who='Who we are'),
 'fr': dict(customers='Nos clients',solution='Notre solution',pricing='Tarifs',faq='FAQ',about='À propos',careers='Recrutement',media='Médias',contact='Contact',privacy='Confidentialité',terms='Conditions',login='Se connecter',demo='Réserver une démo',who='Qui sommes-nous')
}
def url(key, lang): return ROUTES[key][lang == 'fr']
def booking(lang, prefix, label=None):
 return f'''<div class="demo-booking">
  <button type="button" class="btn-get-started" data-book-demo data-disclosure-trigger aria-expanded="false" aria-controls="{prefix}-demo-options">{label or LABELS[lang]['demo']}</button>
  <div class="demo-booking-popover" id="{prefix}-demo-options" data-disclosure-panel hidden>
    <a class="demo-booking-person" href="https://calendar.app.google/91k1Mpontca7NGea6" target="_blank" rel="noopener noreferrer"><img class="demo-booking-avatar" src="/assets/team/axel-ceo.png" alt="" width="38" height="38"><span class="demo-booking-person-copy"><strong>Axel</strong><span>CEO</span></span><span aria-hidden="true">↗</span></a>
    <a class="demo-booking-person" href="https://calendar.app.google/AWQX2bxp8cnqtsaJ9" target="_blank" rel="noopener noreferrer"><img class="demo-booking-avatar" src="/assets/team/ilan-cto.jpg" alt="" width="38" height="38"><span class="demo-booking-person-copy"><strong>Ilan</strong><span>CTO</span></span><span aria-hidden="true">↗</span></a>
  </div>
</div>'''
def company_link(key,lang,label=None):
 label=label or LABELS[lang][key]
 if key in ['media','customers']: return f'<span class="nav-disabled" role="link" aria-disabled="true">{label}</span>'
 return f'<a href="{url(key,lang)}">{label}</a>'
def header(lang,key):
 t=LABELS[lang];links='\n'.join(f'<a href="{url(k,lang)}"'+(' aria-current="page"' if key==k else '')+f'>{t[k]}</a>' for k in ['solution','pricing'])
 about='\n'.join(company_link(k,lang,t["who"] if k=="about" else t[k]) for k in ['about','careers','media'])
 return f'''<header class="header">
  <div class="header-inner">
    <a href="{url('home',lang)}" class="logo"><img src="/assets/logo-black-narrow.png" alt="" class="logo-icon" width="20" height="20">Synthetic Swarm</a>
    <nav class="nav-links" aria-label="{'Navigation principale' if lang=='fr' else 'Main navigation'}">
      {links}
      <div class="about-menu">
        <button type="button" class="nav-link-dropdown" data-disclosure-trigger aria-expanded="false" aria-controls="header-about-options">{t['about']} <span aria-hidden="true">⌄</span></button>
        <div class="about-menu-panel" id="header-about-options" data-disclosure-panel hidden>{about}</div>
      </div>
    </nav>
    <div class="nav-actions">
      <div class="language-menu">
        <button type="button" class="language-trigger" data-disclosure-trigger aria-expanded="false" aria-controls="header-language-options" aria-label="{'Choisir la langue' if lang=='fr' else 'Choose language'}">{lang.upper()} <span aria-hidden="true">▾</span></button>
        <div class="language-panel" id="header-language-options" data-disclosure-panel hidden>
          <a href="{url(key,lang)}" data-lang="{lang}" lang="{lang}" aria-current="true">{lang.upper()}</a>
          <a href="{url(key,'en' if lang=='fr' else 'fr')}" data-lang="{'en' if lang=='fr' else 'fr'}" lang="{'en' if lang=='fr' else 'fr'}">{'EN' if lang=='fr' else 'FR'}</a>
        </div>
      </div>
      <a href="https://app.syntheticswarm.ai/ui/" class="btn-login" target="_blank" rel="noopener noreferrer">{'Connexion' if lang=='fr' else 'Log in'}</a>
      {booking(lang,'header','Démo' if lang=='fr' else 'Demo')}
    </div>
  </div>
</header>'''
def footer(lang):
 t=LABELS[lang]
 groups=[('Produit' if lang=='fr' else 'Product',['solution','pricing','faq']),('Entreprise' if lang=='fr' else 'Company',['about','customers','careers','media','contact']),('Informations légales' if lang=='fr' else 'Legal',['privacy','terms'])]
 columns=''.join('<div><h2>'+title+'</h2><ul>'+''.join('<li>'+company_link(k,lang)+'</li>' for k in keys)+'</ul></div>' for title,keys in groups)
 return f'''<footer class="footer site-footer">
  <div class="site-footer-top"><a href="{url('home',lang)}" class="logo">Synthetic Swarm</a><p>{'La bonne personne. Le bon signal. Le bon moment.' if lang=='fr' else 'The right person. The right signal. The right time.'}</p></div>
  <nav class="site-footer-columns" aria-label="{'Pied de page' if lang=='fr' else 'Footer'}">
    {columns}
    <div><h2>{'Compte' if lang=='fr' else 'Account'}</h2><ul><li><a href="https://app.syntheticswarm.ai/ui/" target="_blank" rel="noopener noreferrer">{t['login']}</a></li><li>{booking(lang,'footer')}</li></ul></div>
  </nav>
  <p class="site-footer-copy">© 2026 Synthetic Swarm</p>
</footer>'''
def page(key,lang,title,description,body):
 canonical='https://www.syntheticswarm.ai'+url(key,lang)
 html=f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#fcfbf8">
  <title>{escape(title)} — Synthetic Swarm</title>
  <meta name="description" content="{escape(description,quote=True)}">
  <link rel="canonical" href="{canonical}">
  <link rel="alternate" hreflang="en" href="https://www.syntheticswarm.ai{url(key,'en')}">
  <link rel="alternate" hreflang="fr" href="https://www.syntheticswarm.ai{url(key,'fr')}">
  <link rel="icon" href="/assets/favicon.png" type="image/png">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/site-pages.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
</head>
<body>
  <a href="#main" class="skip-link">{'Aller au contenu' if lang=='fr' else 'Skip to content'}</a>
  {header(lang,key)}
  <main id="main" class="content-page">{body}</main>
  {footer(lang)}
  <script src="/mobile-menu.js"></script>
</body>
</html>
'''
 filename=url(key,lang).lstrip('/') or 'index'
 (ROOT/(filename+'.html')).write_text(html)
def sync(headers=True,footers=True):
 for key, paths in ROUTES.items():
  for lang, route in zip(['en','fr'],paths):
   p=ROOT/((route.lstrip('/') or 'index')+'.html')
   if not p.exists():continue
   s=p.read_text()
   if headers:s=re.sub(r'<header class="header">.*?</header>',lambda _:header(lang,key),s,flags=re.S)
   if footers:s=re.sub(r'<footer class="footer[^\"]*">.*?</footer>',lambda _:footer(lang),s,flags=re.S)
   if '/site-pages.css' not in s:s=s.replace('</head>','  <link rel="stylesheet" href="/site-pages.css">\n</head>')
   p.write_text(s)
def sync_conversion():
 # Dedicated pricing HTML is the source for homepage pricing and purchase FAQ.
 for lang in ['en', 'fr']:
  pricing=(ROOT/('pricing-fr.html' if lang=='fr' else 'pricing.html')).read_text()
  home=ROOT/('index-fr.html' if lang=='fr' else 'index.html')
  html=home.read_text()
  if '<!-- SHARED PRICING START -->' not in html: continue
  body=re.search(r'<section class="pricing-section"[^>]*>(.*?)</section>',pricing,re.S)[1]
  faq=re.search(r'<div class="pricing-objections reveal">(.*?)</div>',body,re.S)
  pricing_body=body[:faq.start()].strip().replace('<h1 ', '<h2 ').replace('</h1>', '</h2>')
  pricing_section='<section id="pricing" class="pricing-section">'+pricing_body+'</section>'
  faq_section='<section id="faq" class="pricing-objections home-purchase-faq">'+faq[1].replace('<h3>', '<h2>').replace('</h3>', '</h2>')+'</section>'
  html=re.sub(r'<!-- SHARED PRICING START -->.*?<!-- SHARED PRICING END -->',lambda _: '<!-- SHARED PRICING START -->'+pricing_section+'<!-- SHARED PRICING END -->',html,flags=re.S)
  html=re.sub(r'<!-- SHARED FAQ START -->.*?<!-- SHARED FAQ END -->',lambda _: '<!-- SHARED FAQ START -->'+faq_section+'<!-- SHARED FAQ END -->',html,flags=re.S)
  home.write_text(html)
if __name__=='__main__':
 sync()
 sync_conversion()
