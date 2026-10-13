const crypto = require('crypto');

function pick(list) {
  return list[crypto.randomInt(0, list.length)];
}

function randomInt(min, max) {
  return crypto.randomInt(min, max + 1);
}

function randomHexColor() {
  return `#${crypto.randomBytes(3)
    .toString('hex')
    .padStart(6, '0')
    .toUpperCase()}`;
}

function withFallback(value, fallback) {
  return value === undefined || value === null || value === '' ? fallback : value;
}

module.exports = { pick, randomInt, randomHexColor, withFallback };
