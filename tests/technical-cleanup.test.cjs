const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));
const indexable = ['index-fr.html', 'notre-solution.html', 'tarifs.html', 'faq-fr.html'];
const base = 'https://www.syntheticswarm.ai';

test('sitemap contains exactly the four indexable French URLs', () => {
  const locs = [...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  assert.deepEqual(locs, indexable.map(name => `${base}/${name.replace(/\.html$/, '')}`));
});

test('only the four sitemap pages are indexable; every other page carries noindex,follow', () => {
  for (const name of pages) {
    const html = read(name);
    const robots = html.match(/<meta name="robots" content="([^"]*)">/g) || [];
    if (indexable.includes(name)) assert.deepEqual(robots, [], `${name} must stay indexable`);
    else if (name === '404.html') assert.deepEqual(robots, ['<meta name="robots" content="noindex">']);
    else assert.deepEqual(robots, ['<meta name="robots" content="noindex,follow">'], name);
  }
});

test('no price metadata remains and checkout links transmit only volume and language', () => {
  for (const name of [...pages, ...fs.readdirSync(path.join(root, 'js'), { recursive: true }).filter(n => n.endsWith('.js')).map(n => `js/${n}`)]) {
    assert.doesNotMatch(read(name), /data-price=|[?&]price=|dataset\.price/, name);
  }
  const checkouts = pages.flatMap(name => [...read(name).matchAll(/href="(https:\/\/app\.syntheticswarm\.ai\/ui\/\?[^"]*)"/g)].map(m => m[1].replace(/&amp;/g, '&')));
  assert.ok(checkouts.length >= 4);
  for (const url of checkouts) {
    const search = new URL(url).searchParams;
    const params = [...search.keys()].sort();
    // The discovery entry offer is the only checkout without a weekly volume.
    if (search.has('offer')) {
      assert.deepEqual(params, ['lang', 'offer'], url);
      assert.equal(search.get('offer'), 'discovery', url);
    } else assert.deepEqual(params, ['lang', 'leads'], url);
  }
  assert.match(read('js/pricing.js'), /\?leads=' \+ key \+ '&lang=' \+ lang\)/);
});

test('branded 404 page exists, is noindex and reuses the shared assets', () => {
  const html = read('404.html');
  assert.match(html, /<meta name="robots" content="noindex">/);
  assert.match(html, /<h1>Page introuvable<\/h1>/);
  for (const href of ['/index-fr', '/notre-solution', '/tarifs', '/faq-fr']) assert.ok(html.includes(`href="${href}"`), href);
  assert.match(html, /href="\/css\/styles\.css/);
  assert.match(html, /href="\/css\/site-pages\.css/);
  assert.doesNotMatch(html, /<link rel="canonical"|hreflang|data-newsletter-form/);
});

test('vercel.json serves the security headers and a content security policy', () => {
  const config = JSON.parse(read('vercel.json'));
  const all = config.headers.find(rule => rule.source === '/(.*)');
  assert.ok(all, 'a header rule for every path is required');
  const headers = Object.fromEntries(all.headers.map(h => [h.key, h.value]));
  assert.match(headers['Strict-Transport-Security'], /max-age=\d{7,}/);
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
  for (const feature of ['camera=()', 'microphone=()', 'geolocation=()', 'usb=()']) assert.ok(headers['Permissions-Policy'].includes(feature), feature);
  const csp = headers['Content-Security-Policy'];
  for (const directive of ["default-src 'self'", "script-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com']) assert.ok(csp.includes(directive), directive);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'|'unsafe-eval'/);
});

test('vercel.json caches CSS, JS, images and icons without immutable HTML caching', () => {
  const config = JSON.parse(read('vercel.json'));
  const cache = source => Object.fromEntries(config.headers.find(rule => rule.source === source).headers.map(h => [h.key, h.value]))['Cache-Control'];
  assert.equal(cache('/(.*)\\.(css|js)'), 'public, max-age=604800, stale-while-revalidate=86400');
  assert.equal(cache('/assets/(.*)\\.(png|jpg|jpeg|webp|svg|gif|ico|woff|woff2)'), 'public, max-age=2592000, stale-while-revalidate=86400');
  assert.equal(cache('/(favicon.ico|apple-touch-icon.png)'), 'public, max-age=2592000, stale-while-revalidate=86400');
  const all = Object.fromEntries(config.headers.find(rule => rule.source === '/(.*)').headers.map(h => [h.key, h.value]));
  assert.equal(all['Cache-Control'], undefined);
  for (const rule of config.headers) assert.doesNotMatch(JSON.stringify(rule), /immutable/);
});

test('the four indexable pages carry coherent Open Graph and Twitter metadata', () => {
  const png = fs.readFileSync(path.join(root, 'assets/og-image.png'));
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  for (const name of indexable) {
    const html = read(name);
    const meta = (attr, key) => (html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)">`)) || [])[1];
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const description = meta('name', 'description');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)[1];
    assert.equal(meta('property', 'og:type'), 'website', name);
    assert.equal(meta('property', 'og:title'), title, name);
    assert.equal(meta('property', 'og:description'), description, name);
    assert.equal(meta('property', 'og:url'), canonical, name);
    assert.equal(meta('property', 'og:image'), `${base}/assets/og-image.png`, name);
    assert.equal(meta('name', 'twitter:card'), 'summary_large_image', name);
    assert.equal(meta('name', 'twitter:title'), title, name);
    assert.equal(meta('name', 'twitter:description'), description, name);
    assert.equal(meta('name', 'twitter:image'), `${base}/assets/og-image.png`, name);
    assert.equal((html.match(/property="og:title"/g) || []).length, 1, name);
  }
  for (const name of pages.filter(n => !indexable.includes(n))) assert.doesNotMatch(read(name), /twitter:card/, name);
});

test('favicon and Apple touch icon exist and are referenced by every page and the generator', () => {
  for (const file of ['favicon.ico', 'apple-touch-icon.png', 'assets/img/favicon.png']) assert.ok(fs.existsSync(path.join(root, file)), file);
  const apple = fs.readFileSync(path.join(root, 'apple-touch-icon.png'));
  assert.equal(apple.readUInt32BE(16), 180);
  assert.equal(apple.readUInt32BE(20), 180);
  const links = ['<link rel="icon" href="/assets/img/favicon.png" type="image/png">', '<link rel="icon" href="/favicon.ico" sizes="any">', '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">'];
  for (const name of [...pages, 'scripts/site_layout.py']) for (const link of links) assert.ok(read(name).includes(link), `${name}: ${link}`);
});

test('.vercelignore excludes internal material only, never a runtime file referenced by a page', () => {
  const ignore = read('.vercelignore').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  for (const required of ['.claude/', 'docs/', 'scripts/', 'tests/', '*.md', '.gitignore']) assert.ok(ignore.includes(required), required);
  assert.ok(!ignore.some(l => l.startsWith('api') || l.startsWith('assets') || l.startsWith('css') || l.startsWith('js') || l === '*.css' || l === '*.js' || l === '*.html'));
  const referenced = new Set();
  for (const name of pages) for (const [, url] of read(name).matchAll(/(?:src|href)="(\/[^"?#]+)/g)) referenced.add(url.slice(1));
  for (const css of fs.readdirSync(path.join(root, 'css'), { recursive: true }).filter(n => n.endsWith('.css')).map(n => `css/${n}`)) for (const [, url] of read(css).matchAll(/url\(["']?\/([^"')?#]+)/g)) referenced.add(url);
  for (const line of ignore) {
    if (line.endsWith('/') || line.startsWith('*') || line.startsWith('.')) continue;
    assert.ok(!referenced.has(line), `${line} is referenced by a public page and must not be ignored`);
    assert.ok(fs.existsSync(path.join(root, line)), line);
  }
  for (const file of ['api/contact.js', 'api/newsletter.js']) assert.ok(fs.existsSync(path.join(root, file)));
});


test('radar CSP permits public tiles and local image/worker decoding without remote scripts', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const csp = config.headers.find(rule => rule.source === '/(.*)').headers.find(h => h.key === 'Content-Security-Policy').value;
  const directives = Object.fromEntries(csp.split(';').map(part => part.trim().split(/\s+/)).filter(parts => parts[0]).map(([key, ...values]) => [key, values]));
  assert.deepEqual(directives['connect-src'], ["'self'", 'https://tiles.openfreemap.org']);
  assert.ok(directives['img-src'].includes('blob:'));
  assert.deepEqual(directives['worker-src'], ["'self'", 'blob:']);
  assert.deepEqual(directives['script-src'], ["'self'"]);
});
