import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { loadGallery, photoMatchesFilters, isColorGroup, isValidCssColor } from '../gallery/loadGallery.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

// Real gallery items + filter lists (Airtable-backed) — nothing hard-coded here.
const { photos: ALL_PHOTOS, groups: FILTER_GROUPS } = loadGallery();

function titleCase(s) {
  return s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

function ColourDot({ value, size = 12 }) {
  const background = isValidCssColor(value) ? value.toLowerCase() : '#ccc';
  return <span aria-hidden="true" style={{ width: size, height: size, borderRadius: '50%', background, boxShadow: 'inset 0 0 0 1px rgba(58,40,32,.2)', flex: 'none', display: 'inline-block' }} />;
}

const pill = { font: "600 12px 'Hanken Grotesk'", background: '#f6dde3', color: '#8a3550', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' };

export default function Gallery({ go }) {
  usePageMeta("Gallery — Shelby's Cookie Co.", 'Browse custom hand-iced sugar cookie designs by occasion, theme or colour.');
  const [active, setActive] = useState({});
  const [open, setOpen] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const toggle = (groupKey, value) => {
    setActive((s) => {
      const cur = new Set(s[groupKey] ? Array.from(s[groupKey]) : []);
      const k = value.toLowerCase();
      if (cur.has(k)) cur.delete(k); else cur.add(k);
      return { ...s, [groupKey]: cur };
    });
  };
  const clearFilters = () => setActive({});

  const activeCount = Object.values(active).reduce((n, s) => n + (s ? s.size : 0), 0);
  const hasFilters = activeCount > 0;
  const filtered = useMemo(() => ALL_PHOTOS.filter((p) => photoMatchesFilters(p, active)), [active]);
  const countLabel = `${filtered.length} ${filtered.length === 1 ? 'design' : 'designs'}${hasFilters ? ' · filtered' : ''}`;

  const colourGroup = FILTER_GROUPS.find((g) => isColorGroup(g.key));
  const otherGroups = FILTER_GROUPS.filter((g) => g.key !== 'occasion' && !isColorGroup(g.key));
  const meta = (photo) => {
    const colours = (colourGroup && photo.properties[colourGroup.key]) || [];
    const extras = otherGroups.map((g) => photo.properties[g.key]).filter((v) => v && v.length);
    return { colours, extras: extras.map((v) => v.join(', ')).join(' · ') };
  };

  const chip = (group, value) => {
    const on = !!active[group.key]?.has(value.toLowerCase());
    return (
      <button key={value} type="button" className="chip" onClick={() => toggle(group.key, value)} aria-pressed={on}
        style={{ background: on ? '#3a2820' : '#fbf6f0', color: on ? '#fbf6f0' : '#3a2820', border: '1.5px solid ' + (on ? '#3a2820' : '#efe2d3') }}>
        {isColorGroup(group.key) && <ColourDot value={value} size={11} />}
        {value}
      </button>
    );
  };

  const sel = open;
  const selMeta = sel ? meta(sel) : null;

  return (
    <main>
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '64px 40px 40px', textAlign: 'center' }}>
        <div className="kicker" style={{ color: '#b4506d', marginBottom: 16 }}>The cookie book</div>
        <h1 className="serif h1" style={{ fontSize: 72, fontWeight: 400, letterSpacing: '-.035em', lineHeight: 1, margin: '0 0 18px' }}>A little of <em style={{ fontWeight: 300, color: '#b4506d' }}>everything sweet</em></h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: '#5c463c', maxWidth: 540, margin: '0 auto' }}>Browse past designs by occasion, theme or colour — then start a custom order inspired by any of them.</p>
      </section>

      <section style={{ maxWidth: 1380, margin: '0 auto', padding: '10px 40px 100px' }}>
        <div className="glayout" style={{ display: 'grid', gridTemplateColumns: FILTER_GROUPS.length ? '240px minmax(0,1fr)' : 'minmax(0,1fr)', gap: 36, alignItems: 'start' }}>
          {FILTER_GROUPS.length > 0 && (
            <aside>
              <button type="button" className="chip ftoggle" onClick={() => setShowFilters((o) => !o)} aria-expanded={showFilters}
                style={{ background: '#3a2820', color: '#fbf6f0', border: '1.5px solid #3a2820', marginBottom: 14 }}>
                Filters {hasFilters ? `(${activeCount})` : ''} <span aria-hidden="true">{showFilters ? '⌃' : '⌄'}</span>
              </button>
              <div className={showFilters ? 'fpanel' : 'fpanel fpanel-closed'} style={{ background: '#fff', borderRadius: 22, padding: '24px 22px', boxShadow: '0 20px 40px -30px rgba(58,40,32,.45)', border: '1px solid #efe2d3' }}>
                {FILTER_GROUPS.map((group, i) => (
                  <div key={group.key}>
                    {i > 0 && <div className="beads" aria-hidden="true" style={{ color: '#f6dde3', margin: '22px 0 20px' }} />}
                    <div className="kicker" style={{ color: '#b4506d', fontSize: 11, marginBottom: 12 }}>{group.label}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>{group.values.map((v) => chip(group, v))}</div>
                  </div>
                ))}
                {hasFilters && <button type="button" className="link" onClick={clearFilters} style={{ marginTop: 24, color: '#b4506d', fontSize: 14 }}>Clear all filters</button>}
              </div>
              <div className="lift" style={{ marginTop: 18, background: '#f6dde3', borderRadius: 22, padding: 22 }}>
                <div className="hand" style={{ fontSize: 26, color: '#8a3550', lineHeight: 1.05, marginBottom: 10 }}>don't see quite what you're after?</div>
                <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.55, color: '#5c463c' }}>Every set is designed from scratch — tell me your idea.</p>
                <button type="button" className="link" onClick={() => go('order')} style={{ fontSize: 14 }}>Start a custom order →</button>
              </div>
            </aside>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <span className="serif" style={{ fontSize: 20, fontStyle: 'italic', color: '#5c463c' }} aria-live="polite">{countLabel}</span>
            </div>

            {ALL_PHOTOS.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '70px 24px', background: '#efe2d3', borderRadius: 22 }}>
                <h2 className="serif" style={{ fontSize: 34, fontWeight: 400, margin: '0 0 10px' }}>The cookie book is <em style={{ fontWeight: 300, color: '#b4506d' }}>just getting started</em></h2>
                <p style={{ color: '#5c463c', margin: 0 }}>Designs will show up here as soon as they're added.</p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="ggrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '26px 22px' }}>
                {filtered.map((photo) => {
                  const { colours } = meta(photo);
                  return (
                    <button key={photo.id} type="button" className="gcard tile" onClick={() => setOpen(photo)} aria-label={`View ${photo.label}`}>
                      <div style={{ background: '#efe2d3', borderRadius: 12, padding: '14px 14px 0', overflow: 'hidden' }}>
                        <img className="ph" src={photo.src} alt={photo.label} loading="lazy" style={{ width: '100%', aspectRatio: '1/1.1', objectFit: 'cover', display: 'block', borderRadius: '6px 6px 0 0' }} />
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <span className="serif" style={{ fontSize: 20 }}>{photo.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
                          {photo.occasion ? <span style={pill}>{titleCase(photo.occasion)}</span> : <span />}
                          <span style={{ display: 'flex', gap: 4 }}>{colours.map((c) => <ColourDot key={c} value={c} />)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '70px 24px', background: '#efe2d3', borderRadius: 22 }}>
                <h2 className="serif" style={{ fontSize: 34, fontWeight: 400, margin: '0 0 10px' }}>Nothing matches <em style={{ fontWeight: 300, color: '#b4506d' }}>just yet</em></h2>
                <p style={{ color: '#5c463c', margin: '0 0 22px' }}>Try clearing a filter — or start a custom order and I'll design it fresh.</p>
                <button type="button" className="btn" onClick={clearFilters}>Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {sel && createPortal(
        <div className="modal-bg" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={sel.label}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(58,40,32,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <div className="mgrid" onClick={(e) => e.stopPropagation()}
            style={{ background: '#fbf6f0', borderRadius: 24, maxWidth: 1200, width: '100%', height: 'min(86vh,800px)', display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(320px,.8fr)', overflow: 'hidden', boxShadow: '0 40px 80px -30px rgba(0,0,0,.5)' }}>
            <div style={{ background: '#efe2d3', height: '100%', minHeight: 0 }}>
              <img src={sel.srcLarge} alt={sel.label} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </div>
            <div style={{ padding: '36px 34px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24, overflowY: 'auto' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  {sel.occasion ? <span style={{ ...pill, fontSize: 12, padding: '5px 11px' }}>{titleCase(sel.occasion)}</span> : <span />}
                  <button type="button" className="arrow" onClick={() => setOpen(null)} aria-label="Close" style={{ width: 40, height: 40, fontSize: 15 }}>✕</button>
                </div>
                <h2 className="serif" style={{ fontSize: 42, fontWeight: 400, letterSpacing: '-.03em', lineHeight: 1.05, margin: '18px 0 12px' }}>{sel.label}</h2>
                {selMeta.extras && <p style={{ margin: '0 0 16px', color: '#5c463c', lineHeight: 1.6 }}>{selMeta.extras}</p>}
                {selMeta.colours.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {selMeta.colours.map((c) => <ColourDot key={c} value={c} size={13} />)}
                    <span style={{ fontSize: 13, color: '#5c463c', marginLeft: 6 }}>{selMeta.colours.join(' · ')}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="hand" style={{ fontSize: 24, color: '#8a3550', margin: '0 0 12px' }}>love this? I can make something like it for you.</p>
                <button type="button" className="btn" onClick={() => { setOpen(null); go('order'); }}>Start an order inspired by this</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
