import { useMemo, useState } from 'react';
import { TESTIMONIALS } from '../data/testimonials.js';
import { loadGallery } from '../gallery/loadGallery.js';

const { photos: ALL_PHOTOS } = loadGallery();

// Pick a real gallery photo for each review: same occasion/theme if there is
// one, otherwise cycle through the gallery so every review still has a photo.
function photoFor(t, i) {
  const key = (t.tag || '').toLowerCase().replace(/\s*gifting$/, '');
  const match = ALL_PHOTOS.filter((p) =>
    p.occasion.toLowerCase() === (t.tag || '').toLowerCase() ||
    (key && Object.values(p.properties).some((vals) => vals.some((v) => v.toLowerCase() === key))));
  const pool = match.length ? match : ALL_PHOTOS;
  return pool.length ? pool[i % pool.length] : null;
}

export default function Testimonials() {
  const [i, setI] = useState(0);
  const n = TESTIMONIALS.length;
  const idx = ((i % n) + n) % n;
  const t = TESTIMONIALS[idx];
  const photos = useMemo(() => TESTIMONIALS.map(photoFor), []);
  const photo = photos[idx];
  const counter = String(idx + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');

  return (
    <section style={{ background: '#f6dde3', color: '#3a2820', position: 'relative' }}>
      <div className="beads" aria-hidden="true" style={{ color: '#ecc3cf', position: 'absolute', top: 14, left: 0, right: 0 }} />
      <div className="two" style={{ maxWidth: 1240, margin: '0 auto', padding: '100px 40px', display: 'grid', gridTemplateColumns: photo ? 'minmax(0,.8fr) minmax(0,1.2fr)' : 'minmax(0,1fr)', gap: 72, alignItems: 'center' }}>
        {photo && (
          <div className="tile q" key={'p' + idx}>
            <div style={{ background: '#ecc3cf', borderRadius: '400px 400px 14px 14px', padding: '20px 20px 0', overflow: 'hidden', boxShadow: '0 30px 60px -34px rgba(58,40,32,.5)' }}>
              <img className="ph" src={photo.srcLarge} alt={photo.label} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block', borderRadius: '380px 380px 0 0' }} />
            </div>
          </div>
        )}
        <div>
          <div className="kicker" style={{ color: '#8a3550', marginBottom: 26 }}>Kind words</div>
          <div className="serif" aria-hidden="true" style={{ fontSize: 120, lineHeight: .5, color: '#d58aa1', height: 50 }}>“</div>
          <blockquote className="serif q" key={'q' + idx} style={{ margin: '0 0 34px', fontSize: 42, lineHeight: 1.18, fontWeight: 300, letterSpacing: '-.02em' }}>{t.quote}</blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {t.company && (
                <div style={{ width: 132, height: 58, borderRadius: 12, background: '#fbf6f0', border: '1.5px dashed #d58aa1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                  {t.logo
                    ? <img src={t.logo} alt={t.company + ' logo'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    : <span style={{ font: "700 11px 'Hanken Grotesk'", letterSpacing: '.08em', textTransform: 'uppercase', color: '#8a3550', textAlign: 'center' }}>{t.company}</span>}
                </div>
              )}
              <div>
                <div className="hand" style={{ fontSize: 30, lineHeight: 1, color: '#b4506d' }}>{t.name}</div>
                <div style={{ font: "600 14px 'Hanken Grotesk'", color: '#8a3550', marginTop: 4 }}>{t.tag}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: '#8a3550' }}>{counter}</span>
              <button type="button" className="arrow" onClick={() => setI(idx - 1)} aria-label="Previous review">←</button>
              <button type="button" className="arrow" onClick={() => setI(idx + 1)} aria-label="Next review">→</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
