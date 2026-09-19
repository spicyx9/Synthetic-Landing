const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

// Legal disclosures describe data provenance, not product marketing.
const legalPages = new Set(['confidentialite.html', 'privacy.html', 'conditions.html', 'terms.html', 'mentions-legales.html', 'legal-notice.html', 'opposition.html', 'opt-out.html']);
const genericSourceCopy = /sources?\s+publiques?|public\s+sources?|public\s+web\s+information|informations?\s+publiques?\s+du\s+web|web\s+public/iu;

test('public pages use named sources instead of generic source marketing copy', () => {
  for (const file of fs.readdirSync('.').filter(file => file.endsWith('.html'))) {
    let html = fs.readFileSync(file, 'utf8');
    if (legalPages.has(file)) html = html.replace(/<main\b[\s\S]*?<\/main>/i, '');
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&(?:nbsp|#160|#xA0);/gi, ' ');
    assert.doesNotMatch(html, genericSourceCopy, `${file}: markup and SEO`);
    assert.doesNotMatch(text, genericSourceCopy, `${file}: rendered copy`);
  }
});
