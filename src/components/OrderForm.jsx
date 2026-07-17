import { useEffect, useRef, useState } from 'react';
import { APPS_SCRIPT_URL } from '../config.js';
import logo from '../assets/logo.png';
import logoBlack from '../assets/logo-black.svg';

const DOZEN = 80;
const DIPS = ['White Chocolate', 'Milk Chocolate', 'Dark Chocolate', 'Dulce de Leche', 'Maple Butter'];
const SHAPE_META = {
  circle: { label: 'Circle', surOrStock: 'In stock' },
  square: { label: 'Square', surOrStock: 'In stock' },
  custom: { label: 'Custom shape', surOrStock: '+$1/doz' },
};
const PEBBLE_META = {
  s: { label: 'Small', pcs: '36 pieces', price: 15, incl: 1 },
  m: { label: 'Medium', pcs: '72 pieces', price: 20, incl: 2 },
  l: { label: 'Large', pcs: '108 pieces', price: 25, incl: 3 },
};

function money(n) {
  n = Math.round(n * 100) / 100;
  return '$' + (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2));
}
function cookieDefault() { return { product: 'cookies', shape: 'circle', deco: 'colors', colors: 3, qty: 12, custom: '', qtyCustom: '', describe: '' }; }
function pebbleDefault() { return { product: 'pebbles', size: 'm', dips: [], units: 1 }; }
function qtyNum(it) { return it.qty === 'custom' ? (parseInt(it.qtyCustom, 10) || 0) : (it.qty || 0); }
function priceItem(it) {
  if (it.product === 'pebbles') {
    const meta = PEBBLE_META[it.size];
    const extra = Math.max(0, (it.dips || []).length - meta.incl) * 3;
    return (meta.price + extra) * (it.units || 1);
  }
  const shapeSur = it.shape === 'custom' ? 1 : 0;
  const decoAdj = it.deco === 'printed' ? -5 : Math.max(0, (it.colors || 0) - 3) * 4;
  const perDoz = DOZEN + shapeSur + decoAdj;
  return (perDoz * qtyNum(it)) / 12;
}
function assignFileToInput(inputEl, file) {
  if (!inputEl) return;
  const dt = new DataTransfer();
  if (file) dt.items.add(file);
  inputEl.files = dt.files;
}

const inputStyle = { width: '100%', background: '#fff', border: '1.5px solid #e6d8cc', borderRadius: 12, padding: '12px 14px', font: "500 14px 'Hanken Grotesk'", color: '#4a352e' };
const sectionLabel = { font: "700 11px 'Hanken Grotesk'", letterSpacing: '.14em', textTransform: 'uppercase', color: '#a86a3e', marginBottom: 11 };

export default function OrderForm() {
  const [view, setView] = useState('product');
  const [item, setItem] = useState(null);
  const [items, setItems] = useState([]);
  const [contact, setContactState] = useState({ name: '', email: '', phone: '', date: '' });
  const [photos, setPhotos] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [narrow, setNarrow] = useState(false);

  const rootRef = useRef(null);
  const deviceTypeRef = useRef(null);
  const photoRefs = [useRef(null), useRef(null), useRef(null)];
  const submittingRef = useRef(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => setNarrow(entries[0].contentRect.width < 720));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cookieQtyTotal = () => items.filter((x) => x.product === 'cookies').reduce((a, x) => a + qtyNum(x), 0);
  const smallBatchApplies = () => { const t = cookieQtyTotal(); return t > 0 && t < 24; };
  const orderTotal = () => { let t = items.reduce((a, x) => a + priceItem(x), 0); if (smallBatchApplies()) t += 5; return t; };
  const canAdd = (it) => {
    if (!it) return false;
    if (it.product === 'pebbles') return (it.dips || []).length >= 1 && (it.units || 0) >= 1;
    if (it.shape === 'custom' && !(it.custom || '').trim()) return false;
    return qtyNum(it) >= 1;
  };

  const pickProduct = (id) => { setItem(id === 'cookies' ? cookieDefault() : pebbleDefault()); setView('build'); };
  const setField = (patch) => setItem((it) => ({ ...it, ...patch }));
  const incColors = (d) => setItem((it) => ({ ...it, colors: Math.min(6, Math.max(1, (it.colors || 3) + d)) }));
  const incUnits = (d) => setItem((it) => ({ ...it, units: Math.max(1, (it.units || 1) + d) }));
  const toggleDip = (name) => setItem((it) => {
    const cur = it.dips || [];
    return { ...it, dips: cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name] };
  });
  const addItem = () => { if (canAdd(item)) { setItems((arr) => [...arr, item]); setView('product'); setItem(null); } };
  const removeItem = (i) => setItems((arr) => arr.filter((_, k) => k !== i));
  const setContact = (f, v) => setContactState((c) => ({ ...c, [f]: v }));

  const onPhotos = (fileList) => {
    const files = Array.from(fileList || []).slice(0, 3);
    photos.forEach((p) => { try { URL.revokeObjectURL(p.url); } catch (e) {} });
    setPhotos(files.map((f) => ({ file: f, url: URL.createObjectURL(f), name: f.name })));
  };

  const itemView = (x, i) => {
    if (x.product === 'pebbles') {
      const meta = PEBBLE_META[x.size];
      return { idx: i, title: meta.label + ' Cookie Pebbles', sub: x.units + ' × ' + meta.pcs + ' · ' + (x.dips || []).length + ' dip' + ((x.dips || []).length === 1 ? '' : 's'), priceFmt: money(priceItem(x)), onRemove: () => removeItem(i) };
    }
    return {
      idx: i,
      title: x.shape === 'custom' ? (x.custom || 'Custom shape') : SHAPE_META[x.shape].label,
      sub: qtyNum(x) + ' cookies · ' + (x.deco === 'printed' ? 'Printed' : (x.colors + ' colour' + (x.colors > 1 ? 's' : ''))),
      priceFmt: money(priceItem(x)), onRemove: () => removeItem(i),
    };
  };

  const hasContact = !!(contact.name && contact.email);
  const itemViews = items.map((x, i) => itemView(x, i));
  const total = orderTotal();

  // Provisional field names/shape — pending reconciliation against the real apps-script-backend.gs.
  const itemsPayload = items.map((it) => (it.product === 'pebbles'
    ? { product: 'Cookie Pebbles', size: PEBBLE_META[it.size].label, dips: it.dips, units: it.units, price: priceItem(it) }
    : { product: 'Sugar Cookies', shape: it.shape === 'custom' ? it.custom : it.shape, decoration: it.deco === 'printed' ? 'printed' : (it.colors + ' colours'), description: it.describe || '', quantity: qtyNum(it), price: priceItem(it) }));
  const orderSummary = itemViews.map((v) => `${v.title} — ${v.sub} — ${v.priceFmt}`).join('\n');

  const handleSubmit = (e) => {
    if (!APPS_SCRIPT_URL) {
      e.preventDefault();
      alert("The order form isn't wired up to a backend yet (APPS_SCRIPT_URL is empty in src/config.js). This is expected until the Apps Script Web App is deployed.");
      return;
    }
    if (!hasContact || items.length === 0) { e.preventDefault(); return; }
    submittingRef.current = true;
    if (deviceTypeRef.current) deviceTypeRef.current.value = window.innerWidth < 768 ? 'mobile' : 'desktop';
    photoRefs.forEach((ref, i) => assignFileToInput(ref.current, photos[i]?.file));
    // No preventDefault from here — this is a real multipart/form-data POST to a hidden
    // iframe, not a fetch(), so the request isn't subject to CORS at all.
  };

  const handleIframeLoad = () => {
    if (submittingRef.current) { submittingRef.current = false; setSubmitted(true); }
  };

  const layoutClass = narrow ? 'cf-col' : 'cf-row';
  const notDetails = view !== 'details';

  return (
    <form
      ref={rootRef}
      className="cf-scroll"
      action={APPS_SCRIPT_URL || undefined}
      method="POST"
      encType="multipart/form-data"
      target="scc-order-submit-frame"
      onSubmit={handleSubmit}
      style={{ fontFamily: "'Hanken Grotesk',system-ui,sans-serif", color: '#4a352e', background: '#fbf4ee', minHeight: '100%', width: '100%', position: 'relative' }}
    >
      <input type="hidden" name="name" value={contact.name} readOnly />
      <input type="hidden" name="email" value={contact.email} readOnly />
      <input type="hidden" name="phone" value={contact.phone} readOnly />
      <input type="hidden" name="eventDate" value={contact.date} readOnly />
      <input type="hidden" name="total" value={total} readOnly />
      <input type="hidden" name="smallBatchFee" value={smallBatchApplies() ? 5 : 0} readOnly />
      <input type="hidden" name="itemsJson" value={JSON.stringify(itemsPayload)} readOnly />
      <input type="hidden" name="orderSummary" value={orderSummary} readOnly />
      <input type="hidden" name="deviceType" ref={deviceTypeRef} defaultValue="" />
      <input type="file" name="photo1" ref={photoRefs[0]} style={{ display: 'none' }} />
      <input type="file" name="photo2" ref={photoRefs[1]} style={{ display: 'none' }} />
      <input type="file" name="photo3" ref={photoRefs[2]} style={{ display: 'none' }} />
      <iframe title="order-submit-target" name="scc-order-submit-frame" style={{ display: 'none' }} onLoad={handleIframeLoad} />

      {notDetails && (
        <div style={{ padding: '24px 24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 20 }}>
            <img src={logo} alt="Shelby's Cookie Co." style={{ height: 42 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ font: "800 17px 'Bricolage Grotesque'", color: '#49331f' }}>Build your order</span>
              <span style={{ font: "500 12px 'Hanken Grotesk'", color: '#a86a3e' }}>pick a treat, make it yours, add it in</span>
            </div>
          </div>

          <div className={layoutClass}>
            <div style={{ flex: '1 1 auto', minWidth: 0, width: '100%' }}>

              {view === 'product' && (
                <>
                  <h2 style={{ font: "800 22px 'Bricolage Grotesque'", color: '#49331f', margin: '0 0 4px' }}>What would you like to add?</h2>
                  <p style={{ font: "500 13px 'Hanken Grotesk'", color: '#8a6f63', margin: '0 0 18px' }}>Add as many treats as you like — mix and match across your order.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { id: 'cookies', name: 'Custom Sugar Cookies', desc: 'Hand-iced or printed, any shape', from: 'from $80/doz', emoji: '🍪', swatch: '#f9dbe3' },
                      { id: 'pebbles', name: 'Cookie Pebbles', desc: 'Bite-size, dipped in chocolate', from: 'from $15', emoji: '🍫', swatch: '#efe0d2' },
                    ].map((p) => (
                      <button key={p.id} type="button" onClick={() => pickProduct(p.id)} style={{ textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1.5px solid #ece0d6', borderRadius: 18, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, fontFamily: "'Hanken Grotesk',sans-serif" }}>
                        <span style={{ flex: 'none', width: 52, height: 52, borderRadius: 14, background: p.swatch, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{p.emoji}</span>
                        <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span style={{ font: "800 17px 'Bricolage Grotesque'", color: '#49331f' }}>{p.name}</span>
                          <span style={{ font: "500 13px 'Hanken Grotesk'", color: '#8a6f63' }}>{p.desc}</span>
                        </span>
                        <span style={{ font: "700 13px 'Hanken Grotesk'", color: '#a86a3e', whiteSpace: 'nowrap' }}>{p.from}</span>
                      </button>
                    ))}
                    <div style={{ border: '1.5px dashed #d8c4b5', borderRadius: 18, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, opacity: .75 }}>
                      <span style={{ flex: 'none', width: 52, height: 52, borderRadius: 14, background: '#f2e8dd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>✨</span>
                      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ font: "800 17px 'Bricolage Grotesque'", color: '#a89482' }}>More treats coming soon!</span>
                        <span style={{ font: "500 13px 'Hanken Grotesk'", color: '#b7a290' }}>New seasonal goodies are in the oven ♥</span>
                      </span>
                    </div>
                  </div>
                </>
              )}

              {view === 'build' && item && (
                <>
                  <button type="button" onClick={() => { setView('product'); setItem(null); }} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#8a6f63', font: "700 13px 'Hanken Grotesk'", padding: 0, marginBottom: 14 }}>← All treats</button>

                  {item.product === 'cookies' && (
                    <CookieBuilder item={item} setField={setField} incColors={incColors} cookieQtyTotal={cookieQtyTotal} qtyNum={qtyNum} />
                  )}
                  {item.product === 'pebbles' && (
                    <PebbleBuilder item={item} setField={setField} incUnits={incUnits} toggleDip={toggleDip} />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 22, paddingTop: 16, borderTop: '1px solid #f2e8dd' }}>
                    <div style={{ font: "600 13px 'Hanken Grotesk'", color: '#a86a3e' }}>This item: <b style={{ color: '#49331f' }}>{money(priceItem(item))}</b></div>
                    <button type="button" onClick={addItem} style={{ cursor: 'pointer', background: '#49331f', border: 'none', color: '#fbf4ee', borderRadius: 30, padding: '14px 26px', font: "700 15px 'Hanken Grotesk'", opacity: canAdd(item) ? 1 : .45 }}>+ Add to order</button>
                  </div>
                </>
              )}

              {narrow && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                    <h3 style={{ font: "800 17px 'Bricolage Grotesque'", color: '#49331f', margin: 0 }}>Your order</h3>
                    <span style={{ font: "600 12px 'Hanken Grotesk'", color: '#8a6f63' }}>{itemViews.length} added</span>
                  </div>
                  {itemViews.length > 0 ? (
                    <div style={{ background: '#fff', border: '1.5px solid #efe4d9', borderRadius: 16, padding: '6px 16px 12px' }}>
                      {itemViews.map((li) => (
                        <div key={li.idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid #f2e8dd' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ font: "700 14px 'Hanken Grotesk'", color: '#49331f' }}>{li.title}</div>
                            <div style={{ font: "500 12px 'Hanken Grotesk'", color: '#8a6f63' }}>{li.sub}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 'none' }}>
                            <span style={{ font: "700 14px 'Hanken Grotesk'", color: '#49331f' }}>{li.priceFmt}</span>
                            <button type="button" onClick={li.onRemove} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#c58ea0', font: "700 12px 'Hanken Grotesk'" }}>Remove</button>
                          </div>
                        </div>
                      ))}
                      {smallBatchApplies() && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0 0', font: "600 12px 'Hanken Grotesk'", color: '#96566b' }}><span>Small-batch fee</span><span>+$5</span></div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background: '#f7ece4', borderRadius: 16, padding: 20, textAlign: 'center', font: "500 13px 'Hanken Grotesk'", color: '#a89482' }}>Nothing added yet — build a treat above.</div>
                  )}
                </div>
              )}
            </div>

            {!narrow && (
              <div style={{ flex: '0 0 300px', position: 'sticky', top: 16, background: '#49331f', color: '#fbf4ee', borderRadius: 20, padding: 20 }}>
                <div style={{ font: "700 11px 'Hanken Grotesk'", letterSpacing: '.16em', textTransform: 'uppercase', color: '#e6b9c6', marginBottom: 3 }}>Your order</div>
                <div style={{ font: "800 34px 'Bricolage Grotesque'", marginBottom: 2 }}>{money(total)}</div>
                <div style={{ font: "500 11px 'Hanken Grotesk'", color: '#d9b3bf', marginBottom: 16 }}>Estimate · subject to final quote</div>
                {itemViews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {itemViews.map((li) => (
                      <div key={li.idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '11px 0', borderTop: '1px solid rgba(255,255,255,.12)' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ font: "700 13px 'Hanken Grotesk'", color: '#fbf4ee', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{li.title}</div>
                          <div style={{ font: "500 11px 'Hanken Grotesk'", color: '#c9a6b2' }}>{li.sub}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 'none' }}>
                          <span style={{ font: "700 13px 'Hanken Grotesk'" }}>{li.priceFmt}</span>
                          <button type="button" onClick={li.onRemove} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#e6a6b6', font: "700 16px 'Hanken Grotesk'", lineHeight: 1 }}>×</button>
                        </div>
                      </div>
                    ))}
                    {smallBatchApplies() && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0 0', borderTop: '1px solid rgba(255,255,255,.12)', font: "600 12px 'Hanken Grotesk'", color: '#e6b9c6' }}><span>Small-batch fee</span><span>+$5</span></div>
                    )}
                  </div>
                ) : (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,.12)', padding: '16px 0', font: "500 12px 'Hanken Grotesk'", color: '#c9a6b2', lineHeight: 1.5 }}>Your treats will appear here as you add them.</div>
                )}
                {itemViews.length > 0 && (
                  <button type="button" onClick={() => setView('details')} style={{ width: '100%', marginTop: 16, cursor: 'pointer', background: '#f5cad9', border: 'none', color: '#49331f', borderRadius: 30, padding: 14, font: "700 15px 'Hanken Grotesk'" }}>Continue to details →</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {narrow && notDetails && (
        <div style={{ position: 'sticky', bottom: 0, background: '#49331f', color: '#fbf4ee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 18px', boxShadow: '0 -10px 26px -14px rgba(0,0,0,.5)' }}>
          <div>
            <div style={{ font: "700 9px 'Hanken Grotesk'", letterSpacing: '.16em', textTransform: 'uppercase', color: '#e6b9c6' }}>Estimate</div>
            <div style={{ font: "800 22px 'Bricolage Grotesque'" }}>{money(total)}</div>
          </div>
          {itemViews.length > 0 ? (
            <button type="button" onClick={() => setView('details')} style={{ cursor: 'pointer', background: '#f5cad9', border: 'none', color: '#49331f', borderRadius: 30, padding: '13px 22px', font: "700 14px 'Hanken Grotesk'" }}>Continue →</button>
          ) : (
            <span style={{ font: "500 12px 'Hanken Grotesk'", color: '#d9b3bf', textAlign: 'right', maxWidth: 150 }}>Add a treat to start your estimate</span>
          )}
        </div>
      )}

      {view === 'details' && (
        <div style={{ padding: '24px 24px 34px', maxWidth: 620, margin: '0 auto' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '44px 20px' }}>
              <div style={{ width: 60, height: 54, margin: '0 auto 20px', background: '#a86a3e', WebkitMask: `url(${logoBlack}) center/contain no-repeat`, mask: `url(${logoBlack}) center/contain no-repeat` }} />
              <h2 style={{ font: "800 28px 'Bricolage Grotesque'", color: '#49331f', margin: '0 0 10px' }}>Order request sent!</h2>
              <p style={{ font: "500 15px 'Hanken Grotesk'", color: '#8a6f63', lineHeight: 1.55, maxWidth: 360, margin: '0 auto' }}>Thank you — I'll review your details and email you a proof and final quote soon. Can't wait to bake for you ♥</p>
            </div>
          ) : (
            <>
              <button type="button" onClick={() => setView('product')} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#8a6f63', font: "700 13px 'Hanken Grotesk'", padding: 0, marginBottom: 14 }}>← Back to my order</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
                <img src={logo} alt="Shelby's Cookie Co." style={{ height: 40 }} />
                <span style={{ font: "800 20px 'Bricolage Grotesque'", color: '#49331f' }}>Last step — your details</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 13 }}>
                <div style={{ flex: '1 1 100%' }}>
                  <label style={{ font: "600 12px 'Hanken Grotesk'", color: '#6b524a', display: 'block', marginBottom: 5 }}>Your name</label>
                  <input value={contact.name} onChange={(e) => setContact('name', e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 240px' }}>
                  <label style={{ font: "600 12px 'Hanken Grotesk'", color: '#6b524a', display: 'block', marginBottom: 5 }}>Email</label>
                  <input value={contact.email} onChange={(e) => setContact('email', e.target.value)} type="email" style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={{ font: "600 12px 'Hanken Grotesk'", color: '#6b524a', display: 'block', marginBottom: 5 }}>Phone</label>
                  <input value={contact.phone} onChange={(e) => setContact('phone', e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 100%' }}>
                  <label style={{ font: "600 12px 'Hanken Grotesk'", color: '#6b524a', display: 'block', marginBottom: 5 }}>Event date</label>
                  <input value={contact.date} onChange={(e) => setContact('date', e.target.value)} type="date" style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 100%' }}>
                  <label style={{ font: "600 12px 'Hanken Grotesk'", color: '#6b524a', display: 'block', marginBottom: 5 }}>Inspiration photos <span style={{ color: '#b9a596', fontWeight: 500 }}>· up to 3</span></label>
                  <label style={{ display: 'block', cursor: 'pointer', border: '1.5px dashed #d98da8', background: '#fdf1f5', borderRadius: 13, padding: 16, textAlign: 'center', font: "600 13px 'Hanken Grotesk'", color: '#96566b' }}>
                    ＋ Add photos
                    <input type="file" accept="image/*" multiple onChange={(e) => onPhotos(e.target.files)} style={{ display: 'none' }} />
                  </label>
                  {photos.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      {photos.map((ph) => <img key={ph.name} src={ph.url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #efe4d9' }} />)}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 18, background: '#fff', border: '1.5px solid #efe4d9', borderRadius: 16, padding: '8px 16px 14px' }}>
                {itemViews.map((li) => (
                  <div key={li.idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f2e8dd' }}>
                    <span style={{ font: "600 13px 'Hanken Grotesk'", color: '#6b524a' }}>{li.title} · {li.sub}</span>
                    <span style={{ font: "700 13px 'Hanken Grotesk'", color: '#49331f' }}>{li.priceFmt}</span>
                  </div>
                ))}
                {smallBatchApplies() && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f2e8dd' }}>
                    <span style={{ font: "600 13px 'Hanken Grotesk'", color: '#96566b' }}>Small-batch fee</span>
                    <span style={{ font: "700 13px 'Hanken Grotesk'", color: '#96566b' }}>+$5</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12 }}>
                  <span style={{ font: "700 13px 'Hanken Grotesk'", color: '#8a6f63', textTransform: 'uppercase', letterSpacing: '.08em' }}>Estimate</span>
                  <span style={{ font: "800 24px 'Bricolage Grotesque'", color: '#49331f' }}>{money(total)}</span>
                </div>
                <div style={{ font: "500 11px 'Hanken Grotesk'", color: '#a89482', textAlign: 'right', marginTop: 2 }}>Subject to final quote</div>
              </div>
              <button type="submit" style={{ width: '100%', marginTop: 16, cursor: 'pointer', background: '#49331f', border: 'none', color: '#fbf4ee', borderRadius: 30, padding: 16, font: "700 16px 'Hanken Grotesk'", opacity: (hasContact && items.length > 0) ? 1 : .45 }}>Send my order request</button>
              <p style={{ font: "500 11px 'Hanken Grotesk'", color: '#a89482', textAlign: 'center', margin: '10px 0 0' }}>I'll reply by email with a proof and your final quote.</p>
            </>
          )}
        </div>
      )}
    </form>
  );
}

function CookieBuilder({ item: it, setField, incColors, cookieQtyTotal, qtyNum }) {
  const wholeCookies = cookieQtyTotal() + qtyNum(it);
  const smallBatchItem = qtyNum(it) > 0 && wholeCookies < 24;
  return (
    <>
      <h2 style={{ font: "800 22px 'Bricolage Grotesque'", color: '#49331f', margin: '0 0 18px' }}>Custom Sugar Cookies</h2>

      <div style={sectionLabel}>Describe your cookie</div>
      <textarea value={it.describe || ''} onChange={(e) => setField({ describe: e.target.value })} rows={3} placeholder="Tell me about your design — theme, style, colours, any text or details you'd love on the cookies…" style={{ ...inputStyle, marginBottom: 22, lineHeight: 1.5, resize: 'vertical', fontFamily: "'Hanken Grotesk',sans-serif" }} />

      <div style={sectionLabel}>Shape</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 20 }}>
        {['circle', 'square', 'custom'].map((id) => (
          <button key={id} type="button" onClick={() => setField({ shape: id })} style={{ position: 'relative', flex: '1 1 120px', textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1.5px solid #ece0d6', borderRadius: 14, padding: '13px 15px', fontFamily: "'Hanken Grotesk',sans-serif" }}>
            <div style={{ font: "700 15px 'Hanken Grotesk'", color: '#49331f' }}>{SHAPE_META[id].label}</div>
            <div style={{ font: "600 11px 'Hanken Grotesk'", color: '#a86a3e' }}>{SHAPE_META[id].surOrStock}</div>
            {it.shape === id && <span style={{ position: 'absolute', inset: 0, border: '2.5px solid #a86a3e', borderRadius: 14, pointerEvents: 'none' }} />}
          </button>
        ))}
      </div>
      {it.shape === 'custom' && (
        <input value={it.custom} onChange={(e) => setField({ custom: e.target.value })} placeholder="Describe your cutter shape…" style={{ ...inputStyle, margin: '-12px 0 20px' }} />
      )}

      <div style={sectionLabel}>Decoration</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 12 }}>
        {[
          { id: 'colors', label: 'Hand-piped icing', note: 'Up to 3 colours + white', hasSave: false, saveBadge: '' },
          { id: 'printed', label: 'Printed image', note: 'Full-colour edible print', hasSave: true, saveBadge: 'Save $5/dozen' },
        ].map((d) => (
          <button key={d.id} type="button" onClick={() => setField({ deco: d.id })} style={{ position: 'relative', flex: '1 1 155px', textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1.5px solid #ece0d6', borderRadius: 14, padding: '13px 15px', fontFamily: "'Hanken Grotesk',sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <span style={{ font: "700 15px 'Hanken Grotesk'", color: '#49331f' }}>{d.label}</span>
              {d.hasSave && <span style={{ font: "700 10px 'Hanken Grotesk'", color: '#3f7a3a', background: '#e2efdd', borderRadius: 20, padding: '2px 8px' }}>{d.saveBadge}</span>}
            </div>
            <div style={{ font: "500 11px 'Hanken Grotesk'", color: '#8a6f63', marginTop: 3 }}>{d.note}</div>
            {it.deco === d.id && <span style={{ position: 'absolute', inset: 0, border: '2.5px solid #a86a3e', borderRadius: 14, pointerEvents: 'none' }} />}
          </button>
        ))}
      </div>

      {it.deco === 'colors' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: '#f7ece4', borderRadius: 13, padding: '12px 15px', marginBottom: 20 }}>
          <div>
            <div style={{ font: "700 13px 'Hanken Grotesk'", color: '#49331f' }}>Icing colours</div>
            {(it.colors || 0) > 3 && <div style={{ font: "600 11px 'Hanken Grotesk'", color: '#a86a3e' }}>+${Math.max(0, (it.colors || 0) - 3) * 4}/doz</div>}
            {(it.colors || 0) <= 3 && <div style={{ font: "500 11px 'Hanken Grotesk'", color: '#8a6f63' }}>+ white, included</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="button" onClick={() => incColors(-1)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#49331f', font: "700 17px 'Hanken Grotesk'", cursor: 'pointer' }}>−</button>
            <span style={{ font: "800 19px 'Bricolage Grotesque'", color: '#49331f', minWidth: 16, textAlign: 'center' }}>{it.colors}</span>
            <button type="button" onClick={() => incColors(1)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#49331f', font: "700 17px 'Hanken Grotesk'", cursor: 'pointer' }}>+</button>
          </div>
        </div>
      )}
      {it.deco === 'printed' && (
        <div style={{ background: '#eef3ea', borderRadius: 13, padding: '12px 15px', marginBottom: 20, font: "500 12px 'Hanken Grotesk'", color: '#5c6b52', lineHeight: 1.5 }}>A full-colour edible image printed right onto the cookie — perfect for logos, photos and fine detail. Comes in easier on price, too.</div>
      )}

      <div style={sectionLabel}>Quantity</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[6, 12, 24, 48].map((q) => (
          <button key={q} type="button" onClick={() => setField({ qty: q })} style={{ position: 'relative', flex: '1 1 70px', cursor: 'pointer', background: '#fff', border: '1.5px solid #ece0d6', borderRadius: 13, padding: '12px 6px', textAlign: 'center', fontFamily: "'Hanken Grotesk',sans-serif" }}>
            <div style={{ font: "800 18px 'Bricolage Grotesque'", color: '#49331f' }}>{q}</div>
            <div style={{ font: "600 9px 'Hanken Grotesk'", color: '#a86a3e', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 1 }}>{q < 24 ? 'small batch' : (q === 24 ? 'minimum' : '')}</div>
            {it.qty === q && <span style={{ position: 'absolute', inset: 0, border: '2.5px solid #a86a3e', borderRadius: 13, pointerEvents: 'none' }} />}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => setField({ qty: 'custom' })} style={{ position: 'relative', width: '100%', marginTop: 8, cursor: 'pointer', background: '#fff', border: '1.5px solid #ece0d6', borderRadius: 13, padding: 12, textAlign: 'center', font: "700 13px 'Hanken Grotesk'", color: '#49331f', letterSpacing: '.02em' }}>
        CUSTOM AMOUNT
        {it.qty === 'custom' && <span style={{ position: 'absolute', inset: 0, border: '2.5px solid #a86a3e', borderRadius: 13, pointerEvents: 'none' }} />}
      </button>
      {it.qty === 'custom' && (
        <input value={it.qtyCustom} onChange={(e) => setField({ qtyCustom: e.target.value.replace(/[^0-9]/g, '') })} inputMode="numeric" placeholder="How many cookies?" style={{ ...inputStyle, marginTop: 10 }} />
      )}
      {smallBatchItem && (
        <div style={{ marginTop: 11, background: '#f9dbe3', borderRadius: 12, padding: '11px 14px', font: "500 12px 'Hanken Grotesk'", color: '#96566b', lineHeight: 1.45 }}>♥ Under two dozen sugar cookies in your whole order adds a one-time <b>+$5</b> small-batch fee. Totally happy to make it!</div>
      )}
    </>
  );
}

function PebbleBuilder({ item: it, setField, incUnits, toggleDip }) {
  const meta = PEBBLE_META[it.size];
  const sel = it.dips || [];
  const extra = Math.max(0, sel.length - meta.incl);
  return (
    <>
      <h2 style={{ font: "800 22px 'Bricolage Grotesque'", color: '#49331f', margin: '0 0 4px' }}>Cookie Pebbles</h2>
      <p style={{ font: "500 13px 'Hanken Grotesk'", color: '#8a6f63', margin: '0 0 18px' }}>Bite-size cookie bits, dipped in your choice of coatings.</p>

      <div style={sectionLabel}>Size</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
        {['s', 'm', 'l'].map((id) => (
          <button key={id} type="button" onClick={() => setField({ size: id })} style={{ position: 'relative', width: '100%', textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1.5px solid #ece0d6', borderRadius: 14, padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontFamily: "'Hanken Grotesk',sans-serif" }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ font: "700 15px 'Hanken Grotesk'", color: '#49331f' }}>{PEBBLE_META[id].label} · {PEBBLE_META[id].pcs}</span>
              <span style={{ font: "500 12px 'Hanken Grotesk'", color: '#8a6f63' }}>{PEBBLE_META[id].incl} dip{PEBBLE_META[id].incl > 1 ? 's' : ''} included</span>
            </span>
            <span style={{ font: "800 16px 'Bricolage Grotesque'", color: '#49331f' }}>${PEBBLE_META[id].price}</span>
            {it.size === id && <span style={{ position: 'absolute', inset: 0, border: '2.5px solid #a86a3e', borderRadius: 14, pointerEvents: 'none' }} />}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 11 }}>
        <span style={sectionLabel}>Dips</span>
        <span style={{ font: "600 11px 'Hanken Grotesk'", color: '#8a6f63' }}>{meta.incl} included · extras $3</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {DIPS.map((name) => {
          const on = sel.includes(name);
          return (
            <button key={name} type="button" onClick={() => toggleDip(name)} style={{ position: 'relative', cursor: 'pointer', background: on ? '#49331f' : '#fff', border: '1.5px solid ' + (on ? '#49331f' : '#e6d8cc'), borderRadius: 30, padding: '9px 15px', font: "600 13px 'Hanken Grotesk'", color: on ? '#fbf4ee' : '#6b524a' }}>{name}</button>
          );
        })}
      </div>
      {extra > 0 ? (
        <div style={{ font: "600 12px 'Hanken Grotesk'", color: '#a86a3e', marginBottom: 20 }}>{extra} extra dip{extra > 1 ? 's' : ''} · +${extra * 3}</div>
      ) : (
        <div style={{ height: 10 }} />
      )}

      <div style={sectionLabel}>How many?</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#f7ece4', borderRadius: 13, padding: '12px 16px' }}>
        <span style={{ font: "600 13px 'Hanken Grotesk'", color: '#49331f', flex: 1 }}>Number of orders</span>
        <button type="button" onClick={() => incUnits(-1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#49331f', font: "700 18px 'Hanken Grotesk'", cursor: 'pointer' }}>−</button>
        <span style={{ font: "800 20px 'Bricolage Grotesque'", color: '#49331f', minWidth: 22, textAlign: 'center' }}>{it.units}</span>
        <button type="button" onClick={() => incUnits(1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#49331f', font: "700 18px 'Hanken Grotesk'", cursor: 'pointer' }}>+</button>
      </div>
    </>
  );
}
