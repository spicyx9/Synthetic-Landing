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
  test(`${lang}: pricing defaults and every interactive tier`, () => {
    const html = read(lang === 'fr' ? 'tarifs.html' : 'pricing.html');
    assert.equal([...html.matchAll(/class="pricing-config-card"/g)].length, 1);
    assert.match(html, /data-pricing-range[^>]*value="2"/);
    assert.doesNotMatch(html, /quand disponibles|when available|location\.replace/);
    assert.equal([...html.matchAll(/<details class="pricing-faq-item">/g)].length, 3);
    assert.doesNotMatch(html, /<details[^>]*\bopen\b/);
    const element = () => ({ textContent: '', dataset: {}, attrs: {}, events: {}, style: { setProperty() {} }, classList: { toggle() {} }, setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(k, v) { this.events[k] = v; } });
    const range = element(), amount = element(), checkout = element(), badge = element();
    range.value = '4'; // Simulate a browser restoring an old selection.
    const counters = [element(), element()], steps = Array.from({ length: 6 }, element);
    const period = element(), summary = element(), customCopy = element(), customBooking = element();
    const panel = element(), trigger = element();
    customBooking.querySelector = selector => selector === '[data-disclosure-panel]' ? panel : trigger;
    const selectors = { '[data-pricing-range]': range, '[data-pricing-amount]': amount, '[data-pricing-checkout]': checkout, '.pricing-config-badge': badge, '[data-pricing-period]': period, '[data-pricing-summary]': summary, '[data-pricing-custom-copy]': customCopy, '[data-pricing-custom-booking]': customBooking };
    vm.runInNewContext(read('pricing.js'), { Intl, document: { documentElement: { lang }, querySelector: s => selectors[s], querySelectorAll: s => s === '[data-pricing-leads]' ? counters : steps } });
    assert.equal(range.value, '2');
    assert.equal(amount.textContent, '399 €');
    assert.equal(badge.hidden, false);
    const leads = [10, 20, 50, 100, 200], prices = [89, 169, 399, 789, 1499];
    for (const i of [0, 1, 2, 3, 4, 2]) {
      steps[i].events.click();
      assert.equal(range.value, String(i));
      assert.equal(amount.textContent.replace(/[^0-9]/g, ''), String(prices[i]));
      assert.ok(counters.every(c => c.textContent === String(leads[i])));
      assert.equal(badge.hidden, i !== 2);
      assert.equal(checkout.dataset.price, String(prices[i]));
      assert.equal(steps[i].attrs['aria-pressed'], 'true');
    }
    steps[5].events.click();
    assert.equal(amount.textContent, lang === 'fr' ? 'Sur mesure' : 'Custom');
    assert.equal(period.hidden, true);
    assert.equal(summary.hidden, true);
    assert.equal(customCopy.hidden, false);
    assert.equal(customBooking.hidden, false);
    assert.equal(checkout.hidden, true);
    assert.equal(badge.hidden, true);
    assert.deepEqual(checkout.dataset, {});
    assert.equal(counters[0].textContent, '200+');
    range.value = '0'; range.events.input();
    assert.equal(customBooking.hidden, true);
    assert.equal(checkout.hidden, false);
    assert.equal(period.hidden, false);
    assert.equal(amount.textContent, '89 €');
  });
}

test('fixed homepage news and static deployment configuration', () => {
  for (const name of ['index.html', 'index-fr.html']) {
    const html = read(name);
    assert.match(html, /<time class="hero-eyebrow-date" datetime="2026-09-17">/);
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
