// Gallery data comes from Airtable's `Gallery` table (see
// scc-site-update-brief.md, Phase 2), fetched and image-processed at build
// time by scripts/fetch-airtable.mjs into src/data/gallery.generated.json —
// never at runtime, so the Airtable token never ships to the browser.
//
// Filter groups (Occasion/Theme/Colour) are derived from whichever values
// are actually present across active photos, so adding a new Theme value in
// Airtable creates a new filter chip with no code change.
import photosData from '../data/gallery.generated.json';

function titleCase(s) {
  return s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

let colorProbe;
export function isValidCssColor(value) {
  if (typeof document === 'undefined' || !value) return false;
  if (!colorProbe) colorProbe = document.createElement('span');
  colorProbe.style.color = '';
  colorProbe.style.color = value;
  return colorProbe.style.color !== '';
}

export function isColorGroup(key) {
  const k = (key || '').toLowerCase();
  return k === 'colour' || k === 'color';
}

const PROPERTY_KEYS = ['occasion', 'theme', 'colour'];

export function loadGallery() {
  const photos = photosData.map((p) => {
    const properties = {};
    PROPERTY_KEYS.forEach((key) => {
      if (p[key] && p[key].length) properties[key] = p[key];
    });
    const imageEntries = Object.entries(p.images || {});
    const src = (p.images && p.images['800']) || (imageEntries[0] && imageEntries[0][1]) || '';
    // Higher-res variant for large frames (hero tiles, lightbox) — falls back to 800.
    const srcLarge = (p.images && (p.images['1600'] || p.images['800'])) || src;

    return {
      id: p.id,
      src,
      srcLarge,
      occasion: (p.occasion && p.occasion[0]) || '',
      label: p.title || '',
      properties,
      featured: !!p.featured,
      sortOrder: typeof p.sortOrder === 'number' ? p.sortOrder : null,
    };
  }).sort((a, b) => a.label.localeCompare(b.label));

  const groups = PROPERTY_KEYS
    .map((key) => {
      const seen = new Map();
      photos.forEach((p) => {
        (p.properties[key] || []).forEach((v) => {
          const k = v.toLowerCase();
          if (!seen.has(k)) seen.set(k, v);
        });
      });
      if (!seen.size) return null;
      return {
        key,
        label: titleCase(key),
        values: Array.from(seen.values()).sort((a, b) => a.localeCompare(b)),
      };
    })
    .filter(Boolean);

  return { photos, groups };
}

// Featured photos, manually ordered by Sort Order (blank sorts last) — set
// directly in Airtable, replacing the old "most recently committed" ranking.
export function getRecentPhotos(n = 4) {
  const { photos } = loadGallery();
  const featured = photos
    .filter((p) => p.featured)
    .sort((a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity));
  // Pad with non-featured photos so a section never looks half-empty.
  return featured.concat(photos.filter((p) => !p.featured)).slice(0, n);
}

// Photos whose Occasion or Theme matches any of the given keywords
// (case-insensitive), featured/sorted first. Used to pick real gallery photos
// for the home/corporate pages instead of hard-coded images.
export function getPhotosMatching(keywords, n = 4) {
  const { photos } = loadGallery();
  const keys = keywords.map((k) => k.toLowerCase());
  const hit = (p) => keys.some((k) =>
    p.occasion.toLowerCase().includes(k) ||
    Object.values(p.properties).some((vals) => vals.some((v) => v.toLowerCase().includes(k))));
  return photos
    .filter(hit)
    .sort((a, b) => (b.featured - a.featured) || ((a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity)))
    .slice(0, n);
}

export function photoMatchesFilters(photo, activeFilters) {
  return Object.entries(activeFilters).every(([key, activeSet]) => {
    if (!activeSet || !activeSet.size) return true;
    const values = (photo.properties[key] || []).map((v) => v.toLowerCase());
    return Array.from(activeSet).some((v) => values.includes(v.toLowerCase()));
  });
}
