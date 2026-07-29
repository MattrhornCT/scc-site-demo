// Shared Branded Client Gifting tier lookup — used by both the main
// OrderForm and the standalone /corporate enquiry form so the volume-pricing
// logic lives in one place.
import { priceTiers } from './pricing.js';

export const GIFTING_TIERS = priceTiers('gifting_tier_');

export function giftingTierFor(dozens) {
  const tier = GIFTING_TIERS.find((t) => dozens >= (t.min ?? 0) && (t.max == null || dozens <= t.max));
  return tier || GIFTING_TIERS[GIFTING_TIERS.length - 1];
}
