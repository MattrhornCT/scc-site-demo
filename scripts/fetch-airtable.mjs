// Build-time Airtable fetch — runs via the `predev`/`prebuild` npm scripts,
// before Vite ever starts. Pulls the `Pricing` and `Gallery` tables and
// writes static JSON + processed images that the app reads at build time.
// This keeps the Airtable token out of the shipped bundle and out of any
// runtime request (see scc-site-update-brief.md, Phase 2 "Data flow").
//
// Required env vars: AIRTABLE_TOKEN, AIRTABLE_BASE_ID.
// Optional overrides: AIRTABLE_PRICING_TABLE (default "Pricing"),
// AIRTABLE_GALLERY_TABLE (default "Gallery").

import { mkdir, readFile, writeFile, copyFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE_DIR = path.join(ROOT, '.cache', 'airtable-gallery');
const PUBLIC_GALLERY_DIR = path.join(ROOT, 'public', 'gallery-generated');
const DATA_DIR = path.join(ROOT, 'src', 'data');

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const PRICING_TABLE = process.env.AIRTABLE_PRICING_TABLE || 'Pricing';
const GALLERY_TABLE = process.env.AIRTABLE_GALLERY_TABLE || 'Gallery';
// Override point for local testing against a mock server; production always
// uses the real Airtable API.
const AIRTABLE_API_BASE = process.env.AIRTABLE_API_BASE || 'https://api.airtable.com/v0';

// Every key OrderForm.jsx currently needs. Adding a new priced thing to the
// order form means adding its key here too, so a missing row fails the build
// instead of silently pricing something at $0.
const REQUIRED_PRICING_KEYS = [
  'cookies_base_dozen',
  'shape_custom_surcharge',
  'colour_extra_each',
  'deco_printed_adjustment',
  'small_batch_fee',
  'pebbles_small',
  'pebbles_medium',
  'pebbles_large',
  'pebbles_extra_dip',
];

const IMAGE_WIDTHS = [400, 800, 1600];
const MAX_BYTES = 150 * 1024;
const QUALITY_STEPS = [80, 65, 50, 35];

function fail(message) {
  console.error(`\nAirtable fetch failed: ${message}\n`);
  console.error('See SETUP.md for how to create the Airtable base and set AIRTABLE_TOKEN / AIRTABLE_BASE_ID.\n');
  process.exit(1);
}

async function airtableFetchAll(table) {
  const records = [];
  let offset;
  do {
    const url = new URL(`${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`);
    url.searchParams.set('pageSize', '100');
    if (offset) url.searchParams.set('offset', offset);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      fail(`Airtable API error ${res.status} fetching "${table}": ${body}`);
    }
    const json = await res.json();
    records.push(...json.records);
    offset = json.offset;
  } while (offset);
  return records;
}

async function buildPricing() {
  const records = await airtableFetchAll(PRICING_TABLE);
  const active = records.filter((r) => r.fields.Active);

  const byKey = {};
  active.forEach((r) => {
    const key = (r.fields.Key || '').trim();
    if (!key) return;
    byKey[key] = {
      amount: typeof r.fields.Amount === 'number' ? r.fields.Amount : Number(r.fields.Amount) || 0,
      unit: r.fields.Unit || '',
      minQuantity: r.fields['Min Quantity'] ?? null,
      maxQuantity: r.fields['Max Quantity'] ?? null,
    };
  });

  const missing = REQUIRED_PRICING_KEYS.filter((k) => !(k in byKey));
  if (missing.length) {
    fail(
      `the "${PRICING_TABLE}" table is missing (or has inactive) required key(s): ${missing.join(', ')}. ` +
      `Add an Active row for each in Airtable — the site refuses to guess a price.`
    );
  }

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(path.join(DATA_DIR, 'pricing.generated.json'), JSON.stringify(byKey, null, 2));
  console.log(`Pricing: wrote ${Object.keys(byKey).length} active key(s).`);
}

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

// Encodes one attachment into 400/800/1600px WebP files, using a cached copy
// keyed by the Airtable attachment id when one already exists on disk so an
// unchanged photo isn't re-downloaded/re-encoded on the next build.
async function processImage(attachment) {
  const cacheBase = path.join(CACHE_DIR, attachment.id);
  const outputs = {};

  const alreadyCached = await Promise.all(
    IMAGE_WIDTHS.map((w) => fileExists(`${cacheBase}-${w}.webp`))
  );

  if (alreadyCached.every(Boolean)) {
    for (const w of IMAGE_WIDTHS) {
      const cached = `${cacheBase}-${w}.webp`;
      const dest = path.join(PUBLIC_GALLERY_DIR, `${attachment.id}-${w}.webp`);
      await copyFile(cached, dest);
      outputs[w] = `/gallery-generated/${attachment.id}-${w}.webp`;
    }
    return outputs;
  }

  const res = await fetch(attachment.url);
  if (!res.ok) fail(`could not download gallery image ${attachment.filename} (${res.status})`);
  const original = Buffer.from(await res.arrayBuffer());

  for (const width of IMAGE_WIDTHS) {
    let buffer;
    for (const quality of QUALITY_STEPS) {
      buffer = await sharp(original)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
      if (buffer.length <= MAX_BYTES) break;
    }
    if (buffer.length > MAX_BYTES) {
      console.warn(`  ${attachment.filename} @ ${width}px still ${(buffer.length / 1024).toFixed(0)}KB after quality reduction.`);
    }
    const cached = `${cacheBase}-${width}.webp`;
    const dest = path.join(PUBLIC_GALLERY_DIR, `${attachment.id}-${width}.webp`);
    await writeFile(cached, buffer);
    await writeFile(dest, buffer);
    outputs[width] = `/gallery-generated/${attachment.id}-${width}.webp`;
  }
  return outputs;
}

async function buildGallery() {
  const records = await airtableFetchAll(GALLERY_TABLE);
  const active = records.filter((r) => r.fields.Active);

  await mkdir(CACHE_DIR, { recursive: true });
  await mkdir(PUBLIC_GALLERY_DIR, { recursive: true });

  const photos = [];
  for (const r of active) {
    const image = (r.fields.Image || [])[0];
    if (!image) {
      console.warn(`Gallery row "${r.fields.Title || r.id}" is Active but has no Image attached — skipping.`);
      continue;
    }
    const images = await processImage(image);
    const occasion = r.fields.Occasion || [];
    photos.push({
      id: r.id,
      title: r.fields.Title || '',
      occasion,
      theme: r.fields.Theme || [],
      colour: r.fields.Colour || [],
      featured: !!r.fields.Featured,
      sortOrder: typeof r.fields['Sort Order'] === 'number' ? r.fields['Sort Order'] : null,
      images,
    });
  }

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(path.join(DATA_DIR, 'gallery.generated.json'), JSON.stringify(photos, null, 2));
  console.log(`Gallery: wrote ${photos.length} active photo(s).`);
}

async function main() {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    fail('AIRTABLE_TOKEN and/or AIRTABLE_BASE_ID are not set in the environment.');
  }
  await buildPricing();
  await buildGallery();
}

main().catch((err) => fail(err.stack || err.message || String(err)));
