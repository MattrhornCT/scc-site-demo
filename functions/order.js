// Shelby's Cookie Co. — order intake backend (Cloudflare Pages Function)
//
// Replaces apps-script-backend.gs (kept in the repo, deprecated, as a
// rollback reference). Same Airtable field mapping, but same-origin now, so
// OrderForm.jsx can use a normal fetch() and read a real success/failure
// response instead of the old hidden-iframe multipart-POST trick.
//
// File-based routing: this file handles POST /order.
//
// Required env vars/bindings (Cloudflare Pages project settings):
//   AIRTABLE_TOKEN, AIRTABLE_BASE_ID — same ones used by scripts/fetch-airtable.mjs
//   RATE_LIMIT_KV — a KV namespace bound under this exact name (see SETUP.md)
// Optional overrides: AIRTABLE_ORDERS_TABLE, AIRTABLE_ITEMS_TABLE, AIRTABLE_PHOTOS_FIELD
// Test-only overrides (production always uses the real Airtable API):
//   AIRTABLE_API_BASE, AIRTABLE_CONTENT_API_BASE

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 minutes

export async function onRequestGet() {
  return new Response("Shelby's Cookie Co. order endpoint is running.");
}

export async function onRequestPost({ request, env }) {
  try {
    const form = await request.formData();

    // Honeypot: real users never see or fill this field (see OrderForm.jsx).
    // Respond as if it succeeded so a bot has no signal it was caught.
    const gotcha = (form.get('companyWebsite') || '').toString().trim();
    if (gotcha) {
      return Response.json({ ok: true });
    }

    const email = (form.get('email') || '').toString().trim().toLowerCase();
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    if (env.RATE_LIMIT_KV) {
      const ipOk = await checkRateLimit(env.RATE_LIMIT_KV, `rl:ip:${ip}`);
      const emailOk = !email || await checkRateLimit(env.RATE_LIMIT_KV, `rl:email:${email}`);
      if (!ipOk || !emailOk) {
        return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 });
      }
    }
    // If RATE_LIMIT_KV isn't bound yet (e.g. local dev without --kv, or
    // before the dashboard binding is set up), fail open rather than
    // breaking real orders — see SETUP.md for the one-time binding step.

    const ordersTable = env.AIRTABLE_ORDERS_TABLE || 'Orders';
    const itemsTable = env.AIRTABLE_ITEMS_TABLE || 'Items';
    const photosField = env.AIRTABLE_PHOTOS_FIELD || 'Photos';

    const orderFields = {
      'Name': (form.get('name') || '').toString(),
      'Email': (form.get('email') || '').toString(),
      'Phone': (form.get('phone') || '').toString(),
      'Event Date': (form.get('eventDate') || '').toString(),
      'Total': parseNumber(form.get('total')),
      'Small Batch Fee': parseNumber(form.get('smallBatchFee')),
      'Order Summary': (form.get('orderSummary') || '').toString(),
      'Device Type': (form.get('deviceType') || '').toString(),
      'Status': 'New',
      // No form UI sets these yet (Phase 4 email-capture work) — default
      // them so the Orders schema is ready ahead of that.
      'Source': 'Website',
      'Marketing Opt In': false,
    };

    const orderRecord = await createAirtableRecord(env, ordersTable, orderFields);

    for (const key of ['photo1', 'photo2', 'photo3']) {
      const file = form.get(key);
      if (file && typeof file === 'object' && 'size' in file && file.size > 0) {
        await uploadAttachmentToAirtable(env, orderRecord.id, photosField, file);
      }
    }

    const items = parseItems(form.get('itemsJson'));
    for (const item of items) {
      await createAirtableRecord(env, itemsTable, itemToAirtableFields(item, orderRecord.id));
    }

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: err.message || String(err) }, { status: 502 });
  }
}

// Basic counter with a resetting TTL — not perfectly atomic under heavy
// concurrent bursts, but enough to blunt casual abuse of a cookie order form.
async function checkRateLimit(kv, key) {
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;
  if (count >= RATE_LIMIT_MAX) return false;
  await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  return true;
}

function parseItems(json) {
  try {
    const arr = JSON.parse(json || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    return [];
  }
}

// itemsJson items come in three shapes depending on product — see OrderForm.jsx.
// Cookies: { product, shape, decoration, description, quantity, price }
// Pebbles: { product, size, dips, units, price }
// Gifting: { product, company, dozens, colours, occasion, address, price }
function itemToAirtableFields(item, orderRecordId) {
  const fields = {
    'Order': [orderRecordId],
    'Product': item.product || '',
    'Price': parseNumber(item.price),
  };
  if (item.product === 'Cookie Pebbles') {
    fields['Variant'] = item.size || '';
    fields['Details'] = Array.isArray(item.dips) ? item.dips.join(', ') : '';
    fields['Count'] = parseNumber(item.units);
  } else if (item.product === 'Branded Client Gifting') {
    fields['Variant'] = `${item.dozens || 0} dozen`;
    fields['Details'] = item.colours || '';
    fields['Description'] = [
      item.company ? `Company: ${item.company}` : '',
      item.occasion ? `Occasion: ${item.occasion}` : '',
      item.address ? `Delivery address: ${item.address}` : '',
    ].filter(Boolean).join('\n');
    fields['Count'] = parseNumber(item.dozens);
  } else {
    fields['Variant'] = item.shape || '';
    fields['Details'] = item.decoration || '';
    fields['Description'] = item.description || '';
    fields['Count'] = parseNumber(item.quantity);
  }
  return fields;
}

async function uploadAttachmentToAirtable(env, recordId, photosField, file) {
  const base64 = arrayBufferToBase64(await file.arrayBuffer());
  const base = env.AIRTABLE_CONTENT_API_BASE || 'https://content.airtable.com/v0';
  const url = `${base}/${env.AIRTABLE_BASE_ID}/${recordId}/${encodeURIComponent(photosField)}/uploadAttachment`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contentType: file.type || 'application/octet-stream',
      filename: file.name || 'photo',
      file: base64,
    }),
  });
  if (!res.ok) {
    throw new Error(`Airtable attachment upload error ${res.status}: ${await res.text()}`);
  }
}

async function createAirtableRecord(env, table, fields) {
  const base = env.AIRTABLE_API_BASE || 'https://api.airtable.com/v0';
  const url = `${base}/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    throw new Error(`Airtable error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

function parseNumber(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

// Chunked to avoid a call-stack overflow on String.fromCharCode.apply for
// larger images — Workers has no Node Buffer to lean on here.
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
