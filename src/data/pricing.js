// Thin accessor over the build-time Airtable fetch (see
// scripts/fetch-airtable.mjs). That script already fails the build if a
// required key is missing or inactive, so `price()` throwing here would only
// ever fire if OrderForm asks for a key nobody told the fetch script to
// require — i.e. a real bug, not a data-entry gap.
import generated from './pricing.generated.json';

export function price(key) {
  const entry = generated[key];
  if (!entry) {
    throw new Error(`Missing Pricing key "${key}" — add an Active row for it in Airtable (see SETUP.md).`);
  }
  return entry.amount;
}

// For volume-tiered pricing (e.g. gifting_tier_1/2/3), where a whole family
// of keys sharing a prefix is needed rather than one fixed amount.
export function priceTiers(prefix) {
  return Object.entries(generated)
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, entry]) => ({ key, amount: entry.amount, min: entry.minQuantity, max: entry.maxQuantity }))
    .sort((a, b) => (a.min ?? 0) - (b.min ?? 0));
}
