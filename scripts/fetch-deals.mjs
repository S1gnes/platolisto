// Takes a one-off snapshot of real supermarket prices and writes src/data/deals.json.
// Usage: npm run fetch:deals            (keeps the current file if too few deals match)
//        npm run fetch:deals -- --force (writes whatever was found)
//
// Pages are read with a normal headless Chromium, the way a visitor's browser loads them. Sites that
// answer with a bot challenge are skipped, never worked around. Run it rarely, by hand, before a demo.
// Only food that matches PlatoListo's ingredient catalog is kept, so every deal can complete a recipe.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = `${ROOT}src/data/deals.json`;
const META = `${ROOT}src/data/deals-meta.json`;
const MIN_DEALS = 15;
const PER_KEY_PER_CHAIN = 1;
const force = process.argv.includes('--force');

const vite = await createServer({ root: ROOT, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
const { cleanText, normalizeIngredient } = await vite.ssrLoadModule('/src/core/normalize.ts');
const { catalogEntry, isPantry } = await vite.ssrLoadModule('/src/core/catalog.ts');

// Ready-made products whose name starts with an ingredient but are not that ingredient
// ("patatas fritas sabor queso", "bebida sabor limón", "crema de cacao").
const PROCESSED = /fritas|asad|confit|sabor|chocolate|cacao|croqueta|preparado|instant|crema|sidra|bebida|hamburguesa|burger|salsa|galleta|helado|zumo|refresco|snack|barrita|nugget|empanad|pizza|tarta|bollo|cereal|cookie|untar|caldo|arreglo|lasa[nñ]a|sandwich|tortitas|aperitivo|gominola|surimi|pat[eé]\b/i;

// Every exact catalog name and alias, cleaned the same way as product names.
const { CATALOG } = await vite.ssrLoadModule('/src/core/catalog.ts');
const EXACT = new Set(CATALOG.flatMap((e) => [e.key, e.en, e.es, ...(e.aliases ?? [])]).map(cleanText));

/**
 * Spanish product names lead with the ingredient ("Pechuga de pollo finas hierbas"), so only the
 * first one to four words may match, and only as an exact catalog name: never a fuzzy tail match.
 */
function productKey(name) {
  if (PROCESSED.test(name)) return null;
  const words = cleanText(name).split(' ');
  for (let n = Math.min(4, words.length); n > 0; n -= 1) {
    const phrase = words.slice(0, n).join(' ');
    const key = normalizeIngredient(phrase);
    const exact = EXACT.has(phrase) || EXACT.has(phrase.replace(/s$/, '')) || EXACT.has(phrase.replace(/es$/, ''));
    if (exact && catalogEntry(key) && !isPantry(key)) return key;
  }
  return null;
}

const round = (n) => Math.round(n * 100) / 100;
const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'es-ES' });
const sources = [];

async function mercadona() {
  const page = await context.newPage();
  await page.goto('https://tienda.mercadona.es/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(3000);
  // Mercadona has "always low prices", so its deals are the products whose price just went down.
  const items = await page.evaluate(async () => {
    const get = async (path) => {
      const response = await fetch(path);
      return response.ok ? response.json().catch(() => null) : null;
    };
    // The shop sets up its session a moment after loading; wait until the API answers with JSON.
    let root = null;
    for (let attempt = 0; attempt < 20 && !root?.results; attempt += 1) {
      root = await get('/api/categories/?lang=es&wh=vlc1');
      if (!root?.results) await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const out = [];
    for (const section of root?.results ?? []) {
      for (const sub of section.categories) {
        // A short pause keeps the snapshot at a human pace.
        await new Promise((resolve) => setTimeout(resolve, 150));
        const data = await get(`/api/categories/${sub.id}/?lang=es&wh=vlc1`);
        if (!data) continue;
        for (const group of data.categories ?? []) {
          for (const product of group.products ?? []) {
            const p = product.price_instructions;
            const price = Number(p.unit_price);
            const old = Number(p.previous_unit_price);
            if (!(old > price)) continue;
            const size = p.unit_size ? `${String(p.unit_size).replace('.', ',')} ${p.size_format}` : '';
            out.push({ name: product.display_name, size, price, oldPrice: old, packaging: product.packaging ?? '' });
          }
        }
      }
    }
    return out;
  });
  await page.close();
  return items;
}

async function aldi() {
  const page = await context.newPage();
  await page.goto('https://www.aldi.es/ofertas.html', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(4000);
  for (let i = 0; i < 15; i += 1) {
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(600);
  }
  const items = await page.evaluate(() =>
    [...document.querySelectorAll('.product-tile')].map((tile) => {
      const name = tile.querySelector('[data-testid$="product-name"]')?.textContent?.trim() ?? '';
      const priceText = tile.querySelector('[data-testid$="price-section"]')?.innerText ?? '';
      const pct = Number(priceText.match(/-(\d{1,2})\s?%/)?.[1] ?? 0);
      const numbers = [...priceText.matchAll(/\b\d+\.\d{2}\b/g)].map((m) => Number(m[0]));
      const marker = tile.querySelector('.tag__marker')?.textContent?.trim() ?? '';
      // Loose produce is priced per kilo ("precio kg (a granel)").
      const size = /precio kg/i.test(marker) ? '1 kg' : marker.split('unidad')[0].replace(/aprox\.?/, '').trim();
      return { name, pct, numbers, size };
    }),
  );
  await page.close();
  return items
    .map(({ name, pct, numbers, size }) => {
      const price = numbers[0];
      let oldPrice = numbers.find((n, i) => i > 0 && n > price);
      if (!oldPrice && pct > 0) oldPrice = Math.round((price / (1 - pct / 100)) * 100) / 100;
      return { name, size, price, oldPrice };
    })
    // A "was" price over twice the price is a misread unit price, not a real discount.
    .filter((item) => item.name && item.price > 0 && item.oldPrice > item.price && item.oldPrice < item.price * 2.2);
}

async function carrefour() {
  const page = await context.newPage();
  let offers = null;
  page.on('response', async (response) => {
    if (response.url().includes('/plp-food-papi/v1/custom/autoffers/')) offers = await response.json().catch(() => null);
  });
  const response = await page.goto('https://www.carrefour.es/supermercado/ofertas', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(6000);
  await page.close();
  if (response?.status() === 403) throw new Error('bot challenge (HTTP 403)');
  if (!offers?.items) throw new Error('no offers list on the page');
  return offers.items
    .map((item) => ({
      name: item.name,
      size: '',
      price: Number(String(item.price).replace(/[^\d,.]/g, '').replace(',', '.')),
      oldPrice: Number(String(item.price_strikethrough ?? '').replace(/[^\d,.]/g, '').replace(',', '.')),
    }))
    .filter((item) => item.oldPrice > item.price);
}

const CHAINS = [
  { chain: 'Mercadona', id: 'mer', run: mercadona },
  { chain: 'ALDI', id: 'ald', run: aldi },
  { chain: 'Carrefour', id: 'car', run: carrefour },
];
// Checked by hand on 2026-11-07 and left out: Lidl (food offers only in leaflets), Dia (bot challenge),
// Eroski (leaflet without prices), Alcampo and Consum (no offers page reachable without a session).
const SKIPPED = [
  { chain: 'Lidl', status: 'skipped', reason: 'food offers are published only as leaflets' },
  { chain: 'Dia', status: 'skipped', reason: 'bot challenge' },
  { chain: 'Eroski', status: 'skipped', reason: 'offers page is a leaflet without prices' },
  { chain: 'Alcampo', status: 'skipped', reason: 'offers page not reachable' },
  { chain: 'Consum', status: 'skipped', reason: 'offers page not reachable' },
];

const deals = [];
const validUntil = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
for (const { chain, id, run } of CHAINS) {
  try {
    const raw = await run();
    const byKey = new Map();
    for (const item of raw) {
      const key = productKey(item.name);
      if (!key) continue;
      const list = byKey.get(key) ?? [];
      list.push(item);
      byKey.set(key, list);
    }
    let kept = 0;
    for (const [key, items] of byKey) {
      items.sort((a, b) => a.price - b.price);
      for (const item of items.slice(0, PER_KEY_PER_CHAIN)) {
        const entry = catalogEntry(key);
        deals.push({
          id: `${id}-${key.replace(/\s+/g, '-')}`,
          chain,
          name_en: entry.en,
          name_es: item.name,
          ingredientKey: key,
          size: item.size,
          price: round(item.price),
          oldPrice: round(item.oldPrice),
          sponsored: false,
          validUntil,
        });
        kept += 1;
      }
    }
    sources.push({ chain, status: 'ok', found: raw.length, kept });
    console.log(`${chain}: ${raw.length} discounted products, ${kept} match the recipe catalog`);
  } catch (error) {
    sources.push({ chain, status: 'failed', reason: error.message.slice(0, 120) });
    console.log(`${chain}: skipped (${error.message.slice(0, 120)})`);
  }
}
await browser.close();
await vite.close();

const real = deals.length;
if (real < MIN_DEALS && !force) {
  console.log(`Only ${real} real deals (need ${MIN_DEALS}); keeping the current ${OUT}. Use --force to write anyway.`);
  process.exit(1);
}
// Real prices first; demo deals fill the ingredients no store had on offer, marked as demo in the app.
// Sponsorship stays on demo deals only: no real chain pays PlatoListo.
const covered = new Set(deals.map((d) => normalizeIngredient(d.ingredientKey)));
const demo = JSON.parse(await readFile(`${ROOT}src/data/deals-demo.json`, 'utf8'));
for (const deal of demo) {
  if (!covered.has(normalizeIngredient(deal.ingredientKey))) deals.push({ ...deal, demo: true });
}
deals.sort((a, b) => Number(Boolean(a.demo)) - Number(Boolean(b.demo)) || (b.oldPrice - b.price) / b.oldPrice - (a.oldPrice - a.price) / a.oldPrice);
const previous = JSON.parse(await readFile(OUT, 'utf8')).length;
await writeFile(OUT, `${JSON.stringify(deals, null, 1)}\n`);
await writeFile(
  META,
  `${JSON.stringify({ kind: 'snapshot', fetchedAt: new Date().toISOString().slice(0, 10), sources: [...sources, ...SKIPPED] }, null, 2)}\n`,
);
console.log(`Saved ${deals.length} deals (${real} real, ${deals.length - real} demo; was ${previous}) to ${OUT}.`);
