# Shelby's Cookie Co. — site migration & rebuild brief

You are working in a local checkout of an existing Vite + React demo site for a custom decorated sugar cookie business in the Greater Toronto Area. The demo replaces a live Wix site at `shelbyscookieco.ca`. Your job is to migrate the hosting, restructure the data layer so the owner can run the site without a developer, add two new revenue-focused sections, and preserve search rankings during the domain move.

Read this whole brief before starting. Ask me before making irreversible changes to DNS or deleting anything from the existing repo.

---

## Business context (this drives several decisions — don't ignore it)

- Solo operator. ~$60K/yr revenue, ~12% COGS. Already at or near production capacity for hand-piped custom work.
- Growth cannot come from more custom dozens. It has to come from higher revenue per hour: corporate/branded gifting, low-labour shippable products, and better pricing on small orders.
- **The owner is not technical.** Any workflow that requires editing code, committing to git, or managing folders will not be used. This is the single most important constraint in this brief. When you have a choice between an elegant implementation and one the owner can operate alone, choose the latter.
- Existing channels that work: word of mouth, Google search, Instagram. Google rankings are a real asset and must survive the migration.

---

## Phase 0 — Hosting migration (do this first, before any code changes)

Move from GitHub Pages to **Cloudflare Pages**. Reason: GitHub Pages cannot issue real 301 redirects, and we need them for the domain migration. Cloudflare Pages is free, uses the same git-push workflow, and supports `_redirects` and `_headers` files.

1. Create a Cloudflare Pages project connected to the GitHub repo, building from `main`.
   - Build command: `npm run build`
   - Output directory: `dist`
2. Set `base` in `vite.config.js` back to `'/'` (it is currently set for the `/scc-site-demo/` GitHub Pages subpath). Verify no hardcoded `/scc-site-demo/` paths remain anywhere in the source.
3. Delete `.github/workflows/deploy.yml` — Cloudflare handles builds now. Keep it in git history.
4. Verify the site works on the `*.pages.dev` preview URL before touching DNS.
5. **Custom domain.** The domain registration appears to be with Squarespace. Do NOT transfer the registrar. Instead, add `shelbyscookieco.ca` and `www.shelbyscookieco.ca` as custom domains in Cloudflare Pages and update the DNS records at Squarespace to point at Cloudflare. Confirm with me before the DNS cutover — this is the only step that takes the live site down if done wrong.
6. Pick one canonical host (recommend apex `shelbyscookieco.ca`) and 301 the other to it.

Write the exact DNS records I need to enter at Squarespace into a `MIGRATION.md` file at the repo root, along with a rollback procedure.

---

## Phase 1 — Static generation and SEO preservation

The current build is a client-rendered SPA. That will lose the existing Google rankings. Fix it.

**Migrate to Astro with React islands.** Keep `OrderForm.jsx` and the gallery filter UI as React components (`client:load` / `client:visible`); make every page a static `.astro` route so real HTML, titles, and meta descriptions ship in the initial response. If you judge that a full Astro migration is too large a change, the fallback is `vite-plugin-ssg` — but Astro is the better long-term fit and I'd prefer it. Tell me which you chose and why before you start moving files.

### URL map — these paths must resolve exactly as they do today

The live Wix site uses these routes. Recreate them at the same paths. Do not invent new ones for existing content.

| Path | Page |
|---|---|
| `/` | Home |
| `/about` | About / Meet Shelby |
| `/menus` | Pricing |
| `/order-now` | Order form |
| `/gallery` | Gallery |
| `/contact` | Contact |

Add a `public/_redirects` file with 301s for any path that does change, plus `www` → apex.

### Per-page SEO requirements

- Unique `<title>` and `<meta name="description">` per route. Pull the existing Wix meta descriptions as a starting point — they are well-targeted for "custom sugar cookies North York / Toronto" and shouldn't be discarded, only improved.
- Open Graph and Twitter card tags per route, with a relevant image.
- Canonical URL on every page.
- Generate `sitemap.xml` and `robots.txt` at build.
- Add JSON-LD `LocalBusiness` (subtype `Bakery`) structured data on the home page: name, address area served (Greater Toronto Area), URL, social profiles, price range.
- Every gallery image needs a descriptive `alt` derived from its Airtable label and occasion tags — not the filename.

---

## Phase 2 — Airtable as the site's admin panel

This is the core of the brief. The owner must be able to change prices and add gallery photos without touching code.

Three concerns move into Airtable: orders (already designed), pricing, and gallery.

### Table: `Orders` — keep as currently specified

One row per submitted order. Fields: `Name`, `Email`, `Phone`, `Event Date`, `Total`, `Small Batch Fee`, `Order Summary`, `Device Type`, `Photos` (attachment), `Status` (single select: New, Reviewed, Quoted, Confirmed, Declined), `Items` (link to Items).

**Add two fields:** `Marketing Opt In` (checkbox) and `Source` (single select: Website, Instagram, Referral, Corporate, Other — default Website).

### Table: `Items` — keep as currently specified

Fields: `Order` (link to Orders), `Product` (single select), `Variant`, `Details`, `Description` (long text), `Count` (number), `Price` (currency).

Extend the `Product` single select to include `Branded Client Gifting`.

### Table: `Pricing` — new

One row per priced thing. The order form reads these values instead of the hardcoded constants currently in `OrderForm.jsx` (`DOZEN`, `PEBBLE_META`, shape surcharges, colour surcharges).

| Field | Type | Notes |
|---|---|---|
| `Key` | Single line text (primary) | Stable machine key, e.g. `cookies_base_dozen`, `shape_custom_surcharge`, `colour_extra_each`, `small_batch_fee`, `pebbles_small`, `pebbles_medium`, `pebbles_large`, `pebbles_extra_dip`, `gifting_tier_1`, `gifting_tier_2`, `gifting_tier_3` |
| `Label` | Single line text | Human name shown in Airtable only |
| `Amount` | Currency | The number the site uses |
| `Unit` | Single select | `per dozen`, `per order`, `per item`, `per colour`, `per dip` |
| `Min Quantity` | Number | For volume tiers; blank otherwise |
| `Max Quantity` | Number | For volume tiers; blank otherwise |
| `Active` | Checkbox | Lets her retire a product without deleting the row |
| `Notes` | Long text | Her own reminders |

The code must key off `Key`, never off row order or row ID. If a `Key` the code expects is missing or inactive, fail the build loudly with a clear message naming the missing key — do not silently fall back to a default price.

### Table: `Gallery` — new

One row per photo. This replaces the `src/gallery-images/` folder convention and `manifest.csv` entirely.

| Field | Type | Notes |
|---|---|---|
| `Title` | Single line text (primary) | Used for `alt` text |
| `Image` | Attachment | Single image per row |
| `Occasion` | Multiple select | Wedding, Baby Shower, Bridal Shower, Birthday, Corporate, Holiday, Baptism, Other |
| `Theme` | Multiple select | Free-growing list, e.g. Floral, Minimalist, Kids, Elegant, Sports |
| `Colour` | Multiple select | Pink, Neutral, Blue, Pastel, Bold, Gold |
| `Featured` | Checkbox | Shows on home page "recently out of the oven" strip |
| `Sort Order` | Number | Manual ordering; blank sorts last |
| `Active` | Checkbox | Hide without deleting |

The gallery filter groups on the site must be generated from the distinct values present in `Occasion`, `Theme`, and `Colour` — so when she adds a new theme in Airtable, a new filter option appears with no code change.

### Data flow

Fetch `Pricing` and `Gallery` **at build time**, not at runtime. Runtime fetches would expose the API token, slow the page, and break SEO for gallery images.

1. Build script pulls both tables via the Airtable API using a token in a Cloudflare environment variable (`AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`). Never commit the token.
2. Download each gallery image at build, convert to WebP, generate responsive sizes (400/800/1600px wide), cap quality so no file exceeds ~150KB. Several current images are 300–530KB PNGs — that's a slow first impression on mobile, which is where most of the traffic is.
3. Emit `alt`, `width`, `height` and `loading="lazy"` on every gallery image to prevent layout shift.
4. Cache downloaded images between builds so a price change doesn't re-download the whole gallery.

**Publishing.** Create a Cloudflare Pages deploy hook (a URL that triggers a rebuild). Add a button field to the Airtable `Pricing` and `Gallery` tables labelled "Publish changes to website" that calls that URL. This is how she ships changes: edit in Airtable, click the button, wait two minutes. Document this in a `HANDOVER.md` written for a non-technical reader — no jargon, screenshots-shaped instructions, and a "what to do if it doesn't work" section with my contact details.

---

## Phase 3 — Pricing and product changes

These are business decisions, already made. Implement them as specified.

### 3a. Small batch fee: $5 → $25

Currently a flat `+$5` when total cookie count is under 24. Change to `$25`, sourced from the `small_batch_fee` Pricing key. Reason: design consult, mockup, dough, icing colours, cleanup and pickup coordination are near-identical for one dozen and four, so $5 does not cover the fixed cost of a batch.

Present it in the UI as information, not a penalty: something like "Orders under 2 dozen include a $25 small batch fee — this covers the setup and design time that's the same whatever the size." Nudge upward at the same time: show what two dozen would cost, since some customers will convert up rather than pay the fee.

### 3b. Remove the printed-cookie discount

Currently printed decoration is `-$5` off the base and carries a "Save $5/dozen" badge, with copy saying it "comes in easier on price, too." Delete all of it — the discount, the badge, and the copy.

Printed edible-image cookies are the fastest, most scalable, highest-margin-per-hour product. Framing them as the budget option anchors corporate buyers low and produces the price pushback the business is already getting. Price printed at parity with hand-piped or above, from the Pricing table.

### 3c. New product: Branded Client Gifting

Add as a distinct product in the order form, alongside Custom Sugar Cookies and Cookie Pebbles — not a variant of custom.

- Minimum order: 4 dozen.
- Volume tiers, read from Pricing rows using `Min Quantity` / `Max Quantity`:
  - `gifting_tier_1`: 4–8 dozen, $95/dozen
  - `gifting_tier_2`: 9–15 dozen, $85/dozen
  - `gifting_tier_3`: 16+ dozen, $75/dozen
- Fields: company name, number of dozens, logo file upload, brand colours (freeform text), event or gifting occasion, delivery date, delivery address.
- The tier should update live as they change quantity, and show the per-dozen rate alongside the total so the volume saving is visible.

### 3d. New page: `/corporate`

A dedicated landing page for branded client gifting. This must not read like the custom cookie page with different words — the buyer, the budget, and the comparison set are all different.

Content requirements:
- Frame the product against corporate gifting and branded swag, not against catering. A dozen logo-accurate edible client gifts sits naturally next to branded merchandise budgets; it looks expensive next to a sandwich tray.
- Target the occasions explicitly: real estate closings, mortgage broker client gifts, clinic and med-spa referral thank-yous, law firm client gifting, conference and trade show handouts, branch and office openings, employee milestones.
- Show the volume pricing table openly. Corporate buyers need a number before they'll start a conversation, and publishing it filters out the small-budget enquiries that currently consume time.
- Lead time, delivery and invoicing terms. State that invoicing and PO numbers are accommodated — this is a real objection for corporate buyers and the current site doesn't address it.
- A separate, shorter enquiry form for corporate (fewer creative questions, more logistics), posting to the same backend with `Product = Branded Client Gifting`.
- Its own title, meta description and OG image targeting "corporate cookies Toronto", "branded cookies GTA", "logo cookies Toronto".

Design note: give this page its own visual register — more restrained, less decorative than the consumer pages — while staying recognisably the same brand. It should feel like a supplier a procurement person is comfortable emailing.

---

## Phase 4 — Trust and capture

The business has three years of happy customers and zero public proof anywhere. This is the cheapest conversion win available and it's currently missing from both the live site and the demo.

1. **Testimonials.** Add a `Testimonials` Airtable table (`Quote`, `Customer Name`, `Occasion`, `Date`, `Featured` checkbox, `Active` checkbox) and a testimonial section on the home page, the order page, and `/corporate`. Ship it with placeholder rows clearly marked so the layout is testable before real quotes exist.
2. **Email capture.** Add a `Marketing Opt In` checkbox to the details step of the order form ("Email me when seasonal boxes and pre-orders open") and a standalone signup in the footer. Write opt-ins to Airtable. This list is what makes seasonal pre-order drops work — a previous Easter drop got zero orders partly because there was no list to announce it to. Include a plain unsubscribe path; CASL applies here since this is a Canadian business emailing Canadian customers.
3. **Process transparency.** Keep the existing four-step "how it works" section and surface it on the order page too, not just the home page. "Approve your proof before anything bakes" is the sentence that makes a stranger comfortable committing to a custom product — it should appear directly above the form.
4. **Rewrite the order page preamble.** The live Wix version leads with two weeks notice, a non-refundable deposit, a disclaimer that submitting doesn't confirm anything, a minimum, two allergen warnings and weekday-only pickup — with no reassurance at all. Keep every policy, but sequence it: what happens next → social proof → then terms, in a collapsible "Ordering details & policies" section below the form.

---

## Phase 5 — Form and backend hardening

The order form is the only revenue path on the site. It currently POSTs to an open, unauthenticated Google Apps Script endpoint deployed with "Anyone" access.

1. **Honeypot field.** Hidden input that real users never fill; reject any submission where it's non-empty.
2. **Backup email.** The Apps Script must email the owner a plain-text copy of every order in addition to writing to Airtable, so no order is ever lost to an Airtable API failure.
3. **Visible failure.** If the POST fails, the form must show the owner's email address and a copy-to-clipboard button containing the full order summary, so the customer can complete the order manually instead of hitting a dead end. Never fail silently.
4. **Basic rate limiting** in the Apps Script: reject more than N submissions from the same email or IP within a short window.
5. **Deployment URL churn.** `SETUP.md` notes that redeploying the Apps Script issues a new `/exec` URL unless updated in place. Move `APPS_SCRIPT_URL` out of `src/config.js` and into a Cloudflare environment variable so it can be changed without a code commit.
6. Consider replacing the Apps Script entirely with a Cloudflare Pages Function (`/functions/order.js`) writing directly to Airtable. Same hosting, one less system, secrets stay in Cloudflare, no redeploy-URL problem. Evaluate this and recommend one — don't just do it.

---

## Phase 6 — Deliverables

Alongside the code:

- `MIGRATION.md` — DNS records, cutover steps, rollback procedure.
- `HANDOVER.md` — written for the non-technical owner. How to change a price. How to add a gallery photo. How to add a testimonial. How to publish changes. What to do when something looks wrong. No jargon.
- `README.md` — for a future developer. Architecture, env vars, build, deploy.

---

## Acceptance criteria

- [ ] Site builds and deploys on Cloudflare Pages from a `main` push.
- [ ] All six existing URL paths resolve; nothing 404s; `www` 301s to apex.
- [ ] `curl` on any page returns real HTML with a unique title and meta description — not an empty SPA shell.
- [ ] Changing a price in Airtable and clicking the publish button updates the live site with no code change.
- [ ] Adding a gallery photo in Airtable and clicking publish makes it appear, correctly filtered, with sensible `alt` text and no image over ~150KB.
- [ ] Order form reads every price from Airtable; no pricing constants remain in the source.
- [ ] Small batch fee is $25; printed cookies carry no discount or savings badge anywhere.
- [ ] Branded Client Gifting is orderable with working volume tiers, and `/corporate` is live and indexed.
- [ ] A submitted test order lands in Airtable with a linked Items row and attached photos, AND arrives by email.
- [ ] Simulated backend failure shows the fallback email and copy button, not a silent error.
- [ ] Lighthouse mobile performance and SEO both ≥ 90.
- [ ] Keyboard navigable, visible focus states, works down to 360px wide.

---

## Working style

Work in phases and stop for review after each one. Don't refactor beyond what's asked. Where you disagree with a decision in this brief, say so and give your reasoning before implementing — several of these are judgement calls and I'd rather hear the objection than find it in the code.
