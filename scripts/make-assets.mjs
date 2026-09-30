// Erzeugt Favicons, App-Icons und das Social-Preview-Bild (1200×630).
// Aufruf: npm run assets  (benötigt lokal installiertes Chromium für og.png)
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const pub = (f) => `${root}public/${f}`;
const svg = await readFile(pub('favicon.svg'));

// Quadratisches Icon ohne Rundung (für Apple/Maskable, die Systeme runden selbst)
const square = (inset) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#15171c"/>
  <g transform="translate(${16 - 16 * inset} ${16 - 16 * inset}) scale(${inset})">
    <path d="M20.75 11.18A7.5 7.5 0 1 0 20.75 20.82" fill="none" stroke="#f4f1ea" stroke-width="4.2"/>
    <rect x="20.4" y="13.9" width="4.2" height="4.2" fill="#e4572e"/>
  </g>
</svg>`);

const png = (input, size) => sharp(input, { density: 1200 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

await writeFile(pub('apple-touch-icon.png'), await png(square(1), 180));
await writeFile(pub('icon-192.png'), await png(svg, 192));
await writeFile(pub('icon-512.png'), await png(svg, 512));
await writeFile(pub('icon-maskable-512.png'), await png(square(0.8), 512));

// favicon.ico mit 16/32/48 px (PNG-Einträge im ICO-Container)
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => png(svg, s)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const o = 6 + i * 16;
  header.writeUInt8(s, o);
  header.writeUInt8(s, o + 1);
  header.writeUInt16LE(1, o + 4);
  header.writeUInt16LE(32, o + 6);
  header.writeUInt32LE(images[i].length, o + 8);
  header.writeUInt32LE(offset, o + 12);
  offset += images[i].length;
});
await writeFile(pub('favicon.ico'), Buffer.concat([header, ...images]));

// Social-Preview per Headless-Chromium
const executablePath = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(`${root}scripts/assets/og.html`).href);
await page.evaluate(() => document.fonts.ready);
const shot = await page.screenshot({ type: 'png' });
await browser.close();
await writeFile(pub('og.png'), await sharp(shot).png({ compressionLevel: 9, palette: false }).toBuffer());

console.log('Assets erzeugt: favicon.ico, apple-touch-icon.png, icon-192/512, icon-maskable-512, og.png');
