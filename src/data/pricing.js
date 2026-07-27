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
