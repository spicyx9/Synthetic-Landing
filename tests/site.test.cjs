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
    assert.doesNotMatch(html, /hyperstack|Pro Solo|Pro Studio|\b(?:49|149)\s*€/i);
    const login = html.match(/<a\b[^>]*class="btn-login"[^>]*>/)[0];
    for (const attr of ['href="https://app.syntheticswarm.ai/ui/"', 'target="_blank"', 'rel="noopener noreferrer"']) assert.ok(login.includes(attr));
    assert.match(html, /<button[^>]*data-book-demo[^>]*aria-expanded="false"/);
    for (const calendar of ['91k1Mpontca7NGea6', 'AWQX2bxp8cnqtsaJ9']) {
      assert.match(html, new RegExp(`<a[^>]*href="https://calendar.app.google/${calendar}"[^>]*target="_blank"[^>]*rel="noopener noreferrer"`));
    }
    assert.match(html, />AC<\/span>/);
    assert.match(html, />IS<\/span>/);
    assert.doesNotMatch(html, /avatars\.githubusercontent|heroEyebrowDate/);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, 'duplicate IDs');
    for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      if (/^(https?:|#|mailto:|tel:)/.test(url)) continue;
      let local = url.split(/[?#]/)[0].replace(/^\//, '') || 'index.html';
      if (!path.extname(local)) local += '.html';
      assert.ok(fs.existsSync(path.join(root, local)), `missing target ${url}`);
    }
    for (const [, script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(script);
  });
}

for (const lang of ['en', 'fr']) {
  test(`${lang}: pricing defaults and every interactive tier`, () => {
    const html = read(lang === 'fr' ? 'pricing-fr.html' : 'pricing.html');
    assert.equal([...html.matchAll(/class="pricing-config-card"/g)].length, 1);
    assert.match(html, /data-pricing-range[^>]*value="2"/);
    assert.doesNotMatch(html, /quand disponibles|when available|location\.replace/);
    assert.equal([...html.matchAll(/<details class="pricing-faq-item">/g)].length, 3);
    assert.doesNotMatch(html, /<details[^>]*\bopen\b/);
    const element = () => ({ textContent: '', dataset: {}, attrs: {}, events: {}, style: { setProperty() {} }, classList: { toggle() {} }, setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(k, v) { this.events[k] = v; } });
    const range = element(), amount = element(), checkout = element(), badge = element();
    range.value = '4'; // Simulate a browser restoring an old selection.
    const counters = [element(), element()], steps = Array.from({ length: 5 }, element);
    const selectors = { '[data-pricing-range]': range, '[data-pricing-amount]': amount, '[data-pricing-checkout]': checkout, '.pricing-config-badge': badge };
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
    range.value = '0'; range.events.input();
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
  assert.deepEqual(JSON.parse(read('vercel.json')), { cleanUrls: true, trailingSlash: false });
});

test('all shared JavaScript parses', () => {
  for (const name of fs.readdirSync(root).filter(name => name.endsWith('.js'))) new vm.Script(read(name));
});
