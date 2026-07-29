import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { loadGallery, photoMatchesFilters, isColorGroup, isValidCssColor } from '../gallery/loadGallery.js';

const { photos: ALL_PHOTOS, groups: FILTER_GROUPS } = loadGallery();

function chipStyle(active) {
  return {
    cursor: 'pointer',
    fontFamily: "'Hanken Grotesk',sans-serif",
    fontWeight: 600,
    fontSize: 12.5,
    padding: '8px 14px',
    borderRadius: 30,
    border: '1.5px solid ' + (active ? '#49331f' : '#e6d8cc'),
    background: active ? '#49331f' : '#fff',
    color: active ? '#fbf4ee' : '#6b524a',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    transition: 'all .18s ease',
  };
}

function ColourDot({ value, size = 12 }) {
  const background = isValidCssColor(value) ? value.toLowerCase() : '#ccc';
  return <span style={{ width: size, height: size, borderRadius: '50%', background, border: '1.5px solid rgba(255,255,255,.7)', boxShadow: '0 0 0 1px rgba(74,53,46,.12)', flex: 'none' }} />;
}

export default function Gallery() {
  const [active, setActive] = useState({});
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(true);

  useEffect(() => {
    if (!lightboxPhoto) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') setLightboxPhoto(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxPhoto]);

  const toggle = (groupKey, value) => {
    setActive((s) => {
      const cur = new Set(s[groupKey] ? Array.from(s[groupKey]) : []);
      const k = value.toLowerCase();
      if (cur.has(k)) cur.delete(k); else cur.add(k);
      return { ...s, [groupKey]: cur };
    });
  };
  const clearFilters = () => setActive({});

  const hasFilters = Object.values(active).some((s) => s && s.size);
  const filtered = useMemo(
    () => ALL_PHOTOS.filter((p) => photoMatchesFilters(p, active)),
    [active]
  );

  const countLabel = `${filtered.length} ${filtered.length === 1 ? 'design' : 'designs'}${hasFilters ? ' · filtered' : ''}`;

  const colourGroup = FILTER_GROUPS.find((g) => isColorGroup(g.key));
  const otherGroups = FILTER_GROUPS.filter((g) => g.key !== 'occasion' && !isColorGroup(g.key));

  const photoMeta = (photo) => {
    const colourValues = (colourGroup && photo.properties[colourGroup.key]) || [];
    const taglineParts = [titleCase(photo.occasion)];
    otherGroups.forEach((g) => {
      const v = photo.properties[g.key];
      if (v && v.length) taglineParts.push(v.join('/'));
    });
    return { colourValues, taglineParts };
  };

  const activeCount = Object.values(active).reduce((n, s) => n + (s ? s.size : 0), 0);

  return (
    <main className="page-pad" style={{ maxWidth: 1180, margin: '0 auto', paddingTop: 54, paddingBottom: 72 }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ display: 'inline-block', background: '#f9dbe3', color: '#96566b', border: '1.5px dashed #d98da8', borderRadius: 30, padding: '6px 15px', font: "700 11.5px 'Hanken Grotesk'", letterSpacing: '.05em', transform: 'rotate(-1.5deg)' }}>✿ The cookie book</span>
      </div>
      <h1 className="hero-title-sm" style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 46, letterSpacing: '-.02em', margin: '12px 0 8px', textAlign: 'center' }}>A little of everything sweet</h1>
      <p style={{ textAlign: 'center', color: '#8a6f63', fontSize: 16, margin: '0 auto 34px', maxWidth: 520 }}>Browse past designs by occasion, theme or colour — then start a custom order inspired by any of them.</p>

      <div className="gallery-layout" style={{ display: 'flex', alignItems: 'flex-start', gap: 28 }}>
        {FILTER_GROUPS.length > 0 && filtersOpen && (
          <aside className="gallery-sidebar" style={{ flex: '0 0 250px', background: '#fff', border: '1.5px solid #efe4d9', borderRadius: 22, padding: '20px 20px', boxShadow: '0 14px 30px -24px rgba(74,53,46,.5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {FILTER_GROUPS.map((group, i) => (
                <div key={group.key}>
                  {i > 0 && <div style={{ height: 1, background: '#f2e8dd', marginBottom: 18 }} />}
                  <div style={{ font: "700 11px 'Hanken Grotesk'", letterSpacing: '.14em', textTransform: 'uppercase', color: '#a86a3e', marginBottom: 10 }}>{group.label}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {group.values.map((value) => {
                      const isActive = active[group.key]?.has(value.toLowerCase());
                      return (
                        <button key={value} className="cta" onClick={() => toggle(group.key, value)} style={chipStyle(isActive)}>
                          {isColorGroup(group.key) && <ColourDot value={value} />}
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {FILTER_GROUPS.length > 0 && (
                <button
                  onClick={() => setFiltersOpen((o) => !o)}
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, background: filtersOpen ? '#49331f' : '#fff', color: filtersOpen ? '#fbf4ee' : '#4a352e', border: '1.5px solid ' + (filtersOpen ? '#49331f' : '#e6d8cc'), borderRadius: 30, padding: '9px 15px', font: "700 12.5px 'Hanken Grotesk'" }}
                >
                  Filters{activeCount > 0 ? ` (${activeCount})` : ''}
                  <span style={{ display: 'inline-block', transition: 'transform .2s ease', transform: filtersOpen ? 'rotate(180deg)' : 'none' }}>⌄</span>
                </button>
              )}
              <span style={{ font: "600 14px 'Hanken Grotesk'", color: '#8a6f63' }}>{countLabel}</span>
            </div>
            {hasFilters && <button onClick={clearFilters} style={{ cursor: 'pointer', background: 'none', border: 'none', font: "700 13px 'Hanken Grotesk'", color: '#a86a3e' }}>✕ Clear filters</button>}
          </div>

          {ALL_PHOTOS.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f7ece4', borderRadius: 22 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🍪</div>
              <h3 style={{ font: "800 22px 'Bricolage Grotesque'", color: '#49331f', margin: '0 0 6px' }}>The cookie book is just getting started</h3>
              <p style={{ font: "500 14px 'Hanken Grotesk'", color: '#8a6f63', margin: 0 }}>Photos will show up here once they're added to src/gallery-images.</p>
            </div>
          ) : filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 20 }}>
              {filtered.map((photo) => {
                const { colourValues, taglineParts } = photoMeta(photo);
                return (
                  <div key={photo.id} className="gcard" style={{ background: '#fff', border: '1.5px solid #efe4d9', borderRadius: 20, overflow: 'hidden', boxShadow: '0 14px 30px -24px rgba(74,53,46,.5)' }}>
                    <div
                      onClick={() => setLightboxPhoto(photo)}
                      style={{ aspectRatio: '1', background: '#f3e6de', cursor: 'zoom-in' }}
                    >
                      <img src={photo.src} alt={photo.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                    <div style={{ padding: '14px 16px 16px' }}>
                      <div style={{ font: "700 15px 'Hanken Grotesk'", color: '#49331f', marginBottom: 3 }}>{photo.label}</div>
                      <div style={{ font: "500 12px 'Hanken Grotesk'", color: '#8a6f63', marginBottom: 10 }}>{taglineParts.join(' · ')}</div>
                      {colourValues.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {colourValues.map((c) => <ColourDot key={c} value={c} size={13} />)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f7ece4', borderRadius: 22 }}>
              <div style={{ fontSize: 40, marginBottom: 12, animation: 'sway 3s ease-in-out infinite' }}>🍪</div>
              <h3 style={{ font: "800 22px 'Bricolage Grotesque'", color: '#49331f', margin: '0 0 6px' }}>No designs match those filters yet</h3>
              <p style={{ font: "500 14px 'Hanken Grotesk'", color: '#8a6f63', margin: '0 0 18px' }}>Try clearing a filter — or start a custom order and we'll design it fresh.</p>
              <button onClick={clearFilters} style={{ cursor: 'pointer', background: '#49331f', color: '#fbf4ee', border: 'none', borderRadius: 30, padding: '12px 24px', font: "700 14px 'Hanken Grotesk'" }}>Clear filters</button>
            </div>
          )}
        </div>
      </div>

      {lightboxPhoto && createPortal((() => {
        const { colourValues, taglineParts } = photoMeta(lightboxPhoto);
        return (
          <div
            onClick={() => setLightboxPhoto(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(35,24,18,.82)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              aria-label="Close"
              style={{ position: 'absolute', top: 20, right: 24, cursor: 'pointer', background: 'rgba(255,255,255,.14)', color: '#fbf4ee', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 20, lineHeight: 1 }}
            >✕</button>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', maxWidth: 'min(92vw, 780px)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -20px rgba(0,0,0,.5)' }}
            >
              <img
                src={lightboxPhoto.src}
                alt={lightboxPhoto.label}
                style={{ width: '100%', maxHeight: '72vh', objectFit: 'contain', display: 'block', background: '#f3e6de' }}
              />
              <div style={{ padding: '16px 20px' }}>
                <div style={{ font: "700 17px 'Hanken Grotesk'", color: '#49331f', marginBottom: 3 }}>{lightboxPhoto.label}</div>
                <div style={{ font: "500 13px 'Hanken Grotesk'", color: '#8a6f63', marginBottom: colourValues.length ? 10 : 0 }}>{taglineParts.join(' · ')}</div>
                {colourValues.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {colourValues.map((c) => <ColourDot key={c} value={c} size={13} />)}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })(), document.body)}
    </main>
  );
}

function titleCase(s) {
  return s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
}
