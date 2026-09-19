const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

// Legal disclosures describe data provenance, not product marketing.
const legalPages = new Set(['confidentialite.html', 'privacy.html', 'conditions.html', 'terms.html', 'mentions-legales.html', 'legal-notice.html', 'opposition.html', 'opt-out.html']);
const infrastructureCopy = /\b(?:SIRENE|BODACC|RNE|ORIAS|ADEME)\b|France Travail|voir les sources|view sources|scraping|registries|registres|databases|bases? de données/iu;
const genericSourceCopy = /sources?\s+publiques?|public\s+sources?|public\s+web\s+information|informations?\s+publiques?\s+du\s+web|web\s+public/iu;

test('public marketing keeps data-source infrastructure internal', () => {
  for (const file of fs.readdirSync('.').filter(file => file.endsWith('.html'))) {
    let html = fs.readFileSync(file, 'utf8');
    if (legalPages.has(file)) html = html.replace(/<main\b[\s\S]*?<\/main>/i, '');
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&(?:nbsp|#160|#xA0);/gi, ' ');
    assert.doesNotMatch(html, genericSourceCopy, `${file}: markup and SEO`);
    assert.doesNotMatch(text, genericSourceCopy, `${file}: rendered copy`);
    assert.doesNotMatch(html, infrastructureCopy, `${file}: internal infrastructure`);
  }
});
