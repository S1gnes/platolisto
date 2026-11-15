// Renders the PWA icons from the app logo (public/favicon.svg) with headless Chromium.
// Usage: npm run build:icons
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));

// A plate with a tick on the price-label yellow. `inset` shrinks the mark for maskable icons, whose edges may be cropped.
const plate = (inset) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <rect width="64" height="64" fill="#FFD60A"/>
  <g transform="translate(${32 - 32 * inset} ${32 - 32 * inset}) scale(${inset})">
    <circle cx="32" cy="32" r="19" fill="none" stroke="#17191A" stroke-width="4.4"/>
    <path d="M23 32.8l6.2 6.2 12-13.2" fill="none" stroke="#17191A" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

const ICONS = [
  { file: 'icon-192.png', size: 192, inset: 1 },
  { file: 'icon-512.png', size: 512, inset: 1 },
  { file: 'icon-maskable-512.png', size: 512, inset: 0.8 },
  { file: 'apple-touch-icon.png', size: 180, inset: 0.92 },
];

const browser = await chromium.launch();
try {
  for (const icon of ICONS) {
    const page = await browser.newPage({ viewport: { width: icon.size, height: icon.size } });
    await page.setContent(`<html><body style="margin:0">${plate(icon.inset)}</body></html>`);
    await writeFile(`${PUBLIC}${icon.file}`, await page.screenshot({ type: 'png' }));
    await page.close();
    console.log(`public/${icon.file}`);
  }
} finally {
  await browser.close();
}
