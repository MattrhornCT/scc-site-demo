import { useEffect, useRef, useState } from 'react';
import { OWNER_EMAIL } from '../config.js';
import { price } from '../data/pricing.js';
import { GIFTING_TIERS, giftingTierFor } from '../data/gifting.js';
import logo from '../assets/logo.png';
import logoBlack from '../assets/logo-black.svg';

// Every dollar amount here comes from Airtable's Pricing table (fetched at
// build time — see scripts/fetch-airtable.mjs) instead of being hardcoded,
// so a price change needs no code change. Non-priced facts (dip flavours,
// included-dip counts, shape names) stay as plain constants.
const DOZEN = price('cookies_base_dozen');
const SHAPE_CUSTOM_SURCHARGE = price('shape_custom_surcharge');
const COLOUR_EXTRA_EACH = price('colour_extra_each');
const DECO_PRINTED_ADJUSTMENT = price('deco_printed_adjustment');
const SMALL_BATCH_FEE = price('small_batch_fee');
const PEBBLE_EXTRA_DIP = price('pebbles_extra_dip');

const DIPS = ['White Chocolate', 'Milk Chocolate', 'Dark Chocolate', 'Dulce de Leche', 'Maple Butter'];
const SHAPE_META = {
  circle: { label: 'Circle', surOrStock: 'In stock' },
  square: { label: 'Square', surOrStock: 'In stock' },
  custom: { label: 'Custom shape', surOrStock: `+${money(SHAPE_CUSTOM_SURCHARGE)}/doz` },
};
const PEBBLE_META = {
  s: { label: 'Small', pcs: '36 pieces', price: price('pebbles_small'), incl: 1 },
  m: { label: 'Medium', pcs: '72 pieces', price: price('pebbles_medium'), incl: 2 },
  l: { label: 'Large', pcs: '108 pieces', price: price('pebbles_large'), incl: 3 },
};

function money(n) {
  n = Math.round(n * 100) / 100;
  return '$' + (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2));
}
function cookieDefault() { return { product: 'cookies', shape: 'circle', deco: 'colors', colors: 3, qty: 12, custom: '', qtyCustom: '', describe: '' }; }
function pebbleDefault() { return { product: 'pebbles', size: 'm', dips: [], units: 1 }; }
function giftingDefault() { return { product: 'gifting', company: '', dozens: 4, colours: '', occasion: '', address: '' }; }
function qtyNum(it) { return it.qty === 'custom' ? (parseInt(it.qtyCustom, 10) || 0) : (it.qty || 0); }
function priceItem(it) {
  if (it.product === 'pebbles') {
    const meta = PEBBLE_META[it.size];
    const extra = Math.max(0, (it.dips || []).length - meta.incl) * PEBBLE_EXTRA_DIP;
    return (meta.price + extra) * (it.units || 1);
  }
  if (it.product === 'gifting') {
    const dozens = it.dozens || 0;
    return giftingTierFor(dozens).amount * dozens;
  }
  const shapeSur = it.shape === 'custom' ? SHAPE_CUSTOM_SURCHARGE : 0;
  const decoAdj = it.deco === 'printed' ? DECO_PRINTED_ADJUSTMENT : Math.max(0, (it.colors || 0) - 3) * COLOUR_EXTRA_EACH;
  const perDoz = DOZEN + shapeSur + decoAdj;
  return (perDoz * qtyNum(it)) / 12;
}
const inputStyle = { width: '100%', background: '#fff', border: '1.5px solid #e6d6c8', borderRadius: 12, padding: '12px 14px', font: "500 14px 'Hanken Grotesk'", color: '#3a2820' };
const sectionLabel = { font: "700 11px 'Hanken Grotesk'", letterSpacing: '.14em', textTransform: 'uppercase', color: '#b4506d', marginBottom: 11 };

export default function OrderForm() {
  const [view, setView] = useState('product');
  const [item, setItem] = useState(null);
  const [items, setItems] = useState([]);
  const [contact, setContactState] = useState({ name: '', email: '', phone: '', date: '' });
  const [photos, setPhotos] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [narrow, setNarrow] = useState(false);
  // Honeypot — real users never see or fill this field (see the hidden input
  // below); a non-empty value on submit means a bot filled it blindly.
  const [companyWebsite, setCompanyWebsite] = useState('');

  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => setNarrow(entries[0].contentRect.width < 720));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cookieQtyTotal = () => items.filter((x) => x.product === 'cookies').reduce((a, x) => a + qtyNum(x), 0);
  const smallBatchApplies = () => { const t = cookieQtyTotal(); return t > 0 && t < 24; };
  const orderTotal = () => { let t = items.reduce((a, x) => a + priceItem(x), 0); if (smallBatchApplies()) t += SMALL_BATCH_FEE; return t; };
  const canAdd = (it) => {
    if (!it) return false;
    if (it.product === 'pebbles') return (it.dips || []).length >= 1 && (it.units || 0) >= 1;
    if (it.product === 'gifting') return !!(it.company || '').trim() && (it.dozens || 0) >= 4 && !!(it.address || '').trim();
    if (it.shape === 'custom' && !(it.custom || '').trim()) return false;
    return qtyNum(it) >= 1;
  };

  const pickProduct = (id) => { setItem(id === 'cookies' ? cookieDefault() : id === 'pebbles' ? pebbleDefault() : giftingDefault()); setView('build'); };
  const setField = (patch) => setItem((it) => ({ ...it, ...patch }));
  const incColors = (d) => setItem((it) => ({ ...it, colors: Math.min(6, Math.max(1, (it.colors || 3) + d)) }));
  const incUnits = (d) => setItem((it) => ({ ...it, units: Math.max(1, (it.units || 1) + d) }));
  const incDozens = (d) => setItem((it) => ({ ...it, dozens: Math.max(4, (it.dozens || 4) + d) }));
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
    if (x.product === 'gifting') {
      const tier = giftingTierFor(x.dozens || 0);
      return { idx: i, title: x.company || 'Branded Client Gifting', sub: `${x.dozens} dozen · ${money(tier.amount)}/doz`, priceFmt: money(priceItem(x)), onRemove: () => removeItem(i) };
    }
    return {
      idx: i,
      title: x.shape === 'custom' ? (x.custom || 'Custom shape') : SHAPE_META[x.shape].label,
      sub: qtyNum(x) + ' cookies · ' + (x.deco === 'printed' ? 'Printed' : (x.colors + ' colour' + (x.colors > 1 ? 's' : ''))),
      priceFmt: money(priceItem(x)), onRemove: () => removeItem(i),
    };
  };

  const hasContact = !!(contact.name && contact.email);
  const hasGifting = items.some((x) => x.product === 'gifting');
  const itemViews = items.map((x, i) => itemView(x, i));
  const total = orderTotal();

  // Field names/shape here must match functions/order.js's itemToAirtableFields.
  const itemsPayload = items.map((it) => (it.product === 'pebbles'
    ? { product: 'Cookie Pebbles', size: PEBBLE_META[it.size].label, dips: it.dips, units: it.units, price: priceItem(it) }
    : it.product === 'gifting'
    ? { product: 'Branded Client Gifting', company: it.company, dozens: it.dozens, colours: it.colours, occasion: it.occasion, address: it.address, price: priceItem(it) }
    : { product: 'Sugar Cookies', shape: it.shape === 'custom' ? it.custom : it.shape, decoration: it.deco === 'printed' ? 'printed' : (it.colors + ' colours'), description: it.describe || '', quantity: qtyNum(it), price: priceItem(it) }));
  const orderSummary = itemViews.map((v) => `${v.title} — ${v.sub} — ${v.priceFmt}`).join('\n');

  const submitOrder = async () => {
    setSubmitting(true);
    setSubmitError(false);
    try {
      const formData = new FormData();
      formData.append('name', contact.name);
      formData.append('email', contact.email);
      formData.append('phone', contact.phone);
      formData.append('eventDate', contact.date);
      formData.append('total', String(total));
      formData.append('smallBatchFee', String(smallBatchApplies() ? SMALL_BATCH_FEE : 0));
      formData.append('itemsJson', JSON.stringify(itemsPayload));
      formData.append('orderSummary', orderSummary);
      formData.append('deviceType', window.innerWidth < 768 ? 'mobile' : 'desktop');
      formData.append('companyWebsite', companyWebsite);
      photos.forEach((p, i) => formData.append(`photo${i + 1}`, p.file));

      const res = await fetch('/order', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({ ok: false }));
      if (res.ok && data.ok) setSubmitted(true); else setSubmitError(true);
    } catch (err) {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasContact || items.length === 0 || submitting) return;
    submitOrder();
  };

  const copyOrderDetails = async () => {
    const text = [
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Phone: ${contact.phone}`,
      `Event date: ${contact.date}`,
      '',
      orderSummary,
      smallBatchApplies() ? `Small-batch fee: +${money(SMALL_BATCH_FEE)}` : '',
      `Total estimate: ${money(total)}`,
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Clipboard API can be unavailable (old browser, insecure context) —
      // the owner's email shown alongside this button is still a usable
      // fallback either way.
    }
  };

  const layoutClass = narrow ? 'cf-col' : 'cf-row';
  const notDetails = view !== 'details';

  return (
    <form
      ref={rootRef}
      className="cf-scroll"
      onSubmit={handleSubmit}
      style={{ fontFamily: "'Hanken Grotesk',system-ui,sans-serif", color: '#3a2820', width: '100%', position: 'relative' }}
    >
      <input
        type="text"
        name="companyWebsite"
        value={companyWebsite}
        onChange={(e) => setCompanyWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />

      {notDetails && (
        <div>
          <div className={layoutClass}>
            <div style={{ flex: '1 1 auto', minWidth: 0, width: '100%' }}>

              {view === 'product' && (
                <>
                  <h2 className="serif" style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-.02em', margin: '0 0 4px' }}>What would you like <em style={{ fontWeight: 300, color: '#b4506d' }}>to add?</em></h2>
                  <p style={{ color: '#5c463c', margin: '0 0 22px' }}>Add as many treats as you like — mix and match across your order.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { id: 'cookies', name: 'Custom Sugar Cookies', desc: 'Hand-iced or printed, any shape', from: `from ${money(DOZEN)}/doz`, swatch: '#f6dde3',
                        icon: <><circle cx="12" cy="12" r="9" /><circle cx="9" cy="9.4" r="1" /><circle cx="15.2" cy="10" r="1" /><circle cx="10.3" cy="14.6" r="1" /><circle cx="14.6" cy="15" r="1" /></> },
                      { id: 'pebbles', name: 'Cookie Pebbles', desc: 'Bite-size, dipped in chocolate', from: `from ${money(PEBBLE_META.s.price)}`, swatch: '#efe2d3',
                        icon: <><circle cx="8" cy="9" r="3.2" /><circle cx="15.5" cy="8" r="2.8" /><circle cx="11" cy="15.5" r="3.4" /><circle cx="17.5" cy="15" r="2.2" /></> },
                      { id: 'gifting', name: 'Branded Client Gifting', desc: 'Logo-accurate cookies for corporate gifting, min. 4 dozen', from: `from ${money(GIFTING_TIERS[0].amount)}/doz`, swatch: '#ecc3cf',
                        icon: <><rect x="3" y="8.5" width="18" height="12.5" rx="1.5" /><line x1="3" y1="12.5" x2="21" y2="12.5" /><line x1="12" y1="8.5" x2="12" y2="21" /><path d="M12 8.5 C12 4 7.5 4 7.5 6.5 C7.5 8.5 12 8.5 12 8.5Z" /><path d="M12 8.5 C12 4 16.5 4 16.5 6.5 C16.5 8.5 12 8.5 12 8.5Z" /></> },
                    ].map((p) => {
                      const added = items.some((x) => x.product === p.id);
                      return (
                        <button key={p.id} type="button" className="treat" onClick={() => pickProduct(p.id)} aria-label={`Add ${p.name}`}>
                          <span className="ic" style={{ width: 58, height: 58, borderRadius: '50%', background: p.swatch, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 30, height: 30, fill: 'none', stroke: '#3a2820', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>{p.icon}</svg>
                          </span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span className="serif" style={{ display: 'block', fontSize: 22, letterSpacing: '-.01em' }}>{p.name}</span>
                            <span style={{ display: 'block', fontSize: 14.5, color: '#5c463c', marginTop: 2 }}>{p.desc}</span>
                          </span>
                          <span className="treat-price" style={{ textAlign: 'right', flex: 'none' }}>
                            <span style={{ display: 'block', font: "700 14px 'Hanken Grotesk'" }}>{p.from}</span>
                            <span style={{ display: 'inline-block', marginTop: 6, font: "700 12.5px 'Hanken Grotesk'", color: '#b4506d' }}>{added ? '✓ Added · add more' : '+ Add'}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {view === 'build' && item && (
                <>
                  <button type="button" onClick={() => { setView('product'); setItem(null); }} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#5c463c', font: "700 13px 'Hanken Grotesk'", padding: 0, marginBottom: 14 }}>← All treats</button>

                  {item.product === 'cookies' && (
                    <CookieBuilder item={item} setField={setField} incColors={incColors} cookieQtyTotal={cookieQtyTotal} qtyNum={qtyNum} />
                  )}
                  {item.product === 'pebbles' && (
                    <PebbleBuilder item={item} setField={setField} incUnits={incUnits} toggleDip={toggleDip} />
                  )}
                  {item.product === 'gifting' && (
                    <GiftingBuilder item={item} setField={setField} incDozens={incDozens} />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 22, paddingTop: 16, borderTop: '1px solid #efe2d3' }}>
                    <div style={{ font: "600 13px 'Hanken Grotesk'", color: '#b4506d' }}>This item: <b style={{ color: '#3a2820' }}>{money(priceItem(item))}</b></div>
                    <button type="button" className="btn" onClick={addItem} style={{ padding: '14px 26px', opacity: canAdd(item) ? 1 : .45 }}>+ Add to order</button>
                  </div>
                </>
              )}

              {narrow && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                    <h3 style={{ font: "400 17px 'Fraunces'", color: '#3a2820', margin: 0 }}>Your order</h3>
                    <span style={{ font: "600 12px 'Hanken Grotesk'", color: '#5c463c' }}>{itemViews.length} added</span>
                  </div>
                  {itemViews.length > 0 ? (
                    <div style={{ background: '#fff', border: '1.5px solid #efe2d3', borderRadius: 16, padding: '6px 16px 12px' }}>
                      {itemViews.map((li) => (
                        <div key={li.idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid #efe2d3' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ font: "700 14px 'Hanken Grotesk'", color: '#3a2820' }}>{li.title}</div>
                            <div style={{ font: "500 12px 'Hanken Grotesk'", color: '#5c463c' }}>{li.sub}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 'none' }}>
                            <span style={{ font: "700 14px 'Hanken Grotesk'", color: '#3a2820' }}>{li.priceFmt}</span>
                            <button type="button" onClick={li.onRemove} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#b4506d', font: "700 12px 'Hanken Grotesk'" }}>Remove</button>
                          </div>
                        </div>
                      ))}
                      {smallBatchApplies() && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0 0', font: "600 12px 'Hanken Grotesk'", color: '#8a3550' }}><span>Small-batch fee</span><span>+{money(SMALL_BATCH_FEE)}</span></div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background: '#fbf6f0', borderRadius: 16, padding: 20, textAlign: 'center', font: "500 13px 'Hanken Grotesk'", color: '#8a6f63' }}>Nothing added yet — build a treat above.</div>
                  )}
                </div>
              )}
            </div>

            {!narrow && (
              <aside aria-label="Your order" style={{ flex: '0 0 340px', position: 'sticky', top: 16, background: '#3a2820', color: '#fbf6f0', borderRadius: 22, padding: '28px 26px', overflow: 'hidden' }}>
                <div className="kicker" style={{ fontSize: 11, color: '#e7aabd', marginBottom: 10 }}>Your order</div>
                <div className="serif" aria-live="polite" style={{ fontSize: 52, letterSpacing: '-.03em', lineHeight: 1 }}>{money(total)}</div>
                <div style={{ fontSize: 13, color: '#c9b3a6', margin: '6px 0 20px' }}>Estimate · subject to final quote</div>
                <div className="beads" aria-hidden="true" style={{ color: 'rgba(231,170,189,.35)', marginBottom: 18 }} />
                {itemViews.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {itemViews.map((li) => (
                      <li key={li.idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', font: "700 15px 'Hanken Grotesk'", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{li.title}</span>
                          <span style={{ fontSize: 13, color: '#c9b3a6' }}>{li.sub}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
                          <span style={{ font: "700 15px 'Hanken Grotesk'" }}>{li.priceFmt}</span>
                          <button type="button" onClick={li.onRemove} aria-label={`Remove ${li.title}`} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e3d2c8', background: 'transparent', color: '#fbf6f0', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>×</button>
                        </span>
                      </li>
                    ))}
                    {smallBatchApplies() && (
                      <li style={{ display: 'flex', justifyContent: 'space-between', font: "600 13px 'Hanken Grotesk'", color: '#e7aabd' }}><span>Small-batch fee</span><span>+{money(SMALL_BATCH_FEE)}</span></li>
                    )}
                  </ul>
                ) : (
                  <p className="hand" style={{ fontSize: 24, color: '#e7aabd', margin: 0, lineHeight: 1.15 }}>your treats will appear here as you add them ♥</p>
                )}
                {itemViews.length > 0 && (
                  <button type="button" className="btn btn-cream" onClick={() => setView('details')} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 22 }}>Continue to details →</button>
                )}
              </aside>
            )}
          </div>
        </div>
      )}

      {narrow && notDetails && (
        <div style={{ position: 'sticky', bottom: 0, zIndex: 20, background: '#3a2820', color: '#fbf6f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 18px', boxShadow: '0 -10px 26px -14px rgba(0,0,0,.5)' }}>
          <div>
            <div style={{ font: "700 9px 'Hanken Grotesk'", letterSpacing: '.16em', textTransform: 'uppercase', color: '#e7aabd' }}>Estimate</div>
            <div style={{ font: "400 22px 'Fraunces'" }}>{money(total)}</div>
          </div>
          {itemViews.length > 0 ? (
            <button type="button" onClick={() => setView('details')} style={{ cursor: 'pointer', background: '#fbf6f0', border: 'none', color: '#3a2820', borderRadius: 30, padding: '13px 22px', font: "700 14px 'Hanken Grotesk'" }}>Continue →</button>
          ) : (
            <span style={{ font: "500 12px 'Hanken Grotesk'", color: '#e3d2c8', textAlign: 'right', maxWidth: 150 }}>Add a treat to start your estimate</span>
          )}
        </div>
      )}

      {view === 'details' && (
        <div style={{ padding: '30px 30px 34px', maxWidth: 640, margin: '0 auto', background: '#fbf6f0', borderRadius: 24, boxShadow: '0 30px 60px -40px rgba(58,40,32,.5)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '44px 20px' }}>
              <div style={{ width: 60, height: 54, margin: '0 auto 20px', background: '#b4506d', WebkitMask: `url(${logoBlack}) center/contain no-repeat`, mask: `url(${logoBlack}) center/contain no-repeat` }} />
              <h2 style={{ font: "400 28px 'Fraunces'", color: '#3a2820', margin: '0 0 10px' }}>Order request sent!</h2>
              <p style={{ font: "500 15px 'Hanken Grotesk'", color: '#5c463c', lineHeight: 1.55, maxWidth: 360, margin: '0 auto' }}>Thank you — I'll review your details and email you a proof and final quote soon. Can't wait to bake for you ♥</p>
            </div>
          ) : (
            <>
              <button type="button" onClick={() => setView('product')} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#5c463c', font: "700 13px 'Hanken Grotesk'", padding: 0, marginBottom: 14 }}>← Back to my order</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
                <img src={logo} alt="Shelby's Cookie Co." style={{ height: 40 }} />
                <span style={{ font: "400 20px 'Fraunces'", color: '#3a2820' }}>Last step — your details</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 13 }}>
                <div style={{ flex: '1 1 100%' }}>
                  <label style={{ font: "600 12px 'Hanken Grotesk'", color: '#5c463c', display: 'block', marginBottom: 5 }}>Your name</label>
                  <input value={contact.name} onChange={(e) => setContact('name', e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 240px' }}>
                  <label style={{ font: "600 12px 'Hanken Grotesk'", color: '#5c463c', display: 'block', marginBottom: 5 }}>Email</label>
                  <input value={contact.email} onChange={(e) => setContact('email', e.target.value)} type="email" style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={{ font: "600 12px 'Hanken Grotesk'", color: '#5c463c', display: 'block', marginBottom: 5 }}>Phone</label>
                  <input value={contact.phone} onChange={(e) => setContact('phone', e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 100%' }}>
                  <label style={{ font: "600 12px 'Hanken Grotesk'", color: '#5c463c', display: 'block', marginBottom: 5 }}>Event date</label>
                  <input value={contact.date} onChange={(e) => setContact('date', e.target.value)} type="date" style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 100%' }}>
                  <label style={{ font: "600 12px 'Hanken Grotesk'", color: '#5c463c', display: 'block', marginBottom: 5 }}>{hasGifting ? 'Upload your logo' : 'Inspiration photos'} <span style={{ color: '#8a6f63', fontWeight: 500 }}>{hasGifting ? '· for the print' : '· up to 3'}</span></label>
                  <label style={{ display: 'block', cursor: 'pointer', border: '1.5px dashed #d58aa1', background: '#fbf6f0', borderRadius: 13, padding: 16, textAlign: 'center', font: "600 13px 'Hanken Grotesk'", color: '#8a3550' }}>
                    {hasGifting ? '＋ Add your logo' : '＋ Add photos'}
                    <input type="file" accept="image/*" multiple onChange={(e) => onPhotos(e.target.files)} style={{ display: 'none' }} />
                  </label>
                  {photos.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      {photos.map((ph) => <img key={ph.name} src={ph.url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #efe2d3' }} />)}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 18, background: '#fff', border: '1.5px solid #efe2d3', borderRadius: 16, padding: '8px 16px 14px' }}>
                {itemViews.map((li) => (
                  <div key={li.idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #efe2d3' }}>
                    <span style={{ font: "600 13px 'Hanken Grotesk'", color: '#5c463c' }}>{li.title} · {li.sub}</span>
                    <span style={{ font: "700 13px 'Hanken Grotesk'", color: '#3a2820' }}>{li.priceFmt}</span>
                  </div>
                ))}
                {smallBatchApplies() && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #efe2d3' }}>
                    <span style={{ font: "600 13px 'Hanken Grotesk'", color: '#8a3550' }}>Small-batch fee</span>
                    <span style={{ font: "700 13px 'Hanken Grotesk'", color: '#8a3550' }}>+{money(SMALL_BATCH_FEE)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12 }}>
                  <span style={{ font: "700 13px 'Hanken Grotesk'", color: '#5c463c', textTransform: 'uppercase', letterSpacing: '.08em' }}>Estimate</span>
                  <span style={{ font: "400 24px 'Fraunces'", color: '#3a2820' }}>{money(total)}</span>
                </div>
                <div style={{ font: "500 11px 'Hanken Grotesk'", color: '#8a6f63', textAlign: 'right', marginTop: 2 }}>Subject to final quote</div>
              </div>

              {submitError && (
                <div style={{ marginTop: 16, background: '#f6dde3', border: '1.5px solid #d58aa1', borderRadius: 14, padding: '14px 16px', font: "500 13px 'Hanken Grotesk'", color: '#8a3550', lineHeight: 1.55 }}>
                  <p style={{ margin: '0 0 10px' }}>Something went wrong sending your order automatically. Email <a href={`mailto:${OWNER_EMAIL}`} style={{ color: '#8a3550', fontWeight: 700 }}>{OWNER_EMAIL}</a> with your details, or copy them now and paste them into an email:</p>
                  <button type="button" onClick={copyOrderDetails} style={{ cursor: 'pointer', background: '#fff', border: '1.5px solid #d58aa1', color: '#8a3550', borderRadius: 30, padding: '9px 16px', font: "700 13px 'Hanken Grotesk'" }}>{copied ? 'Copied ✓' : 'Copy order details'}</button>
                </div>
              )}

              <button type="submit" className="btn" disabled={submitting} style={{ width: '100%', marginTop: 16, opacity: (hasContact && items.length > 0 && !submitting) ? 1 : .45 }}>{submitting ? 'Sending…' : 'Send my order request'}</button>
              <p style={{ font: "500 11px 'Hanken Grotesk'", color: '#8a6f63', textAlign: 'center', margin: '10px 0 0' }}>I'll reply by email with a proof and your final quote.</p>
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
      <h2 style={{ font: "400 22px 'Fraunces'", color: '#3a2820', margin: '0 0 18px' }}>Custom Sugar Cookies</h2>

      <div style={sectionLabel}>Describe your cookie</div>
      <textarea value={it.describe || ''} onChange={(e) => setField({ describe: e.target.value })} rows={3} placeholder="Tell me about your design — theme, style, colours, any text or details you'd love on the cookies…" style={{ ...inputStyle, marginBottom: 22, lineHeight: 1.5, resize: 'vertical', fontFamily: "'Hanken Grotesk',sans-serif" }} />

      <div style={sectionLabel}>Shape</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 20 }}>
        {['circle', 'square', 'custom'].map((id) => (
          <button key={id} type="button" onClick={() => setField({ shape: id })} style={{ position: 'relative', flex: '1 1 120px', textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1.5px solid #efe2d3', borderRadius: 14, padding: '13px 15px', fontFamily: "'Hanken Grotesk',sans-serif" }}>
            <div style={{ font: "700 15px 'Hanken Grotesk'", color: '#3a2820' }}>{SHAPE_META[id].label}</div>
            <div style={{ font: "600 11px 'Hanken Grotesk'", color: '#b4506d' }}>{SHAPE_META[id].surOrStock}</div>
            {it.shape === id && <span style={{ position: 'absolute', inset: 0, border: '2.5px solid #b4506d', borderRadius: 14, pointerEvents: 'none' }} />}
          </button>
        ))}
      </div>
      {it.shape === 'custom' && (
        <input value={it.custom} onChange={(e) => setField({ custom: e.target.value })} placeholder="Describe your cutter shape…" style={{ ...inputStyle, margin: '-12px 0 20px' }} />
      )}

      <div style={sectionLabel}>Decoration</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 12 }}>
        {[
          { id: 'colors', label: 'Hand-piped icing', note: 'Up to 3 colours + white' },
          { id: 'printed', label: 'Printed image', note: 'Full-colour edible print' },
        ].map((d) => (
          <button key={d.id} type="button" onClick={() => setField({ deco: d.id })} style={{ position: 'relative', flex: '1 1 155px', textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1.5px solid #efe2d3', borderRadius: 14, padding: '13px 15px', fontFamily: "'Hanken Grotesk',sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <span style={{ font: "700 15px 'Hanken Grotesk'", color: '#3a2820' }}>{d.label}</span>
            </div>
            <div style={{ font: "500 11px 'Hanken Grotesk'", color: '#5c463c', marginTop: 3 }}>{d.note}</div>
            {it.deco === d.id && <span style={{ position: 'absolute', inset: 0, border: '2.5px solid #b4506d', borderRadius: 14, pointerEvents: 'none' }} />}
          </button>
        ))}
      </div>

      {it.deco === 'colors' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: '#f6dde3', borderRadius: 13, padding: '12px 15px', marginBottom: 20 }}>
          <div>
            <div style={{ font: "700 13px 'Hanken Grotesk'", color: '#3a2820' }}>Icing colours</div>
            {(it.colors || 0) > 3 && <div style={{ font: "600 11px 'Hanken Grotesk'", color: '#b4506d' }}>+{money(Math.max(0, (it.colors || 0) - 3) * COLOUR_EXTRA_EACH)}/doz</div>}
            {(it.colors || 0) <= 3 && <div style={{ font: "500 11px 'Hanken Grotesk'", color: '#5c463c' }}>+ white, included</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="button" onClick={() => incColors(-1)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#3a2820', font: "700 17px 'Hanken Grotesk'", cursor: 'pointer' }}>−</button>
            <span style={{ font: "400 19px 'Fraunces'", color: '#3a2820', minWidth: 16, textAlign: 'center' }}>{it.colors}</span>
            <button type="button" onClick={() => incColors(1)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#3a2820', font: "700 17px 'Hanken Grotesk'", cursor: 'pointer' }}>+</button>
          </div>
        </div>
      )}
      {it.deco === 'printed' && (
        <div style={{ background: '#fbf6f0', borderRadius: 13, padding: '12px 15px', marginBottom: 20, font: "500 12px 'Hanken Grotesk'", color: '#5c463c', lineHeight: 1.5 }}>A full-colour edible image printed right onto the cookie — perfect for logos, photos and fine detail.</div>
      )}

      <div style={sectionLabel}>Quantity</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[6, 12, 24, 48].map((q) => (
          <button key={q} type="button" onClick={() => setField({ qty: q })} style={{ position: 'relative', flex: '1 1 70px', cursor: 'pointer', background: '#fff', border: '1.5px solid #efe2d3', borderRadius: 13, padding: '12px 6px', textAlign: 'center', fontFamily: "'Hanken Grotesk',sans-serif" }}>
            <div style={{ font: "400 18px 'Fraunces'", color: '#3a2820' }}>{q}</div>
            <div style={{ font: "600 9px 'Hanken Grotesk'", color: '#b4506d', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 1 }}>{q < 24 ? 'small batch' : (q === 24 ? 'minimum' : '')}</div>
            {it.qty === q && <span style={{ position: 'absolute', inset: 0, border: '2.5px solid #b4506d', borderRadius: 13, pointerEvents: 'none' }} />}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => setField({ qty: 'custom' })} style={{ position: 'relative', width: '100%', marginTop: 8, cursor: 'pointer', background: '#fff', border: '1.5px solid #efe2d3', borderRadius: 13, padding: 12, textAlign: 'center', font: "700 13px 'Hanken Grotesk'", color: '#3a2820', letterSpacing: '.02em' }}>
        CUSTOM AMOUNT
        {it.qty === 'custom' && <span style={{ position: 'absolute', inset: 0, border: '2.5px solid #b4506d', borderRadius: 13, pointerEvents: 'none' }} />}
      </button>
      {it.qty === 'custom' && (
        <input value={it.qtyCustom} onChange={(e) => setField({ qtyCustom: e.target.value.replace(/[^0-9]/g, '') })} inputMode="numeric" placeholder="How many cookies?" style={{ ...inputStyle, marginTop: 10 }} />
      )}
      {smallBatchItem && (
        <div style={{ marginTop: 11, background: '#fbf6f0', borderRadius: 12, padding: '13px 14px', font: "500 12px 'Hanken Grotesk'", color: '#5c463c', lineHeight: 1.5 }}>
          Orders under two dozen cookies include a one-time <b>+{money(SMALL_BATCH_FEE)}</b> small-batch fee — design, mockup, dough and icing colours take the same setup time whatever the size.
          <div style={{ marginTop: 6, fontWeight: 700, color: '#3a2820' }}>Two dozen of this cookie would run {money(priceItem({ ...it, qty: 24, qtyCustom: '' }))} total — no small-batch fee, and more cookies for your event.</div>
        </div>
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
      <h2 style={{ font: "400 22px 'Fraunces'", color: '#3a2820', margin: '0 0 4px' }}>Cookie Pebbles</h2>
      <p style={{ font: "500 13px 'Hanken Grotesk'", color: '#5c463c', margin: '0 0 18px' }}>Bite-size cookie bits, dipped in your choice of coatings.</p>

      <div style={sectionLabel}>Size</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
        {['s', 'm', 'l'].map((id) => (
          <button key={id} type="button" onClick={() => setField({ size: id })} style={{ position: 'relative', width: '100%', textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1.5px solid #efe2d3', borderRadius: 14, padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontFamily: "'Hanken Grotesk',sans-serif" }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ font: "700 15px 'Hanken Grotesk'", color: '#3a2820' }}>{PEBBLE_META[id].label} · {PEBBLE_META[id].pcs}</span>
              <span style={{ font: "500 12px 'Hanken Grotesk'", color: '#5c463c' }}>{PEBBLE_META[id].incl} dip{PEBBLE_META[id].incl > 1 ? 's' : ''} included</span>
            </span>
            <span style={{ font: "400 16px 'Fraunces'", color: '#3a2820' }}>${PEBBLE_META[id].price}</span>
            {it.size === id && <span style={{ position: 'absolute', inset: 0, border: '2.5px solid #b4506d', borderRadius: 14, pointerEvents: 'none' }} />}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 11 }}>
        <span style={sectionLabel}>Dips</span>
        <span style={{ font: "600 11px 'Hanken Grotesk'", color: '#5c463c' }}>{meta.incl} included · extras {money(PEBBLE_EXTRA_DIP)}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {DIPS.map((name) => {
          const on = sel.includes(name);
          return (
            <button key={name} type="button" onClick={() => toggleDip(name)} style={{ position: 'relative', cursor: 'pointer', background: on ? '#3a2820' : '#fff', border: '1.5px solid ' + (on ? '#3a2820' : '#e6d6c8'), borderRadius: 30, padding: '9px 15px', font: "600 13px 'Hanken Grotesk'", color: on ? '#fbf6f0' : '#5c463c' }}>{name}</button>
          );
        })}
      </div>
      {extra > 0 ? (
        <div style={{ font: "600 12px 'Hanken Grotesk'", color: '#b4506d', marginBottom: 20 }}>{extra} extra dip{extra > 1 ? 's' : ''} · +{money(extra * PEBBLE_EXTRA_DIP)}</div>
      ) : (
        <div style={{ height: 10 }} />
      )}

      <div style={sectionLabel}>How many?</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#f6dde3', borderRadius: 13, padding: '12px 16px' }}>
        <span style={{ font: "600 13px 'Hanken Grotesk'", color: '#3a2820', flex: 1 }}>Number of orders</span>
        <button type="button" onClick={() => incUnits(-1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#3a2820', font: "700 18px 'Hanken Grotesk'", cursor: 'pointer' }}>−</button>
        <span style={{ font: "400 20px 'Fraunces'", color: '#3a2820', minWidth: 22, textAlign: 'center' }}>{it.units}</span>
        <button type="button" onClick={() => incUnits(1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#3a2820', font: "700 18px 'Hanken Grotesk'", cursor: 'pointer' }}>+</button>
      </div>
    </>
  );
}

function GiftingBuilder({ item: it, setField, incDozens }) {
  const dozens = it.dozens || 4;
  const tier = giftingTierFor(dozens);
  const total = tier.amount * dozens;
  return (
    <>
      <h2 style={{ font: "400 22px 'Fraunces'", color: '#3a2820', margin: '0 0 4px' }}>Branded Client Gifting</h2>
      <p style={{ font: "500 13px 'Hanken Grotesk'", color: '#5c463c', margin: '0 0 18px' }}>Logo-accurate cookies for client and corporate gifting — 4 dozen minimum.</p>

      <div style={sectionLabel}>Company name</div>
      <input value={it.company} onChange={(e) => setField({ company: e.target.value })} placeholder="Who's this order for?" style={{ ...inputStyle, marginBottom: 20 }} />

      <div style={sectionLabel}>How many dozen?</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#f6dde3', borderRadius: 13, padding: '12px 16px', marginBottom: 8 }}>
        <span style={{ font: "600 13px 'Hanken Grotesk'", color: '#3a2820', flex: 1 }}>Dozens (4 minimum)</span>
        <button type="button" onClick={() => incDozens(-1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#3a2820', font: "700 18px 'Hanken Grotesk'", cursor: 'pointer' }}>−</button>
        <span style={{ font: "400 20px 'Fraunces'", color: '#3a2820', minWidth: 22, textAlign: 'center' }}>{dozens}</span>
        <button type="button" onClick={() => incDozens(1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#3a2820', font: "700 18px 'Hanken Grotesk'", cursor: 'pointer' }}>+</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', font: "600 12px 'Hanken Grotesk'", color: '#b4506d', marginBottom: 20 }}>
        <span>{money(tier.amount)}/dozen at this quantity</span>
        <span style={{ color: '#3a2820', fontWeight: 700 }}>{money(total)} total</span>
      </div>

      <div style={sectionLabel}>Brand colours</div>
      <input value={it.colours} onChange={(e) => setField({ colours: e.target.value })} placeholder="e.g. navy and gold" style={{ ...inputStyle, marginBottom: 20 }} />

      <div style={sectionLabel}>Occasion</div>
      <input value={it.occasion} onChange={(e) => setField({ occasion: e.target.value })} placeholder="e.g. closing gifts, office opening, conference handout" style={{ ...inputStyle, marginBottom: 20 }} />

      <div style={sectionLabel}>Delivery address</div>
      <textarea value={it.address} onChange={(e) => setField({ address: e.target.value })} rows={2} placeholder="Where should these be delivered?" style={{ ...inputStyle, lineHeight: 1.5, resize: 'vertical', fontFamily: "'Hanken Grotesk',sans-serif" }} />
    </>
  );
}
