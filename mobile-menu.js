/**
 * Mobile hamburger menu — injects a hamburger button + overlay into the existing nav.
 * Auto-clones nav-links + nav-actions into a properly-nested mobile overlay:
 *   - Top-level links (e.g. Tarifs) are surfaced FIRST as primary nav rows.
 *   - Dropdowns become labelled sections with their internal sub-section headers
 *     (e.g. SOLUTIONS > Pour qui / Cas d'usage).
 * No HTML changes needed per-page; just include this script before </body>.
 */
(function() {
  const headerInner = document.querySelector('.header-inner');
  if (!headerInner) return;

  // 1. Build hamburger button
  const hamburger = document.createElement('button');
  hamburger.className = 'mobile-menu-toggle';
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  headerInner.appendChild(hamburger);

  // 2. Build overlay shell
  const overlay = document.createElement('div');
  overlay.className = 'mobile-menu-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = ''
    + '<div class="mobile-menu-panel">'
    + '<div class="mobile-menu-header">'
    + '<span class="mobile-menu-brand">Menu</span>'
    + '<button class="mobile-menu-close" aria-label="Close menu">'
    + '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
    + '</button>'
    + '</div>'
    + '<nav class="mobile-menu-body"></nav>'
    + '<div class="mobile-menu-footer"></div>'
    + '</div>';

  const menuBody = overlay.querySelector('.mobile-menu-body');
  const menuFooter = overlay.querySelector('.mobile-menu-footer');

  // 3. Clone nav-links into the body with proper hierarchy
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    const topLevelLinks = [];
    const dropdowns = [];

    // Separate top-level <a> from dropdowns
    [...navLinks.children].forEach(node => {
      if (node.tagName === 'A') {
        topLevelLinks.push(node);
      } else if (node.classList.contains('nav-dropdown-wrap')) {
        dropdowns.push(node);
      }
    });

    // 3a. Surface top-level links FIRST (as primary nav, e.g. Tarifs)
    if (topLevelLinks.length) {
      const primarySection = document.createElement('div');
      primarySection.className = 'mobile-menu-section mobile-menu-section--primary';
      topLevelLinks.forEach(node => {
        const a = document.createElement('a');
        a.href = node.getAttribute('href') || '#';
        a.className = 'mobile-menu-link mobile-menu-link--primary';
        a.textContent = node.textContent.trim();
        primarySection.appendChild(a);
      });
      menuBody.appendChild(primarySection);
    }

    // 3b. Then expand each dropdown with proper sub-sections
    dropdowns.forEach(node => {
      const trigger = node.querySelector('.nav-link-dropdown');
      if (!trigger) return;
      const triggerText = (trigger.firstChild && trigger.firstChild.textContent || trigger.textContent).trim();

      const topLabel = document.createElement('span');
      topLabel.className = 'mobile-menu-section-label mobile-menu-section-label--top';
      topLabel.textContent = triggerText;
      menuBody.appendChild(topLabel);

      // Look for `.mega-section` (Solutions style) or `.mega-col` (Resources style)
      const subSections = node.querySelectorAll('.mega-section, .mega-col');

      if (subSections.length) {
        subSections.forEach(sub => {
          const subLabel = sub.querySelector('.mega-label');
          if (subLabel) {
            const subLabelEl = document.createElement('span');
            subLabelEl.className = 'mobile-menu-section-label mobile-menu-section-label--sub';
            subLabelEl.textContent = subLabel.textContent.trim();
            menuBody.appendChild(subLabelEl);
          }

          // Items can be .mega-item (regular link) or .mega-card (announcement)
          sub.querySelectorAll('.mega-item, .mega-card').forEach(item => {
            const href = item.getAttribute('href') || '#';
            const strong = item.querySelector('strong');
            const label = strong ? strong.textContent.trim() : item.textContent.trim().split('\n')[0].trim();
            const a = document.createElement('a');
            a.href = href;
            a.className = 'mobile-menu-link mobile-menu-link--sub';
            a.textContent = label;
            // External links should keep their target
            if (item.getAttribute('target')) a.setAttribute('target', item.getAttribute('target'));
            menuBody.appendChild(a);
          });
        });
      } else {
        // Fallback: no sub-sections found, list all .mega-item flat
        node.querySelectorAll('.mega-item').forEach(item => {
          const href = item.getAttribute('href') || '#';
          const strong = item.querySelector('strong');
          const label = strong ? strong.textContent.trim() : item.textContent.trim();
          const a = document.createElement('a');
          a.href = href;
          a.className = 'mobile-menu-link mobile-menu-link--sub';
          a.textContent = label;
          menuBody.appendChild(a);
        });
      }
    });
  }

  // 4. Clone lang-toggle + buttons into footer
  const navActions = document.querySelector('.nav-actions');
  if (navActions) {
    const toggle = navActions.querySelector('.lang-toggle');
    if (toggle) {
      const clone = toggle.cloneNode(true);
      clone.querySelectorAll('.lang-toggle-link').forEach(link => {
        link.addEventListener('click', function() {
          try { localStorage.setItem('lang', link.getAttribute('data-lang')); } catch(e) {}
        });
      });
      menuFooter.appendChild(clone);
    }
    const login = navActions.querySelector('.btn-login');
    const getStarted = navActions.querySelector('.btn-get-started');
    if (login) menuFooter.appendChild(login.cloneNode(true));
    if (getStarted) menuFooter.appendChild(getStarted.cloneNode(true));
  }

  document.body.appendChild(overlay);

  // 5. Open / close behaviour
  function open() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', open);
  overlay.querySelector('.mobile-menu-close').addEventListener('click', close);

  overlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', close);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
})();

/**
 * Homepage FAQ — the same three buying objections are repeated near the bottom
 * of the main site, while the pricing page keeps them directly below checkout.
 */
(function() {
  if (!document.body.classList.contains('home')) return;
  const footer = document.querySelector('.footer');
  if (!footer || document.querySelector('.home-faq')) return;

  const isFr = document.documentElement.lang.toLowerCase().startsWith('fr');
  const copy = isFr ? {
    title: 'Questions fréquentes',
    items: [
      ['Comment ça marche concrètement ?', "Vous nous donnez vos critères de ciblage : métier, taille d'entreprise, secteur géographique. Nous surveillons en continu pour détecter les dirigeants dont un besoin en assurance apparaît. Chaque semaine, vous recevez des fiches vérifiées, avec le signal daté qui explique pourquoi appeler maintenant."],
      ["Quelles informations j'obtiens ?", "Nom et prénom du dirigeant, téléphone portable (et ligne fixe si disponible), email et profil LinkedIn. Plus la raison de l'appel : le changement de situation que nous avons détecté, avec sa date."],
      ["Est-ce que j'ai le droit d'appeler ces personnes ?", "Oui. La prospection téléphonique entre professionnels peut être fondée sur l'intérêt légitime lorsque l'offre est en rapport avec la profession de la personne appelée. La personne doit être informée et pouvoir s'opposer simplement et gratuitement. Le consentement préalable instauré le 11 août 2026 concerne le démarchage des consommateurs."]
    ]
  } : {
    title: 'Frequently asked questions',
    items: [
      ['How does it work in practice?', 'You give us your targeting criteria: profession, company size and geographic area. We continuously monitor for executives whose situation creates a new insurance need. Every week, you receive verified prospect profiles with the dated signal explaining why now is the right time to call.'],
      ['What information do I get?', "The executive's first and last name, mobile number (and landline when available), email and LinkedIn profile. You also get the reason for the call: the change in situation we detected, with its date."],
      ['Am I allowed to call these people?', "Yes, for B2B prospecting in France when the solicitation is related to the person's profession. The person must be informed and able to opt out easily and free of charge. The prior-consent rule introduced on August 11, 2026 concerns consumer telemarketing."]
    ]
  };

  const style = document.createElement('style');
  style.textContent = '.home-faq{max-width:760px;margin:0 auto;padding:72px 24px 88px}.home-faq h2{text-align:center;font-size:34px;font-weight:800;letter-spacing:-.03em;margin:0 0 30px;color:#1a1a1a}.home-faq details{border-top:1px solid rgba(0,0,0,.09)}.home-faq details:last-child{border-bottom:1px solid rgba(0,0,0,.09)}.home-faq summary{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:21px 2px;cursor:pointer;list-style:none;font-size:15px;font-weight:700;color:#1a1a1a}.home-faq summary::-webkit-details-marker{display:none}.home-faq summary:after{content:"+";font-size:21px;font-weight:400;color:#777}.home-faq details[open] summary:after{content:"−"}.home-faq p{margin:-4px 0 21px;color:#5f5f5f;font-size:14px;line-height:1.65}@media(max-width:600px){.home-faq{padding:52px 20px 64px}.home-faq h2{font-size:27px}.home-faq summary{font-size:14px}}';
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.className = 'home-faq';
  const title = document.createElement('h2');
  title.textContent = copy.title;
  section.appendChild(title);

  copy.items.forEach(function(item, index) {
    const details = document.createElement('details');
    if (index === 0) details.open = true;
    const summary = document.createElement('summary');
    summary.textContent = item[0];
    const paragraph = document.createElement('p');
    paragraph.textContent = item[1];
    details.appendChild(summary);
    details.appendChild(paragraph);
    section.appendChild(details);
  });

  footer.parentNode.insertBefore(section, footer);
})();
