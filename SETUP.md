# Shelby's Cookie Co. — setup checklist

Everything code-related is done. These pieces need to happen outside the repo, by you.

## 1. Airtable
- [ ] Create the Airtable base and the fields it needs to receive orders.
- [ ] Generate an Airtable personal access token / API key for the Apps Script to use.

## 2. Google Apps Script backend
[apps-script-backend.gs](apps-script-backend.gs) is written and matches the order form's payload exactly (no reconciliation needed — I wrote both sides).
- [ ] Go to [script.google.com](https://script.google.com) → New project → paste in the full contents of `apps-script-backend.gs`.
- [ ] Fill in `AIRTABLE_TOKEN` and `AIRTABLE_BASE_ID` at the top of the file. Leave `AIRTABLE_ORDERS_TABLE` / `AIRTABLE_ITEMS_TABLE` / `AIRTABLE_PHOTOS_FIELD` as-is unless you named those differently in Airtable.
- [ ] Deploy it as a Web App: **Deploy → New deployment → Web app**.
  - Execute as: **Me**
  - Who has access: **Anyone** (it must be reachable by anonymous site visitors — "Anyone with a Google account" will block real customers)
- [ ] Visit the deployed `/exec` URL directly in a browser once — you should see "Shelby's Cookie Co. order endpoint is running." That confirms the deployment works before testing a real order.
- [ ] Copy the `/exec` URL and paste it into [src/config.js](src/config.js) as `APPS_SCRIPT_URL`. Until that's filled in, the order form shows an alert instead of submitting (so it fails loudly, not silently).
- [ ] Every time you edit and redeploy the Apps Script, Google gives you a **new** `/exec` URL unless you deploy as an update to the same deployment — double check you're updating `src/config.js` if the URL changes.
- [ ] Submit one real test order with a photo attached, then check: a new row appears in Airtable (with a linked Item row), and the photo shows up directly in the **Photos** attachment field — photos go straight into Airtable's own storage via its upload-attachment API, nothing touches Google Drive. If the photo doesn't show up, check **View → Logs** in the Apps Script editor for the error (this is the one part of this I couldn't test myself, since I can't run Apps Script from here).

## 3. GitHub Pages
- [ ] In the repo settings (`github.com/MattrhornCT/scc-site-demo/settings/pages`), set **Source** to **GitHub Actions**. The workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and deploys automatically on every push to `main` — no further action needed after this one toggle.
- [ ] First deploy will happen automatically once this is enabled and you push to `main`. Check the **Actions** tab if it doesn't show up at `https://mattrhornct.github.io/scc-site-demo/` within a couple minutes.

## 4. Real gallery photos
- [ ] The gallery currently ships with 4 placeholder SVG images (clearly labeled "PLACEHOLDER") so the filtering logic has something to show. Replace them with real photos:
  - Drop image files into `src/gallery-images/<occasion>/` — create a new folder for a new occasion (folder name becomes the Occasion filter value, e.g. `src/gallery-images/corporate/`).
  - Optionally add a line to `src/gallery-images/manifest.csv` for each photo: `filename,label,theme,colour`. Multiple values in one cell are separated by `|` (e.g. `Pink|Neutral`). A photo not listed in the manifest still shows up, just without the extra tags.
  - Adding a **new column** to `manifest.csv` (e.g. `shape`) automatically creates a new filter group on the gallery page — no code changes needed.
  - Any commit to `main` triggers an automatic rebuild + redeploy via GitHub Actions.

## Field names — confirmed, form and backend match
The order form POSTs these field names (see `src/components/OrderForm.jsx`, the hidden `<input>` block near the top of the `<form>`), and `apps-script-backend.gs` reads the same names — both sides are mine, so there's nothing left to reconcile:

| Field | Contents |
|---|---|
| `name`, `email`, `phone`, `eventDate` | Contact details |
| `total`, `smallBatchFee` | Numbers |
| `itemsJson` | JSON array of cart items (cookies/pebbles, each with its own shape) |
| `orderSummary` | Plain-text version of the same, for quick reading in a spreadsheet or email |
| `deviceType` | `"mobile"` or `"desktop"`, set from viewport width right before submit |
| `photo1`, `photo2`, `photo3` | Up to 3 uploaded inspiration photos |

## Airtable base schema
Two linked tables — the Apps Script writes to these exact field names.

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
| Status | Single select (`New`, `Reviewed`, `Quoted`, `Confirmed`) | not from the form — Apps Script sets `New`, you change it manually as you work orders |
| Items | Link to another record (Items) | auto-created by Airtable as the reverse of the link on the Items table below — don't create this one manually |

**Items** — one row per line item (a single order can have several: e.g. 2 dozen cookies + 1 pebbles order = 2 rows):

| Airtable field | Type | Source |
|---|---|---|
| Order | Link to another record (Orders) | set by the Apps Script when it creates the row |
| Product | Single select (`Sugar Cookies`, `Cookie Pebbles`) | |
| Variant | Single line text | Shape for cookies (e.g. "Circle", "Custom: Unicorn cutter") · Size for pebbles (e.g. "Medium") |
| Details | Single line text | Decoration for cookies (e.g. "3 colours", "Printed") · Dips for pebbles, comma-separated |
| Description | Long text | Cookies only — customer's freeform design notes, blank for pebbles |
| Count | Number | Cookies: number of cookies · Pebbles: number of pebble-units ordered (each unit is a bag per the Size field, not individual pieces) |
| Price | Currency | This line item's price only |
