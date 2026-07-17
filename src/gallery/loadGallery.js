// Occasion comes from the folder a photo lives in (src/gallery-images/<occasion>/photo.jpg).
// Every other filter group is derived dynamically from whichever columns exist in
// manifest.csv, so adding a new column there (e.g. "shape") automatically creates a
// new filter group with no code changes. A photo with no manifest row still shows up,
// just without those extra tags.

const imageModules = import.meta.glob(
  '../gallery-images/*/*.{jpg,jpeg,png,webp,gif,svg,JPG,JPEG,PNG,WEBP,GIF,SVG}',
  { eager: true, import: 'default' }
);
const manifestModules = import.meta.glob('../gallery-images/manifest.csv', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    if (row.some((v) => v !== '')) rows.push(row);
  }
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, i) => { obj[h] = (r[i] || '').trim(); });
    return obj;
  });
}

function titleCase(s) {
  return s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

function labelFromFilename(filename) {
  return titleCase(filename.replace(/\.[^.]+$/, ''));
}

function splitValues(cell) {
  return (cell || '').split('|').map((v) => v.trim()).filter(Boolean);
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

function readManifestRows() {
  const path = Object.keys(manifestModules)[0];
  const raw = path ? manifestModules[path] : '';
  return parseCsv(raw || '');
}

export function loadGallery() {
  const manifestRows = readManifestRows();

  const manifestByFilename = new Map();
  manifestRows.forEach((row) => {
    if (row.filename) manifestByFilename.set(row.filename.toLowerCase(), row);
  });

  const manifestColumns = manifestRows.length
    ? Object.keys(manifestRows[0]).filter((k) => !['filename', 'label'].includes(k.toLowerCase()))
    : [];

  const photos = Object.keys(imageModules).map((path) => {
    const parts = path.split('/');
    const occasion = parts[parts.length - 2];
    const filename = parts[parts.length - 1];
    const manifestRow = manifestByFilename.get(filename.toLowerCase()) || {};

    const properties = { occasion: [occasion] };
    manifestColumns.forEach((col) => {
      const values = splitValues(manifestRow[col]);
      if (values.length) properties[col] = values;
    });

    return {
      id: path,
      src: imageModules[path],
      occasion,
      label: (manifestRow.label && manifestRow.label.trim()) || labelFromFilename(filename),
      properties,
    };
  }).sort((a, b) => a.label.localeCompare(b.label));

  const groupOrder = ['occasion', ...manifestColumns];
  const groups = groupOrder
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

export function photoMatchesFilters(photo, activeFilters) {
  return Object.entries(activeFilters).every(([key, activeSet]) => {
    if (!activeSet || !activeSet.size) return true;
    const values = (photo.properties[key] || []).map((v) => v.toLowerCase());
    return Array.from(activeSet).some((v) => values.includes(v.toLowerCase()));
  });
}
