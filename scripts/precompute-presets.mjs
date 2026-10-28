// Runs the live recognition pipeline once on the real preset photos and saves the boxes,
// so presets keep working with zero network calls on stage.
//
// 1. Put the photos in public/presets/: student.jpg, market.jpg, empty.jpg (JPEG, PNG or WebP, any size).
// 2. Start the Worker with your keys:   npm run worker:dev
// 3. Run:                               npm run precompute
//
// Options (environment variables): WORKER_URL (default http://127.0.0.1:8787),
// PHOTOS_DIR (default public/presets), OUT_FILE (default src/data/presets.json).
// Recipes are not precomputed: presets rank PlatoListo's own recipes offline, and Spoonacular
// content may not be stored (see docs/DECISIONS.md).
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const WORKER_URL = (process.env.WORKER_URL ?? 'http://127.0.0.1:8787').replace(/\/$/, '');
const PHOTOS_DIR = resolve(ROOT, process.env.PHOTOS_DIR ?? 'public/presets');
const OUT_FILE = resolve(ROOT, process.env.OUT_FILE ?? 'src/data/presets.json');
const PRESETS = ['student', 'market', 'empty'];
const TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

function findPhoto(id) {
  for (const ext of Object.keys(TYPES)) {
    const path = join(PHOTOS_DIR, `${id}.${ext}`);
    if (existsSync(path)) return { path, mime: TYPES[ext] };
  }
  return null;
}

/** Same downscale as the app: longest side 1024 px, JPEG, EXIF orientation applied. */
async function downscale(page, photo) {
  const data = (await readFile(photo.path)).toString('base64');
  return page.evaluate(
    async ({ data, mime }) => {
      const blob = await (await fetch(`data:${mime};base64,${data}`)).blob();
      const bitmap = await createImageBitmap(blob);
      const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
      const width = Math.round(bitmap.width * scale);
      const height = Math.round(bitmap.height * scale);
      const canvas = new OffscreenCanvas(width, height);
      canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
      const out = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
      const bytes = new Uint8Array(await out.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return { base64: btoa(binary), width, height };
    },
    { data, mime: photo.mime },
  );
}

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const health = await fetch(`${WORKER_URL}/health`).then((r) => r.json()).catch(() => null);
if (!health?.vision) {
  console.error(`The Worker at ${WORKER_URL} is not running or has no GEMINI_API_KEY. Start it with: npm run worker:dev`);
  process.exit(1);
}

const data = JSON.parse(await readFile(OUT_FILE, 'utf8'));
const browser = await chromium.launch();
const page = await browser.newPage();
let updated = 0;
try {
  for (const id of PRESETS) {
    const photo = findPhoto(id);
    if (!photo) {
      console.log(`${id}: no photo in ${PHOTOS_DIR}, keeping the illustrated preset`);
      continue;
    }
    const image = await downscale(page, photo);
    const file = `${id}-1024.jpg`;
    await writeFile(join(PHOTOS_DIR, file), Buffer.from(image.base64, 'base64'));
    const response = await fetch(`${WORKER_URL}/vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
      body: JSON.stringify({ image: image.base64, mimeType: 'image/jpeg', kind: 'fridge' }),
    });
    if (!response.ok) throw new Error(`${id}: HTTP ${response.status} ${await response.text()}`);
    const { items } = await response.json();
    const preset = data.presets.find((p) => p.id === id);
    preset.photo = `presets/${file}`;
    preset.width = image.width;
    preset.height = image.height;
    preset.detections = items.map((item) => ({
      name: item.name,
      label_en: capitalize(item.name),
      label_es: item.label_es,
      ...(item.quantity ? { quantity: item.quantity } : {}),
      confidence: item.confidence,
      box_2d: item.box_2d,
    }));
    updated += 1;
    console.log(`${id}: ${items.length} items from ${photo.path} (${image.width}×${image.height})`);
  }
} finally {
  await browser.close();
}

if (updated > 0) {
  data._note = 'Detections from scripts/precompute-presets (real photos), or hand-written for illustrated presets.';
  await writeFile(OUT_FILE, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Saved ${updated} preset(s) to ${OUT_FILE}. Check the boxes in the app, then commit the photos and the JSON.`);
} else {
  console.log('Nothing to update.');
}
