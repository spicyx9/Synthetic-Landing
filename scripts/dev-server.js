#!/usr/bin/env node
// Local static server mirroring the Vercel semantics declared in vercel.json:
// cleanUrls (/pricing serves pricing.html, /pricing.html redirects 308 to /pricing),
// trailingSlash:false (/pricing/ redirects 308 to /pricing), the redirects list
// (permanent -> 308, otherwise 307, honouring `has` / `missing` cookie and header
// rules) and a 404 for anything else (404.html when present).
// Usage: node scripts/dev-server.js [port]   (default 4173)
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.argv[2] || process.env.PORT || 4173);
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8', '.py': 'text/x-python; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.pdf': 'application/pdf',
};

function parseCookies(header) {
  const out = {};
  for (const part of (header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function ruleMatches(rule, req) {
  const cookies = parseCookies(req.headers.cookie);
  const check = (cond) => {
    let actual;
    if (cond.type === 'cookie') actual = cookies[cond.key];
    else if (cond.type === 'header') actual = req.headers[cond.key.toLowerCase()];
    else if (cond.type === 'query') actual = new URL(req.url, 'http://x').searchParams.get(cond.key) ?? undefined;
    else if (cond.type === 'host') actual = req.headers.host;
    if (actual === undefined) return false;
    return cond.value === undefined ? true : String(actual) === cond.value;
  };
  if ((rule.has || []).some((c) => !check(c))) return false;
  if ((rule.missing || []).some((c) => check(c))) return false;
  return true;
}

function redirect(res, status, location) {
  res.writeHead(status, { Location: location, 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`Redirecting to ${location}`);
}

function safeFile(pathname) {
  const abs = path.normalize(path.join(ROOT, decodeURIComponent(pathname)));
  if (!abs.startsWith(ROOT + path.sep) && abs !== ROOT) return null;
  return abs;
}

function isFile(abs) {
  try { return fs.statSync(abs).isFile(); } catch { return false; }
}

function send(res, status, abs, method) {
  const ext = path.extname(abs).toLowerCase();
  const body = fs.readFileSync(abs);
  res.writeHead(status, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
  });
  res.end(method === 'HEAD' ? undefined : body);
}

function notFound(res, method) {
  const page = path.join(ROOT, '404.html');
  if (isFile(page)) return send(res, 404, page, method);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(method === 'HEAD' ? undefined : '404: NOT_FOUND');
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = url.pathname;
  const qs = url.search;

  // 1. vercel.json redirects, in declaration order.
  for (const rule of config.redirects || []) {
    if (rule.source === pathname && ruleMatches(rule, req)) {
      return redirect(res, rule.permanent === false ? 307 : 308, rule.destination + qs);
    }
  }

  // 2. trailingSlash: false
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return redirect(res, 308, pathname.replace(/\/+$/, '') + qs);
  }

  // 3. cleanUrls: extension-bearing HTML URLs redirect to the clean path.
  if (pathname.endsWith('.html')) {
    const clean = pathname.slice(0, -'.html'.length);
    return redirect(res, 308, (clean.endsWith('/index') ? clean.slice(0, -'index'.length) || '/' : clean) + qs);
  }

  const abs = safeFile(pathname);
  if (!abs) return notFound(res, req.method);

  // 4. Root and directories serve their index.html.
  if (pathname === '/' || (fs.existsSync(abs) && fs.statSync(abs).isDirectory())) {
    const index = path.join(abs, 'index.html');
    return isFile(index) ? send(res, 200, index, req.method) : notFound(res, req.method);
  }

  // 5. Exact static file, then the cleanUrls .html twin.
  if (isFile(abs)) return send(res, 200, abs, req.method);
  if (isFile(abs + '.html')) return send(res, 200, abs + '.html', req.method);

  return notFound(res, req.method);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Serving ${ROOT} with Vercel semantics on http://127.0.0.1:${PORT}`);
});
