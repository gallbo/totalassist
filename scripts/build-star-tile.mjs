import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require(
  path.resolve("node_modules/.pnpm/sharp@0.34.5/node_modules/sharp"),
);

const OUT = "public/brand/stars-tile.png";

const CELL = 38;
const OPACITIES = [
  [0.95, 0.95, 0.95, 0.95, 0.95],
  [0.95, 0.95, 0.95, 0.95, 0.95],
  [0.95, 0.95, 0.95, 0.95, 0.95],
  [0.95, 0.95, 0.95, 0.95, 0.95],
  [0.95, 0.95, 0.95, 0.95, 0.95],
];

const FILL = "#b8bec9";
const c = CELL / 2;
const R = 17;
const r = 3.5;
const k = 0.45;

const tips = [
  { T: [c, c - R], prev: [c - r, c - r], next: [c + r, c - r] },
  { T: [c + R, c], prev: [c + r, c - r], next: [c + r, c + r] },
  { T: [c, c + R], prev: [c + r, c + r], next: [c - r, c + r] },
  { T: [c - R, c], prev: [c - r, c + r], next: [c - r, c - r] },
];

const f = (n) => n.toFixed(2);
const lerp = (a, b, t) => [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];

const segments = tips.map(({ T, prev, next }) => {
  const before = lerp(prev, T, 1 - k);
  const after = lerp(T, next, k);
  return { before, T, after, inner: next };
});

let d = `M ${f(segments[0].before[0])} ${f(segments[0].before[1])}`;
for (let i = 0; i < segments.length; i++) {
  const { T, after, inner } = segments[i];
  const nextBefore = segments[(i + 1) % segments.length].before;
  d += ` Q ${f(T[0])} ${f(T[1])} ${f(after[0])} ${f(after[1])}`;
  d += ` L ${f(inner[0])} ${f(inner[1])}`;
  d += ` L ${f(nextBefore[0])} ${f(nextBefore[1])}`;
}
d += " Z";

const STAR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="${CELL}" height="${CELL}" viewBox="0 0 ${CELL} ${CELL}">
  <path d="${d}" fill="${FILL}"/>
</svg>`;

const starBase = await sharp(Buffer.from(STAR_SVG)).png().toBuffer();

async function starWithOpacity(op) {
  const { data, info } = await sharp(starBase)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 3; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * op);
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

const rows = OPACITIES.length;
const cols = OPACITIES[0].length;
const width = cols * CELL;
const height = rows * CELL;

const composites = [];
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    const buf = await starWithOpacity(OPACITIES[y][x]);
    composites.push({ input: buf, left: x * CELL, top: y * CELL });
  }
}

await sharp({
  create: {
    width,
    height,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(composites)
  .png()
  .toFile(OUT);

console.log(`built ${width}x${height} tile -> ${OUT}`);
