const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));

for (const name of pages) {
  test(`${name}: source content, shared header and local assets`, () => {
    const html = read(name);
    assert.doesNotMatch(html, /Pro Solo|Pro Studio|\b(?:49|149)\s*€/i);
    if (!["about.html", "a-propos.html"].includes(name)) assert.doesNotMatch(html, /hyperstack/i);
    else {
      assert.equal((html.match(/Hyperstack/g) || []).length, 1);
      assert.doesNotMatch(html, /hyperstack\.studio/i);
    }
    const login = html.match(/<a\b[^>]*class="btn-login header-action"[^>]*>/)[0];
    for (const attr of ['href="https://app.syntheticswarm.ai/ui/"', 'target="_blank"', 'rel="noopener noreferrer"']) assert.ok(login.includes(attr));
    assert.match(html, /<button[^>]*data-book-demo[^>]*aria-expanded="false"/);
    for (const calendar of ['91k1Mpontca7NGea6']) {
      assert.match(html, new RegExp(`<a[^>]*href="https://calendar.app.google/${calendar}"[^>]*target="_blank"[^>]*rel="noopener noreferrer"`));
    }
    assert.match(html, /src="\/assets\/team\/axel-ceo.png"/);
    assert.match(html, /src="\/assets\/team\/ilan-cto.jpg"/);
    assert.doesNotMatch(html, />IS<\/span>/);
    assert.doesNotMatch(html, /avatars\.githubusercontent|heroEyebrowDate/);
    const outsideHeader = html.replace(/<header[\s\S]*?<\/header>/, '');
    assert.doesNotMatch(outsideHeader, /<button[^>]*data-book-demo/);
    for (const cta of outsideHeader.matchAll(/<a[^>]*data-book-demo[^>]*>/g)) {
      assert.ok(cta[0].includes('href="https://calendar.app.google/91k1Mpontca7NGea6"'));
    }
    const header = html.match(/<header[\s\S]*?<\/header>/)[0];
    const chevrons = [...header.matchAll(/<svg class="dropdown-chevron"[\s\S]*?<\/svg>/g)].map(m => m[0]);
    assert.equal(chevrons.length, 2);
    assert.equal(chevrons[0], chevrons[1]);
    assert.doesNotMatch(header, /[⌄▾∨]/);
    const footer = html.match(/<footer[\s\S]*?<\/footer>/)[0];
    assert.doesNotMatch(header + footer, /href="#"|Lead magnets|Keyword targeting|Multichannel outreach|Resources|Ressources/i);
    assert.doesNotMatch(header.match(/<nav[\s\S]*?<\/nav>/)[0], /href="\/(?:faq(?:-fr)?|clients|customers)"/);
    assert.doesNotMatch(header.match(/<nav[\s\S]*?<\/nav>/)[0], /href="\/contact(?:-fr)?"/);
    assert.match(footer, /href="\/contact(?:-fr)?"/);
    assert.match(footer, /aria-disabled="true">(?:Media|Médias)<\/span>/);
    assert.match(footer, /href="\/(?:careers|recrutement)"/);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, 'duplicate IDs');
    for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      if (/^(https?:|#|mailto:|tel:)/.test(url)) continue;
      let local = url.split(/[?#]/)[0].replace(/^\//, '') || 'index.html';
      if (!path.extname(local)) local += '.html';
      assert.ok(fs.existsSync(path.join(root, local)), `missing target ${url}`);
    }
    for (const [, attrs, script] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/type="application\/ld\+json"/.test(attrs)) JSON.parse(script);
      else new vm.Script(script);
    }
  });
}

for (const lang of ['en', 'fr']) {
  test(`${lang}: pricing configurator states`, () => {
    const fr = lang === 'fr';
    const html = read(fr ? 'tarifs.html' : 'pricing.html');
    const copy = fr
      ? { discovery: 'Découverte', custom: 'Sur mesure', title: 'Mode découverte', lede: 'Essayez Synthetic Swarm pendant 60 jours.', grants: ['<strong>10 prospects</strong> à l’activation', '<strong>+10 prospects</strong> après 30 jours'], cta: 'Activer le mode découverte', weekly: 'Fiches vérifiées livrées chaque semaine', perWeek: 'prospects par semaine', choose: 'Choisir ce forfait', book: 'Réserver un rendez-vous', customQ: 'Plus de 100 prospects par semaine ?' }
      : { discovery: 'Discovery', custom: 'Custom', title: 'Discovery mode', lede: 'Explore Synthetic Swarm for 60 days.', grants: ['<strong>10 prospects</strong> on activation', '<strong>+10 prospects</strong> after 30 days'], cta: 'Activate discovery mode', weekly: 'Verified prospect profiles delivered every week', perWeek: 'prospects per week', choose: 'Choose this plan', book: 'Book a call', customQ: 'More than 100 prospects per week?' };

    // One card, one segmented control with exactly six choices, no slider.
    assert.equal([...html.matchAll(/class="pricing-config-card"/g)].length, 1);
    assert.doesNotMatch(html, /pricing-discovery-card|data-pricing-range|type="range"|data-pricing-step/);
    const labels = [...html.matchAll(/data-pricing-option="([^"]+)">([^<]+)</g)].map(m => [m[1], m[2]]);
    assert.deepEqual(labels, [['discovery', copy.discovery], ['10', '10'], ['20', '20'], ['50', '50'], ['100', '100'], ['custom', copy.custom]]);
    assert.match(html, /aria-checked="true" tabindex="0" data-pricing-option="20"/);
    assert.equal([...html.matchAll(/aria-checked="true"/g)].length, 1);
    assert.doesNotMatch(html, /\b200\b[^0-9]*(?:leads|prospects)|1499|300 /);

    // Discovery panel: its own copy only, no price, period or weekly wording.
    const discovery = html.match(/<div class="pricing-panel" data-pricing-panel="discovery" hidden>([\s\S]*?)\n        <\/div>/)[1];
    for (const text of [copy.title, copy.lede, ...copy.grants, copy.cta]) assert.ok(discovery.includes(text), text);
    assert.match(discovery, new RegExp(`href="https://app\\.syntheticswarm\\.ai/ui/\\?offer=discovery&amp;lang=${lang}"`));
    assert.doesNotMatch(discovery, /€|\/mois|\/month|per week|par semaine|chaque semaine|every week|Leads/i);
    assert.equal([...discovery.matchAll(/<li><span class="pricing-config-check"/g)].length, 3);

    // Weekly plan panel (default 20) and custom panel.
    const plan = html.match(/<div class="pricing-panel" data-pricing-panel="plan">([\s\S]*?)\n        <\/div>/)[1];
    for (const text of ['169 €', copy.perWeek, copy.weekly, copy.choose]) assert.ok(plan.includes(text), text);
    assert.match(plan, new RegExp(`href="https://app\\.syntheticswarm\\.ai/ui/\\?leads=20&amp;lang=${lang}"`));
    const custom = html.match(/<div class="pricing-panel" data-pricing-panel="custom" hidden>([\s\S]*?)\n        <\/div>\n      <\/div>/)[1];
    for (const text of [copy.custom, copy.customQ, copy.book, 'https://calendar.app.google/91k1Mpontca7NGea6', 'data-book-demo']) assert.ok(custom.includes(text), text);
    assert.doesNotMatch(custom, /€|leads=|offer=/);
    assert.equal((html.match(new RegExp(copy.cta, 'g')) || []).length, 1);
    assert.doesNotMatch(html, /gratuit|\bfree\b|offert/i);
    assert.equal([...html.matchAll(/<details class="pricing-faq-item">/g)].length, 3);
    assert.doesNotMatch(html, /<details[^>]*\bopen\b/);

    // Behaviour of pricing.js against a minimal DOM.
    const el = attrs => ({ attrs: { ...attrs }, dataset: {}, hidden: false, textContent: '', events: {}, tabIndex: -1,
      setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; }, addEventListener(k, f) { this.events[k] = f; }, focus() {} });
    const options = ['discovery', '10', '20', '50', '100', 'custom'].map(key => Object.assign(el(), { dataset: { pricingOption: key } }));
    const panels = ['discovery', 'plan', 'custom'].map(key => Object.assign(el(), { dataset: { pricingPanel: key } }));
    const amount = el(), leads = el(), checkout = el(), discoveryCta = el(), badge = el();
    const group = { querySelectorAll: () => options };
    const one = { '.pricing-options': group, '[data-pricing-amount]': amount, '[data-pricing-leads]': leads, '[data-pricing-checkout]': checkout, '[data-pricing-discovery-cta]': discoveryCta, '[data-pricing-badge]': badge };
    vm.runInNewContext(read('pricing.js'), { Intl, document: { documentElement: { lang }, querySelector: s => one[s], querySelectorAll: s => s === '[data-pricing-panel]' ? panels : [] } });
    const visible = () => panels.filter(p => !p.hidden).map(p => p.dataset.pricingPanel);
    const checked = () => options.filter(o => o.attrs['aria-checked'] === 'true').map(o => o.dataset.pricingOption);
    assert.deepEqual(checked(), ['20']);
    assert.deepEqual(visible(), ['plan']);
    assert.equal(amount.textContent, '169 €');
    assert.equal(badge.hidden, false);
    assert.equal(discoveryCta.attrs.href, `https://app.syntheticswarm.ai/ui/?offer=discovery&lang=${lang}`);
    const tiers = { 10: 89, 20: 169, 50: 399, 100: 789 };
    for (const key of ['10', '20', '50', '100', '20']) {
      options.find(o => o.dataset.pricingOption === key).events.click();
      assert.deepEqual(checked(), [key]);
      assert.deepEqual(visible(), ['plan']);
      assert.equal(amount.textContent.replace(/[^0-9]/g, ''), String(tiers[key]));
      assert.equal(leads.textContent, key);
      assert.equal(checkout.attrs.href, `https://app.syntheticswarm.ai/ui/?leads=${key}&lang=${lang}`);
      assert.equal(badge.hidden, key !== '20');
      assert.equal(options.find(o => o.dataset.pricingOption === key).tabIndex, 0);
    }
    options[0].events.click();
    assert.deepEqual(visible(), ['discovery']);
    assert.equal(badge.hidden, true);
    options[5].events.click();
    assert.deepEqual(visible(), ['custom']);
    // Arrow keys move the selection and wrap around.
    let prevented = false;
    options[5].events.keydown({ key: 'ArrowRight', preventDefault() { prevented = true; } });
    assert.ok(prevented);
    assert.deepEqual(checked(), ['discovery']);
    options[0].events.keydown({ key: 'End', preventDefault() {} });
    assert.deepEqual(checked(), ['custom']);
  });
}

test('fixed homepage news and static deployment configuration', () => {
  for (const name of ['index.html', 'index-fr.html']) {
    const html = read(name);
    assert.match(html, /class="hero-eyebrow-news">[^<]*San Francisco/);
    assert.doesNotMatch(html, /new Date\(|heroEyebrowDate/);
  }
  const config = JSON.parse(read('vercel.json'));
  assert.equal(config.cleanUrls, true);
  assert.equal(config.trailingSlash, false);
  assert.deepEqual(config.redirects.filter(rule => rule.source.startsWith('/lead-magnets')), [{ source: '/lead-magnets', destination: '/our-solution', permanent: true }, { source: '/lead-magnets-fr', destination: '/notre-solution', permanent: true }]);
});

test('all shared JavaScript parses', () => {
  for (const name of fs.readdirSync(root).filter(name => name.endsWith('.js'))) new vm.Script(read(name));
});
