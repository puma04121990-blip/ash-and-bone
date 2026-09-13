/**
 * Generate placeholder PNG sprites with pure Node (zlib + CRC32).
 * Transparent backgrounds. Diablo-mood palette.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../assets');

const P = {
  ash: [0x3a, 0x35, 0x30, 255],
  dirt: [0x4a, 0x32, 0x28, 255],
  stone: [0x6e, 0x65, 0x58, 255],
  abyss: [0x12, 0x10, 0x18, 255],
  bone: [0xc9, 0xb8, 0x9a, 255],
  cloth: [0x4a, 0x55, 0x68, 255],
  poison: [0x4f, 0x6b, 0x3c, 255],
  crimson: [0x8b, 0x1e, 0x1e, 255],
  gold: [0xb8, 0x92, 0x3a, 255],
  arcane: [0x6b, 0x2d, 0x8b, 255],
  skin: [0xa8, 0x90, 0x78, 255],
  iron: [0x5a, 0x5e, 0x66, 255],
  dark: [0x1a, 0x16, 0x14, 255],
  transparent: [0, 0, 0, 0],
};

function crcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
}
const CRC_TABLE = crcTable();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  const crcData = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = rowStart + 1 + x * 4;
      raw[di] = rgba[si];
      raw[di + 1] = rgba[si + 1];
      raw[di + 2] = rgba[si + 2];
      raw[di + 3] = rgba[si + 3];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

function createCanvas(w, h, fill = P.transparent) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = fill[0];
    data[i * 4 + 1] = fill[1];
    data[i * 4 + 2] = fill[2];
    data[i * 4 + 3] = fill[3];
  }
  return { w, h, data };
}

function setPx(c, x, y, color) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 4;
  c.data[i] = color[0];
  c.data[i + 1] = color[1];
  c.data[i + 2] = color[2];
  c.data[i + 3] = color[3];
}

function fillRect(c, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) setPx(c, x, y, color);
  }
}

function fillCircle(c, cx, cy, r, color) {
  const r2 = r * r;
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r2) setPx(c, cx + x, cy + y, color);
    }
  }
}

function save(name, canvas) {
  const buf = encodePng(canvas.w, canvas.h, canvas.data);
  const dest = path.join(OUT, name);
  fs.writeFileSync(dest, buf);
  console.log('wrote', name, canvas.w + 'x' + canvas.h);
}

fs.mkdirSync(OUT, { recursive: true });

// --- ash floor 32x32 ---
{
  const c = createCanvas(32, 32, P.ash);
  for (let i = 0; i < 40; i++) {
    const x = (i * 7 + 3) % 32;
    const y = (i * 11 + 5) % 32;
    setPx(c, x, y, P.dirt);
  }
  for (let i = 0; i < 12; i++) {
    setPx(c, (i * 13) % 32, (i * 17) % 32, P.stone);
  }
  // subtle border darken
  for (let i = 0; i < 32; i++) {
    setPx(c, i, 0, P.dark);
    setPx(c, 0, i, P.dark);
  }
  save('floor_ash.png', c);
}

// --- wall 32x32 ---
{
  const c = createCanvas(32, 32, P.stone);
  fillRect(c, 0, 0, 32, 4, P.dark);
  fillRect(c, 0, 14, 32, 3, P.dark);
  fillRect(c, 0, 28, 32, 4, P.dark);
  fillRect(c, 10, 0, 2, 32, P.dark);
  fillRect(c, 22, 0, 2, 32, P.ash);
  fillRect(c, 2, 5, 6, 7, P.iron);
  fillRect(c, 14, 18, 6, 7, P.ash);
  save('wall.png', c);
}

// --- hero 64x64 (idle, standing top-down-ish) ---
{
  const c = createCanvas(64, 64);
  // shadow
  fillCircle(c, 32, 52, 10, [0, 0, 0, 80]);
  // legs
  fillRect(c, 24, 40, 6, 12, P.iron);
  fillRect(c, 34, 40, 6, 12, P.iron);
  // body / cloth
  fillRect(c, 22, 24, 20, 20, P.cloth);
  fillRect(c, 24, 26, 16, 14, P.abyss);
  // belt
  fillRect(c, 22, 38, 20, 3, P.gold);
  // arms
  fillRect(c, 16, 26, 6, 14, P.skin);
  fillRect(c, 42, 26, 6, 14, P.skin);
  // head
  fillCircle(c, 32, 18, 9, P.skin);
  // hood / hair
  fillRect(c, 24, 8, 16, 8, P.cloth);
  fillRect(c, 22, 12, 4, 8, P.cloth);
  fillRect(c, 38, 12, 4, 8, P.cloth);
  // eyes
  setPx(c, 28, 18, P.crimson);
  setPx(c, 35, 18, P.crimson);
  // weapon hint (iron sword)
  fillRect(c, 46, 20, 3, 22, P.iron);
  fillRect(c, 44, 18, 7, 3, P.gold);
  save('hero.png', c);
}

// --- hero tint variant (slight cloth shift for idle feel) ---
{
  const c = createCanvas(64, 64);
  fillCircle(c, 32, 52, 10, [0, 0, 0, 70]);
  fillRect(c, 24, 40, 6, 12, P.iron);
  fillRect(c, 34, 40, 6, 12, P.iron);
  fillRect(c, 22, 24, 20, 20, [0x52, 0x5d, 0x70, 255]);
  fillRect(c, 24, 26, 16, 14, P.abyss);
  fillRect(c, 22, 38, 20, 3, P.gold);
  fillRect(c, 16, 27, 6, 14, P.skin);
  fillRect(c, 42, 25, 6, 14, P.skin);
  fillCircle(c, 32, 18, 9, P.skin);
  fillRect(c, 24, 8, 16, 8, [0x52, 0x5d, 0x70, 255]);
  setPx(c, 28, 18, P.crimson);
  setPx(c, 35, 18, P.crimson);
  fillRect(c, 46, 20, 3, 22, P.iron);
  fillRect(c, 44, 18, 7, 3, P.gold);
  save('hero_idle2.png', c);
}

// --- skeleton 48x48 ---
{
  const c = createCanvas(48, 48);
  fillCircle(c, 24, 40, 8, [0, 0, 0, 60]);
  // legs
  fillRect(c, 16, 30, 4, 12, P.bone);
  fillRect(c, 28, 30, 4, 12, P.bone);
  // ribs / torso
  fillRect(c, 16, 16, 16, 16, P.bone);
  fillRect(c, 18, 18, 12, 4, P.abyss);
  fillRect(c, 18, 24, 12, 3, P.abyss);
  // arms
  fillRect(c, 10, 16, 5, 14, P.bone);
  fillRect(c, 33, 16, 5, 14, P.bone);
  // skull
  fillCircle(c, 24, 10, 8, P.bone);
  fillRect(c, 18, 12, 4, 4, P.abyss);
  fillRect(c, 26, 12, 4, 4, P.abyss);
  // glowing eyes
  setPx(c, 20, 13, P.poison);
  setPx(c, 28, 13, P.poison);
  // jaw
  fillRect(c, 20, 16, 8, 2, P.dark);
  save('skeleton.png', c);
}

// --- chest 32x32 ---
{
  const c = createCanvas(32, 32);
  fillRect(c, 4, 12, 24, 16, P.dirt);
  fillRect(c, 6, 14, 20, 12, P.gold);
  fillRect(c, 8, 16, 16, 8, P.dirt);
  fillRect(c, 4, 10, 24, 5, P.gold);
  fillRect(c, 14, 12, 4, 6, P.iron);
  fillRect(c, 15, 14, 2, 2, P.crimson);
  // shadow
  fillRect(c, 6, 28, 20, 2, [0, 0, 0, 90]);
  save('chest.png', c);
}

// --- play button 128x48 ---
{
  const c = createCanvas(128, 48);
  fillRect(c, 0, 0, 128, 48, P.abyss);
  fillRect(c, 2, 2, 124, 44, [0x0e, 0x0c, 0x12, 255]);
  fillRect(c, 4, 4, 120, 40, P.crimson);
  fillRect(c, 6, 6, 116, 36, [0x6a, 0x16, 0x16, 255]);
  // gold border accents
  fillRect(c, 0, 0, 128, 2, P.gold);
  fillRect(c, 0, 46, 128, 2, P.gold);
  fillRect(c, 0, 0, 2, 48, P.gold);
  fillRect(c, 126, 0, 2, 48, P.gold);
  // simple play triangle
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x <= y / 2 + 4; x++) {
      setPx(c, 54 + x, 14 + y, P.bone);
    }
  }
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x <= (19 - y) / 2 + 4; x++) {
      setPx(c, 54 + x, 14 + y, P.bone);
    }
  }
  save('btn_play.png', c);
}

// --- hit particle 8x8 crimson ---
{
  const c = createCanvas(8, 8);
  fillCircle(c, 4, 4, 3, P.crimson);
  setPx(c, 4, 4, P.bone);
  save('particle_hit.png', c);
}

// --- gold coin 16x16 ---
{
  const c = createCanvas(16, 16);
  fillCircle(c, 8, 8, 6, P.gold);
  fillCircle(c, 8, 8, 4, [0xd4, 0xaa, 0x4a, 255]);
  setPx(c, 8, 8, P.dirt);
  save('coin.png', c);
}

fs.mkdirSync(path.resolve(__dirname, '../public/assets'), { recursive: true });
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith('.png')) {
    fs.copyFileSync(path.join(OUT, f), path.resolve(__dirname, '../public/assets', f));
  }
}
console.log('assets ready in', OUT);
