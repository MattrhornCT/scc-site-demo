# Shelby's Cookie Co. — setup checklist

Everything code-related is done. These pieces need to happen outside the repo, by you.

## 1. Airtable

- [ ] Create the Airtable base (if you haven't already) with the tables below.
- [ ] Generate an Airtable personal access token / API key — the same token is used by the order backend (`functions/order.js`, writes) and by the site's own build step (`scripts/fetch-airtable.mjs`, price/gallery reads).

### Table: `Orders` (existing — add two fields)

Same as before, plus:

| Field | Type | Notes |
|---|---|---|
| `Marketing Opt In` | Checkbox | No form UI sets this yet — the order backend always writes `false` until the Phase 4 email-capture checkbox is built. |
| `Source` | Single select (`Website`, `Instagram`, `Referral`, `Corporate`, `Other`) | The order backend always writes `Website` for now — nothing on the site sets this yet either. |

### Table: `Items` (existing — extend one field)

- [ ] Add `Branded Client Gifting` as an option on the `Product` single select. Both the main order form and the `/corporate` enquiry form send this product now (Phase 3c) — without this option, Airtable will reject those Item records.

### Table: `Pricing` (new)

One row per priced thing. `npm run build` (and `npm run dev`) reads this table at build time and fails loudly if a row the site needs is missing or not Active — it never guesses a price.

| Field | Type |
|---|---|
| `Key` | Single line text (primary) |
| `Label` | Single line text |
| `Amount` | Currency |
| `Unit` | Single select (`per dozen`, `per order`, `per item`, `per colour`, `per dip`) |
| `Min Quantity` | Number |
| `Max Quantity` | Number |
| `Active` | Checkbox |
| `Notes` | Long text |

**Fast path:** import [airtable-import/Pricing.csv](airtable-import/Pricing.csv) directly (Airtable → your base → Add table → Import → CSV file) instead of creating rows by hand — it already has all the rows below. After importing, double-check field types, since CSV import guesses them from the data: `Amount` should be **Currency**, `Min Quantity`/`Max Quantity` should be **Number**, `Unit` should be **Single select**, `Active` should be **Checkbox** (values of `checked` import as checked automatically).

Create one **Active** row for each of these:

| Key | Amount | Unit | Min Quantity | Max Quantity | Notes |
|---|---|---|---|---|---|
| `cookies_base_dozen` | 80 | per dozen | | | base price/dozen, hand-iced |
| `shape_custom_surcharge` | 1 | per dozen | | | custom cutter shape |
| `colour_extra_each` | 4 | per dozen | | | per icing colour beyond 3 included |
| `deco_printed_adjustment` | 0 | per dozen | | | printed priced at parity with hand-iced — no discount (Phase 3b) |
| `small_batch_fee` | 25 | per order | | | applies when the order has under 2 dozen cookies; covers fixed setup/design time (Phase 3a) |
| `pebbles_small` | 15 | per item | | | 36 pieces, 1 dip included |
| `pebbles_medium` | 20 | per item | | | 72 pieces, 2 dips included |
| `pebbles_large` | 25 | per item | | | 108 pieces, 3 dips included |
| `pebbles_extra_dip` | 3 | per dip | | | beyond the included count |
| `gifting_tier_1` | 95 | per dozen | 4 | 8 | Branded Client Gifting per-dozen rate, 4–8 dozen |
| `gifting_tier_2` | 85 | per dozen | 9 | 15 | Branded Client Gifting per-dozen rate, 9–15 dozen |
| `gifting_tier_3` | 75 | per dozen | 16 | (blank) | Branded Client Gifting per-dozen rate, 16+ dozen |

**If you already have this table populated from an earlier round:** `small_batch_fee` and `deco_printed_adjustment` changed value as part of Phase 3 (the small-batch fee went from $5 to $25, and the printed-cookie discount was removed). Update those two rows' `Amount` in your live base to 25 and 0 — the code changes (new copy, no discount badge) already shipped, but they'll only show correctly once the live values match. `gifting_tier_1/2/3` also went from optional/unread to required — if you added them earlier from [airtable-import/Pricing.csv](airtable-import/Pricing.csv) they're already in place; the build now fails loudly if they're missing or inactive, same as every other price.

### Table: `Gallery` (new)

One row per photo. Replaces the old `src/gallery-images/` folder + `manifest.csv` convention entirely — the site no longer reads those files.

| Field | Type | Notes |
|---|---|---|
| `Title` | Single line text (primary) | Shown under the photo on the gallery page |
| `Image` | Attachment | One image per row |
| `Occasion` | Multiple select (Wedding, Baby Shower, Bridal Shower, Birthday, Corporate, Holiday, Baptism, Other) | |
| `Theme` | Multiple select | Free-growing — a new value here creates a new filter chip automatically |
| `Colour` | Multiple select | Same — free-growing |
| `Featured` | Checkbox | Shows the photo in the homepage "recently out of the oven" strip |
| `Sort Order` | Number | Manual ordering; blank sorts last |
| `Active` | Checkbox | Uncheck to hide a photo without deleting the row (replaces the old `archive/` folder) |

**Fast path for the table structure:** import [airtable-import/Gallery.csv](airtable-import/Gallery.csv) to create the table with the right columns. It has 2 rows clearly marked `PLACEHOLDER` — they exist only so Airtable can guess the right field types from real-looking data (`Occasion`/`Theme`/`Colour` as **Multiple select**, `Featured`/`Active` as **Checkbox**). After importing:
1. Delete both `PLACEHOLDER` rows.
2. Change the `Image` column's field type to **Attachment** (CSV import can't carry image files, so this column comes in empty and as plain text — Airtable won't guess Attachment on its own).
3. Change `Sort Order` to **Number** if it didn't import as one.
4. Add your real rows, dragging each photo directly into its row's `Image` cell.

The gallery will show **empty** on the site until you add rows here — that's expected, same as the order form showing its visible-failure message until the pieces below are set up.

## 2. Cloudflare Pages (hosting + order backend)

The demo has moved off GitHub Pages — Cloudflare Pages issues real 301 redirects (which GitHub Pages can't) and is what the real `shelbyscookieco.ca` migration will need later, so the demo now builds the same way. The order form's backend also lives here now: `functions/order.js` is a Cloudflare Pages Function (file-based routing — it automatically handles `POST /order`, no separate deploy step beyond the Pages project itself).

- [ ] In the [Cloudflare dashboard](https://dash.cloudflare.com), create a **Pages** project connected to this GitHub repo (`MattrhornCT/scc-site-demo`), building from the `main` branch.
  - Build command: `npm run build`
  - Output directory: `dist`
- [ ] Add two **environment variables** on the Pages project (Settings → Environment variables) — these are read both by the build-time Airtable fetch and by `functions/order.js` at request time:
  - `AIRTABLE_TOKEN`
  - `AIRTABLE_BASE_ID`

  These are required — the build step that fetches `Pricing`/`Gallery` fails loudly without them, by design (see the `Pricing` table section above).
- [ ] Create a KV namespace and bind it to the project (this is two separate steps in the current Cloudflare dashboard):
  1. In the sidebar, go to **KV** (under Storage & Databases) → **Create instance**. Name it whatever you like, e.g. `scc-order-rate-limit`, and create it — no value needed, just the name.
  2. Go to your Pages project → **Settings → Bindings → Add → KV namespace**. Set **Variable name** to exactly `RATE_LIMIT_KV`, then pick the namespace you just created from the dropdown. Do this for the **Production** environment (Preview isn't needed unless you're testing preview deploys).
  3. Redeploy for the binding to take effect.

  This is what `functions/order.js` uses to reject more than 5 order submissions from the same email or IP within 10 minutes. If this binding is missing, the Function still works — it just skips rate limiting rather than breaking real orders — so it's safe to add any time, but do it before the site goes live publicly.
- [ ] Trigger a deploy (push to `main`, or use "Retry deployment" in the dashboard) and confirm the site loads correctly at the `*.pages.dev` URL Cloudflare gives you.
- [ ] Submit one real test order with a photo attached, then check: a new row appears in Airtable (with a linked Item row), and the photo shows up directly in the **Photos** attachment field — photos go straight into Airtable's own storage via its upload-attachment API, nothing touches Google Drive or any other file host.
- [ ] Nothing else yet — no custom domain, no DNS changes. That's a separate step for when you do the real `shelbyscookieco.ca` migration (see `scc-site-update-brief.md`), not part of this round.

### Local development

Create a `.env` file at the repo root (already gitignored) with the same two variables:

```
AIRTABLE_TOKEN=your_token_here
AIRTABLE_BASE_ID=your_base_id_here
```

`npm run dev` and `npm run build` both fetch fresh Pricing/Gallery data from Airtable first (via `npm run fetch-airtable`), so both need this file locally.

To test the order form against the real `functions/order.js` locally (plain `npm run dev` only serves the site, not the Function):

- [ ] Create a `.dev.vars` file at the repo root (already gitignored, same format as `.env`) with `AIRTABLE_TOKEN` and `AIRTABLE_BASE_ID`.
- [ ] Run `npm run dev:cf` instead of `npm run dev`. This builds the site and serves the built output with `wrangler pages dev`, so `functions/order.js` runs for real (with an ad-hoc local KV namespace) — no Vite hot-reload in this mode, but it's the more accurate emulation of production Wrangler itself recommends, and Vite's own `--proxy` mode hit a wrangler/miniflare bug in testing.

## 3. Real gallery photos

Gallery photos are now managed entirely in Airtable's `Gallery` table (see section 1 above) — the old `src/gallery-images/` folder, `manifest.csv`, and `archive/` folder are no longer read by the site. To add or update a photo, add or edit a row in Airtable; to hide one, uncheck `Active`.

## 4. Branded Client Gifting & the `/corporate` page

Phase 3 added a third order-form product (alongside Custom Sugar Cookies and Cookie Pebbles) plus a dedicated `/corporate` landing page with its own shorter enquiry form, both posting to the same `functions/order.js` backend. One thing worth knowing: **`/corporate` isn't a real URL yet** — there's no router in this app (`src/App.jsx` is a plain `view` state switch, same as `home`/`gallery`/`order`), so it's reachable only via the "Corporate" nav/footer link, not by typing `/corporate` directly or sharing that link. Real per-path URLs are Phase 1 work (the Astro/SSG migration), not done yet.

## Field names — confirmed, form and backend match
The order form builds its own `FormData` in JS and POSTs it to `/order` (see the `submitOrder` function in `src/components/OrderForm.jsx` and `CorporateEnquiryForm` in `src/pages/Corporate.jsx`), and `functions/order.js` reads the same field names — all three sides are mine, so there's nothing left to reconcile:

| Field | Contents |
|---|---|
| `name`, `email`, `phone`, `eventDate` | Contact details (`eventDate` doubles as "delivery date" on the corporate form) |
| `total`, `smallBatchFee` | Numbers |
| `itemsJson` | JSON array of cart items (cookies/pebbles/gifting, each with its own shape) |
| `orderSummary` | Plain-text version of the same, for quick reading in a spreadsheet or email |
| `deviceType` | `"mobile"` or `"desktop"`, set from viewport width right before submit |
| `photo1`, `photo2`, `photo3` | Up to 3 uploaded inspiration photos, or a single logo file for a gifting order |

## Airtable base schema
Two linked tables — `functions/order.js` writes to these exact field names.

**Orders** — one row per submitted order:

| Airtable field | Type | Source |
|---|---|---|
| Name | Single line text | `name` |
| Email | Email | `email` |
| Phone | Phone number | `phone` |
| Event Date | Date | `eventDate` |
| Total | Currency | `total` |
| Small Batch Fee | Currency | `smallBatchFee` |
| Order Summary | Long text | `orderSummary` — quick-glance plain text, in case you don't want to open the linked items |
| Device Type | Single select (`desktop`, `mobile`) | `deviceType` |
| Photos | Attachment | `photo1`/`photo2`/`photo3`, uploaded directly into this field via Airtable's own upload-attachment API — no Google Drive involved |
| Status | Single select (`New`, `Reviewed`, `Quoted`, `Confirmed`) | not from the form — the order backend sets `New`, you change it manually as you work orders |
| Marketing Opt In | Checkbox | not from the form yet — the order backend always writes `false` (see section 1) |
| Source | Single select (`Website`, `Instagram`, `Referral`, `Corporate`, `Other`) | not from the form yet — the order backend always writes `Website` (see section 1) |
| Items | Link to another record (Items) | auto-created by Airtable as the reverse of the link on the Items table below — don't create this one manually |

**Items** — one row per line item (a single order can have several: e.g. 2 dozen cookies + 1 pebbles order = 2 rows):

| Airtable field | Type | Source |
|---|---|---|
| Order | Link to another record (Orders) | set by the order backend when it creates the row |
| Product | Single select (`Sugar Cookies`, `Cookie Pebbles`, `Branded Client Gifting`) | |
| Variant | Single line text | Shape for cookies (e.g. "Circle", "Custom: Unicorn cutter") · Size for pebbles (e.g. "Medium") · dozens for gifting (e.g. "8 dozen") |
| Details | Single line text | Decoration for cookies (e.g. "3 colours", "Printed") · Dips for pebbles, comma-separated · brand colours for gifting |
| Description | Long text | Cookies: customer's freeform design notes · Gifting: company name / occasion / delivery address, one per line · blank for pebbles |
| Count | Number | Cookies: number of cookies · Pebbles: number of pebble-units ordered (each unit is a bag per the Size field, not individual pieces) · Gifting: number of dozens |
| Price | Currency | This line item's price only |

## Legacy: Google Apps Script backend (deprecated, not in use)

[apps-script-backend.gs](apps-script-backend.gs) was the original order backend before the site moved to Cloudflare Pages. It's kept in the repo only as a rollback reference — nothing deploys it, and `src/config.js` no longer points at it. If `functions/order.js` ever needs to be backed out, the file still has the same Airtable field mapping and its own setup instructions in its header comment.
