// Forbidden terms are stored as SHA-256 hashes so they never appear in clear text in the repo.
const crypto = require('node:crypto');

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');

function findForbidden(text, hashes) {
  const words = String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(' ')
    .filter(Boolean);
  const found = new Set();
  for (let i = 0; i < words.length; i++) {
    for (let size = 1; size <= 3 && i + size <= words.length; size++) {
      const hash = sha256(words.slice(i, i + size).join(' '));
      if (hashes.has(hash)) found.add(hash);
    }
  }
  return [...found].sort();
}

const SOURCE_HASHES = new Set([
  'c3acdca1bd844b812af0422426ec9c8ebf3156e2cb81c5c4cc12de266cb550d1',
  '022dff45db9a67d239aab1ae3a86021ea4b4593a22067f625edd66788c6eebe0',
  '3cc94f967d591732b851c90505b32b7f1e48a8e8ab94979ee15e86674123871b',
  'eb86fde2f2a8f2ed2b392a7ccd472972b07cf6754b51a1a859233e2e2455c28e',
  '6e3e40f6b7d028bb19632bd813e216acb83cedc7428387ede5497d68c192eef9',
  'e4a0ac20b3ff663103b6650d2a8c5b174fd154445511c99c073c20cae7e14cac',
  '3c1a89e24dac6506ab2f370b7867b0c7efdbbbdab9e7132ead2338c4e55f9b3f',
  '4048eb734288938a86e089f71c9d66243629a1445893abf09a0fea093d6d5a76',
  'e38a1ab6187600c4be05f31e3cb047a6b6073e48c8478fbf64974852ef697b67',
  '626c6954637cf4b6d916be402cabe3b83b7ef1bb7f06c5a424d86b79e091aa22',
  '06402afab88bc48c2e6b9a29a1d9fea4fd677583e65d279069c1dddcea44ea7c',
  'fc7990feadd26587fd91a97abc085208e59c09a0d9a2bbda7cd37279bca13d34',
  '1d446138494b19b4281eb1692354038c2cde85d09ce9982fef6b904bca4f6c72',
  '7867ed3f6640a0ce441ac15f903a42c34915064b06aafed3b88223312933e034',
  'c9281dff04053bdd39b9026a6dce2027c8cc01282a27474df5035d2d620412c4',
]);

const LEGACY_PLAN_HASHES = new Set([
  '476f3ecfbcbdec326154c19e0bea88266d954897a13e04fd7fd6914ecc9c9f42',
  '6df39f6464964bc1cb38a85f501f7129e784dfbaeae9d5771985dc0785f7567f',
]);

module.exports = { findForbidden, SOURCE_HASHES, LEGACY_PLAN_HASHES };
