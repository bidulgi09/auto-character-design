function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHexColor() {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')
    .toUpperCase()}`;
}

function withFallback(value, fallback) {
  return value === undefined || value === null || value === '' ? fallback : value;
}

module.exports = { pick, randomInt, randomHexColor, withFallback };
