// Renders the PWA icons from the app logo (public/favicon.svg) with headless Chromium.
// Usage: npm run build:icons
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));

// Plate on terracotta. `inset` shrinks the plate for maskable icons, whose edges may be cropped.
const plate = (inset) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <rect width="64" height="64" fill="#A94F2B"/>
  <g transform="translate(${32 - 32 * inset} ${32 - 32 * inset}) scale(${inset})">
    <circle cx="32" cy="32" r="21" fill="#FFFBF5"/>
    <circle cx="32" cy="32" r="14" fill="#F1E3C2"/>
    <circle cx="27" cy="29" r="3" fill="#F2C94C"/>
    <circle cx="37" cy="35" r="3" fill="#F2C94C"/>
    <ellipse cx="34" cy="27" rx="4" ry="2.4" fill="#6E8B3D"/>
    <ellipse cx="28" cy="37" rx="4" ry="2.4" fill="#7C9A4E"/>
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
