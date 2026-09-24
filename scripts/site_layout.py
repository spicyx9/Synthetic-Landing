"""Shared static layout. Run python3 scripts/site_layout.py after editing navigation.
Pages remain ordinary HTML served directly by Vercel; no build service is required.
"""
from pathlib import Path
from html import escape
import re
# Public marketing must not expose data sources, registries or collection infrastructure.
# Describe detected changes, customer value and delivered outcomes only.
ROOT = Path(__file__).resolve().parent.parent
ROUTES = {
 'home': ('/', '/index-fr'), 'solution': ('/our-solution', '/notre-solution'),
 'pricing': ('/pricing', '/tarifs'), 'faq': ('/faq', '/faq-fr'),
 'about': ('/about', '/a-propos'), 'careers': ('/careers', '/recrutement'),
 'media': ('/media', '/medias'), 'contact': ('/contact', '/contact-fr'),
 'privacy': ('/privacy', '/confidentialite'), 'terms': ('/terms', '/conditions'),
 'notice': ('/legal-notice', '/mentions-legales'), 'opposition': ('/opt-out', '/opposition'),
 'customers': ('/customers', '/clients')
}
LABELS = {
 'en': dict(notice='Legal Notice',opposition='Opt out',customers='Customers',solution='Our solution',pricing='Pricing',faq='FAQ',about='About',careers='Careers',media='Media',contact='Contact',privacy='Privacy',terms='Terms',login='Log in',demo='Book a demo',who='Who we are'),
 'fr': dict(notice='Mentions légales',opposition='Opposition',customers='Nos clients',solution='Notre solution',pricing='Tarifs',faq='FAQ',about='À propos',careers='Recrutement',media='Médias',contact='Contact',privacy='Confidentialité',terms='Conditions',login='Se connecter',demo='Réserver une démo',who='Qui sommes-nous')
}
def url(key, lang): return ROUTES[key][lang == 'fr']
def booking(lang, prefix, label=None):
 if prefix != "header":
  return f'<div class="demo-booking"><a class="btn-get-started" data-book-demo href="https://calendar.app.google/91k1Mpontca7NGea6" target="_blank" rel="noopener noreferrer">{label or LABELS[lang]["demo"]}</a></div>'
 return f'''<div class="demo-booking">
  <button type="button" class="btn-get-started{' header-action' if prefix == 'header' else ''}" data-book-demo data-disclosure-trigger aria-expanded="false" aria-controls="{prefix}-demo-options">{label or LABELS[lang]['demo']}</button>
  <div class="demo-booking-popover" id="{prefix}-demo-options" data-disclosure-panel hidden>
    <a class="demo-booking-person" href="https://calendar.app.google/91k1Mpontca7NGea6" target="_blank" rel="noopener noreferrer"><img class="demo-booking-avatar" src="/assets/team/axel-ceo.png" alt="" width="38" height="38"><span class="demo-booking-person-copy"><strong>Axel</strong><span>CEO</span></span><span aria-hidden="true">↗</span></a>
    <a class="demo-booking-person" href="https://calendar.app.google/91k1Mpontca7NGea6" target="_blank" rel="noopener noreferrer"><img class="demo-booking-avatar" src="/assets/team/ilan-cto.jpg" alt="" width="38" height="38"><span class="demo-booking-person-copy"><strong>Ilan</strong><span>CTO</span></span><span aria-hidden="true">↗</span></a>
  </div>
</div>'''
def company_link(key,lang,label=None):
 label=label or LABELS[lang][key]
 if key in ['media','customers']: return f'<span class="nav-disabled" role="link" aria-disabled="true">{label}</span>'
 return f'<a href="{url(key,lang)}">{label}</a>'
def dropdown_chevron():
 return '<svg class="dropdown-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M2 3.5 5 6.5 8 3.5Z"/></svg>'
def header(lang,key):
 t=LABELS[lang];links='\n'.join(f'<a href="{url(k,lang)}"'+(' aria-current="page"' if key==k else '')+f'>{t[k]}</a>' for k in ['solution','pricing'])
 about='\n'.join(company_link(k,lang,t["who"] if k=="about" else t[k]) for k in ['about','careers','media'])
 return f'''<header class="header">
  <div class="header-inner">
    <a href="{url('home',lang)}" class="logo"><img src="/assets/img/logo-black-narrow.png" alt="" class="logo-icon" width="20" height="20">Synthetic Swarm</a>
    <nav class="nav-links" aria-label="{'Navigation principale' if lang=='fr' else 'Main navigation'}">
      {links}
      <div class="about-menu">
        <button type="button" class="nav-link-dropdown shared-chevron-trigger" data-disclosure-trigger aria-expanded="false" aria-controls="header-about-options">{t['about']} {dropdown_chevron()}</button>
        <div class="about-menu-panel" id="header-about-options" data-disclosure-panel hidden>{about}</div>
      </div>
    </nav>
    <div class="nav-actions">
      <div class="language-menu">
        <button type="button" class="language-trigger shared-chevron-trigger" data-disclosure-trigger aria-expanded="false" aria-controls="header-language-options" aria-label="{'Choisir la langue' if lang=='fr' else 'Choose language'}">{lang.upper()} {dropdown_chevron()}</button>
        <div class="language-panel" id="header-language-options" data-disclosure-panel hidden>
          <a href="{url(key,lang)}" data-lang="{lang}" lang="{lang}" aria-current="true">{lang.upper()}</a>
          <a href="{url(key,'en' if lang=='fr' else 'fr')}" data-lang="{'en' if lang=='fr' else 'fr'}" lang="{'en' if lang=='fr' else 'fr'}">{'EN' if lang=='fr' else 'FR'}</a>
        </div>
      </div>
      <a href="https://app.syntheticswarm.ai/ui/" class="btn-login header-action" target="_blank" rel="noopener noreferrer">{'Connexion' if lang=='fr' else 'Log in'}</a>
      {booking(lang,'header','Démo' if lang=='fr' else 'Demo')}
    </div>
  </div>
</header>'''
def footer(lang):
 t=LABELS[lang]
 fr=lang=='fr'
 groups=[('Produit' if fr else 'Product',['solution','pricing','faq']),('Entreprise' if fr else 'Company',['about','customers','careers','media','contact']),('Légal' if fr else 'Legal',['notice','privacy','terms','opposition'])]
 columns=''.join('<div><h2>'+title+'</h2><ul>'+''.join('<li>'+company_link(k,lang)+'</li>' for k in keys)+'</ul></div>' for title,keys in groups)
 return f'''<footer class="footer site-footer brand-close">
  <div class="brand-close-inner">
    <div class="brand-close-statement">
      <div class="brand-close-copy">
        <h2>{'Sachez qui appeler.' if fr else 'Know who to call.'}<span>{'Au bon moment.' if fr else 'At the right time.'}</span></h2>
        <p>{'Synthetic Swarm détecte les changements qui comptent et transforme ces signaux en prospects prêts à contacter.' if fr else 'Synthetic Swarm detects the changes that matter and turns them into prospects ready to contact.'}</p>
      </div>
      <div class="brand-close-actions">
        <div class="brand-close-cta">{booking(lang,'footer')}<a class="brand-close-solution" href="{url('solution',lang)}">{'Voir notre solution' if fr else 'Explore our solution'}<span aria-hidden="true"> →</span></a></div>
        <section id="newsletter" class="brand-close-newsletter" aria-labelledby="newsletter-title">
          <h2 id="newsletter-title">{'Restez informé' if fr else 'Stay in the loop'}</h2>
          <p>{'Recevez nos nouveautés produit et annonces importantes.' if fr else 'Get product updates and important announcements.'}</p>
          <form class="newsletter-form" data-newsletter-form aria-label="Newsletter" method="post" action="/api/newsletter">
            <div class="brand-close-fields"><input type="email" name="email" required maxlength="254" aria-label="{'Votre email' if fr else 'Your email'}" placeholder="{'Votre email' if fr else 'Your email'}" autocomplete="email"><button type="submit">{'S’inscrire' if fr else 'Subscribe'}</button></div>
            <input class="newsletter-honeypot" type="text" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true">
            <p data-newsletter-status role="status" aria-live="polite" aria-atomic="true"></p>
          </form>
        </section>
      </div>
    </div>
    <div class="brand-close-navigation">
      <div class="brand-close-identity"><a href="{url('home',lang)}" class="logo"><img src="/assets/img/logo-black-narrow.png" alt="" width="23" height="28">Synthetic Swarm</a><p>{'Sachez qui appeler. Au bon moment.' if fr else 'Know who to call. At the right time.'}</p><a class="brand-close-login" href="https://app.syntheticswarm.ai/ui/" target="_blank" rel="noopener noreferrer">{t['login']}</a></div>
      <nav class="site-footer-columns" aria-label="{'Pied de page' if fr else 'Footer'}">{columns}</nav>
    </div>
    <div class="brand-close-bottom"><p>© 2026 Synthetic Swarm. {'Tous droits réservés.' if fr else 'All rights reserved.'}</p></div>
  </div>
</footer>'''
def motion_assets(key):
 module = {'home': 'home-motion', 'solution': 'solution-motion', 'about': 'editorial-motion', 'careers': 'editorial-motion'}.get(key)
 assets = ['  <link rel="stylesheet" href="/css/motion.css?v=3">', '  <script src="/js/motion.js?v=main-audit-1" defer></script>']
 if module: assets.append(f'  <script src="/js/{module}.js?v={"main-audit-1" if module == "solution-motion" else "home-refresh-20260922" if module == "home-motion" else "1"}" defer></script>')
 assets.append('  <script src="/js/page-motion.js?v=2" defer></script>')
 return '\n'.join(assets)

def page(key,lang,title,description,body):
 canonical='https://www.syntheticswarm.ai'+url(key,lang)
 html=f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#fcfbf8">
  <title>{escape(title)} | Synthetic Swarm</title>
  <meta name="description" content="{escape(description,quote=True)}">
  <link rel="canonical" href="{canonical}">
  <link rel="alternate" hreflang="en" href="https://www.syntheticswarm.ai{url(key,'en')}">
  <link rel="alternate" hreflang="fr" href="https://www.syntheticswarm.ai{url(key,'fr')}">
  <link rel="alternate" hreflang="x-default" href="https://www.syntheticswarm.ai{url(key,'en')}">
  <link rel="icon" href="/assets/img/favicon.png" type="image/png">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="/css/site-pages.css?v=header-actions-2">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@1&amp;family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
{motion_assets(key)}
</head>
<body>
  <a href="#main" class="skip-link">{'Aller au contenu' if lang=='fr' else 'Skip to content'}</a>
  {header(lang,key)}
  <main id="main" class="content-page">{body}</main>
  {footer(lang)}
  <script src="/js/mobile-menu.js"></script>
  <script src="/js/newsletter.js" defer></script>
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
   if footers and key=='home':
    s=re.sub(r'<section id="newsletter" class="prefooter-signup.*?</section>', '', s, flags=re.S)
   if footers:
    s=s.replace('family=Inter:', 'family=DM+Serif+Display:ital@1&amp;family=Inter:') if 'family=DM+Serif+Display' not in s else s
    s=re.sub(r'/css/site-pages.css(?:\?[^"\s]*)?', '/css/site-pages.css?v=brand-close-1', s)
   if footers:s=re.sub(r'<footer class="footer[^\"]*">.*?</footer>',lambda _:footer(lang),s,flags=re.S)
   if '/css/site-pages.css' not in s:s=s.replace('</head>','  <link rel="stylesheet" href="/css/site-pages.css?v=header-actions-2">\n</head>')
   if '/js/motion.js' not in s:s=s.replace('</head>',motion_assets(key)+'\n</head>')
   if 'data-newsletter-form' in s and '/js/newsletter.js' not in s:s=s.replace('</body>','  <script src="/js/newsletter.js" defer></script>\n</body>')
   p.write_text(s)
def sync_conversion():
 # Dedicated pricing HTML is the source for homepage pricing and purchase FAQ.
 for lang in ['en', 'fr']:
  pricing=(ROOT/('tarifs.html' if lang=='fr' else 'pricing.html')).read_text()
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
