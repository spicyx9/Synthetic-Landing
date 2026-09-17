/* One renderer for customer pages and the future homepage preview. */
(function (root) {
  'use strict';
  const text = value => typeof value === 'string' ? value.trim() : '';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const localized = (value, lang) => typeof value === 'string' ? text(value) : text(value && value[lang]);
  function safeUrl(value, profile = false) {
    const raw = text(value);
    if (!profile && /^\/(?!\/)[^\\]+$/.test(raw)) return raw;
    try {
      const url = new URL(raw);
      if (url.protocol !== 'https:' || url.username || url.password) return '';
      if (profile && (!(url.hostname === 'linkedin.com' || url.hostname.endsWith('.linkedin.com')) || !url.pathname.startsWith('/in/'))) return '';
      return url.href;
    } catch (_) { return ''; }
  }
  const quote = (customer, lang) => text(customer[lang === 'fr' ? 'testimonialFr' : 'testimonialEn']) || text(customer.testimonial);
  function records(data, lang, preview = false) {
    return (Array.isArray(data.customers) ? data.customers : []).filter(c => c && c.verified === true && text(c.name) &&
      (c.kind === 'identity' ? !preview && text(c.company) : quote(c, lang)));
  }
  function identity(customer) {
    const name = text(customer.name), photo = safeUrl(customer.photo), link = safeUrl(customer.linkedinUrl, true);
    const initials = name.split(/\s+/).filter(Boolean).map(word => Array.from(word)[0]).slice(0, 2).join('');
    const avatar = photo ? `<img class="customer-avatar" src="${escape(photo)}" alt="${escape(name)}" width="48" height="48" loading="lazy">` : `<span class="customer-avatar customer-initials" aria-hidden="true">${escape(initials)}</span>`;
    const info = `<span class="customer-person-copy"><strong>${escape(name)}</strong><span>${escape([text(customer.role), text(customer.company)].filter(Boolean).join(' · '))}</span></span>`;
    return link ? `<a class="customer-person" href="${escape(link)}" target="_blank" rel="noopener noreferrer">${avatar}${info}<span aria-hidden="true">↗</span></a>` : `<div class="customer-person">${avatar}${info}</div>`;
  }
  function card(customer, lang, index) {
    const isIdentity = customer.kind === 'identity';
    const metric = localized(customer.metric, lang);
    const date = text(customer.date);
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
    const displayedDate = validDate ? new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {dateStyle:'long',timeZone:'UTC'}).format(new Date(date)) : '';
    return `<article class="customer-card${!isIdentity && index % 4 === 0 ? ' customer-card--wide' : ''}${isIdentity ? ' customer-card--identity' : ''}">${!isIdentity ? `<blockquote><p>${escape(quote(customer, lang))}</p></blockquote>` : ''}${metric ? `<p class="customer-result">${escape(metric)}</p>` : ''}${identity(customer)}${validDate ? `<time datetime="${escape(date)}">${escape(displayedDate)}</time>` : ''}</article>`;
  }
  function statCards(data, lang) {
    return (Array.isArray(data.statistics) ? data.statistics : []).filter(s => s && s.enabled === true &&
      (typeof s.value === 'string' ? text(s.value).length > 0 : typeof s.value === 'number' && Number.isFinite(s.value)) && text(s[lang === 'fr' ? 'labelFr' : 'labelEn']))
      .map(s => `<article class="customer-card customer-stat"><p class="customer-stat-value">${escape(s.value)}</p><p>${escape(s[lang === 'fr' ? 'labelFr' : 'labelEn'])}</p></article>`);
  }
  function render(data, lang, preview = false) {
    const items = records(data || {}, lang, preview);
    if (preview && items.length < 3) return '';
    const cards = (preview ? items.slice(0, 3) : items).map((c, i) => card(c, lang, preview ? 1 : i));
    if (!preview) cards.splice(Math.min(2, cards.length), 0, ...statCards(data || {}, lang));
    return cards.join('');
  }
  const api = { render, records, safeUrl };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    root.CustomerStories = api;
    const hosts = [...document.querySelectorAll('[data-customer-stories]')];
    if (!hosts.length) return;
    fetch('/assets/data/customers.json').then(response => {
      if (!response.ok) throw new Error('Customer data unavailable');
      return response.json();
    }).then(data => {
      hosts.forEach(host => {
        const preview = host.hasAttribute('data-customer-preview');
        const lang = document.documentElement.lang === 'fr' ? 'fr' : 'en';
        const markup = render(data, lang, preview);
        host.querySelector('[data-customer-grid]').innerHTML = markup;
        if (preview) host.hidden = !markup;
        else {
          const empty = host.querySelector('[data-customer-empty]');
          empty.hidden = records(data, lang).length > 0;
        }
      });
    }).catch(() => { /* Keep the static empty state and the homepage preview hidden. */ });
  }
})(typeof window !== 'undefined' ? window : this);
