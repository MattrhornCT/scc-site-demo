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
const inputStyle = { width: '100%', background: '#fff', border: '1.5px solid #e6d8cc', borderRadius: 12, padding: '12px 14px', font: "500 14px 'Hanken Grotesk'", color: '#4a352e' };
const sectionLabel = { font: "700 11px 'Hanken Grotesk'", letterSpacing: '.14em', textTransform: 'uppercase', color: '#a86a3e', marginBottom: 11 };

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
      style={{ fontFamily: "'Hanken Grotesk',system-ui,sans-serif", color: '#4a352e', background: '#fbf4ee', minHeight: '100%', width: '100%', position: 'relative' }}
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
                      { id: 'cookies', name: 'Custom Sugar Cookies', desc: 'Hand-iced or printed, any shape', from: `from ${money(DOZEN)}/doz`, emoji: '🍪', swatch: '#f9dbe3' },
                      { id: 'pebbles', name: 'Cookie Pebbles', desc: 'Bite-size, dipped in chocolate', from: `from ${money(PEBBLE_META.s.price)}`, emoji: '🍫', swatch: '#efe0d2' },
                      { id: 'gifting', name: 'Branded Client Gifting', desc: 'Logo-accurate cookies for corporate gifting, min. 4 dozen', from: `from ${money(GIFTING_TIERS[0].amount)}/doz`, emoji: '🎁', swatch: '#e6ddf0' },
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
                  {item.product === 'gifting' && (
                    <GiftingBuilder item={item} setField={setField} incDozens={incDozens} />
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0 0', font: "600 12px 'Hanken Grotesk'", color: '#96566b' }}><span>Small-batch fee</span><span>+{money(SMALL_BATCH_FEE)}</span></div>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0 0', borderTop: '1px solid rgba(255,255,255,.12)', font: "600 12px 'Hanken Grotesk'", color: '#e6b9c6' }}><span>Small-batch fee</span><span>+{money(SMALL_BATCH_FEE)}</span></div>
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
                  <label style={{ font: "600 12px 'Hanken Grotesk'", color: '#6b524a', display: 'block', marginBottom: 5 }}>{hasGifting ? 'Upload your logo' : 'Inspiration photos'} <span style={{ color: '#b9a596', fontWeight: 500 }}>{hasGifting ? '· for the print' : '· up to 3'}</span></label>
                  <label style={{ display: 'block', cursor: 'pointer', border: '1.5px dashed #d98da8', background: '#fdf1f5', borderRadius: 13, padding: 16, textAlign: 'center', font: "600 13px 'Hanken Grotesk'", color: '#96566b' }}>
                    {hasGifting ? '＋ Add your logo' : '＋ Add photos'}
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
                    <span style={{ font: "700 13px 'Hanken Grotesk'", color: '#96566b' }}>+{money(SMALL_BATCH_FEE)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12 }}>
                  <span style={{ font: "700 13px 'Hanken Grotesk'", color: '#8a6f63', textTransform: 'uppercase', letterSpacing: '.08em' }}>Estimate</span>
                  <span style={{ font: "800 24px 'Bricolage Grotesque'", color: '#49331f' }}>{money(total)}</span>
                </div>
                <div style={{ font: "500 11px 'Hanken Grotesk'", color: '#a89482', textAlign: 'right', marginTop: 2 }}>Subject to final quote</div>
              </div>

              {submitError && (
                <div style={{ marginTop: 16, background: '#f9dbe3', border: '1.5px solid #e6a6c0', borderRadius: 14, padding: '14px 16px', font: "500 13px 'Hanken Grotesk'", color: '#7a3c52', lineHeight: 1.55 }}>
                  <p style={{ margin: '0 0 10px' }}>Something went wrong sending your order automatically. Email <a href={`mailto:${OWNER_EMAIL}`} style={{ color: '#7a3c52', fontWeight: 700 }}>{OWNER_EMAIL}</a> with your details, or copy them now and paste them into an email:</p>
                  <button type="button" onClick={copyOrderDetails} style={{ cursor: 'pointer', background: '#fff', border: '1.5px solid #e6a6c0', color: '#7a3c52', borderRadius: 30, padding: '9px 16px', font: "700 13px 'Hanken Grotesk'" }}>{copied ? 'Copied ✓' : 'Copy order details'}</button>
                </div>
              )}

              <button type="submit" disabled={submitting} style={{ width: '100%', marginTop: 16, cursor: 'pointer', background: '#49331f', border: 'none', color: '#fbf4ee', borderRadius: 30, padding: 16, font: "700 16px 'Hanken Grotesk'", opacity: (hasContact && items.length > 0 && !submitting) ? 1 : .45 }}>{submitting ? 'Sending…' : 'Send my order request'}</button>
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
          { id: 'colors', label: 'Hand-piped icing', note: 'Up to 3 colours + white' },
          { id: 'printed', label: 'Printed image', note: 'Full-colour edible print' },
        ].map((d) => (
          <button key={d.id} type="button" onClick={() => setField({ deco: d.id })} style={{ position: 'relative', flex: '1 1 155px', textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1.5px solid #ece0d6', borderRadius: 14, padding: '13px 15px', fontFamily: "'Hanken Grotesk',sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <span style={{ font: "700 15px 'Hanken Grotesk'", color: '#49331f' }}>{d.label}</span>
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
            {(it.colors || 0) > 3 && <div style={{ font: "600 11px 'Hanken Grotesk'", color: '#a86a3e' }}>+{money(Math.max(0, (it.colors || 0) - 3) * COLOUR_EXTRA_EACH)}/doz</div>}
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
        <div style={{ background: '#eef3ea', borderRadius: 13, padding: '12px 15px', marginBottom: 20, font: "500 12px 'Hanken Grotesk'", color: '#5c6b52', lineHeight: 1.5 }}>A full-colour edible image printed right onto the cookie — perfect for logos, photos and fine detail.</div>
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
        <div style={{ marginTop: 11, background: '#f7ece4', borderRadius: 12, padding: '13px 14px', font: "500 12px 'Hanken Grotesk'", color: '#6b524a', lineHeight: 1.5 }}>
          Orders under two dozen cookies include a one-time <b>+{money(SMALL_BATCH_FEE)}</b> small-batch fee — design, mockup, dough and icing colours take the same setup time whatever the size.
          <div style={{ marginTop: 6, fontWeight: 700, color: '#49331f' }}>Two dozen of this cookie would run {money(priceItem({ ...it, qty: 24, qtyCustom: '' }))} total — no small-batch fee, and more cookies for your event.</div>
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
        <span style={{ font: "600 11px 'Hanken Grotesk'", color: '#8a6f63' }}>{meta.incl} included · extras {money(PEBBLE_EXTRA_DIP)}</span>
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
        <div style={{ font: "600 12px 'Hanken Grotesk'", color: '#a86a3e', marginBottom: 20 }}>{extra} extra dip{extra > 1 ? 's' : ''} · +{money(extra * PEBBLE_EXTRA_DIP)}</div>
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

function GiftingBuilder({ item: it, setField, incDozens }) {
  const dozens = it.dozens || 4;
  const tier = giftingTierFor(dozens);
  const total = tier.amount * dozens;
  return (
    <>
      <h2 style={{ font: "800 22px 'Bricolage Grotesque'", color: '#49331f', margin: '0 0 4px' }}>Branded Client Gifting</h2>
      <p style={{ font: "500 13px 'Hanken Grotesk'", color: '#8a6f63', margin: '0 0 18px' }}>Logo-accurate cookies for client and corporate gifting — 4 dozen minimum.</p>

      <div style={sectionLabel}>Company name</div>
      <input value={it.company} onChange={(e) => setField({ company: e.target.value })} placeholder="Who's this order for?" style={{ ...inputStyle, marginBottom: 20 }} />

      <div style={sectionLabel}>How many dozen?</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#f7ece4', borderRadius: 13, padding: '12px 16px', marginBottom: 8 }}>
        <span style={{ font: "600 13px 'Hanken Grotesk'", color: '#49331f', flex: 1 }}>Dozens (4 minimum)</span>
        <button type="button" onClick={() => incDozens(-1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#49331f', font: "700 18px 'Hanken Grotesk'", cursor: 'pointer' }}>−</button>
        <span style={{ font: "800 20px 'Bricolage Grotesque'", color: '#49331f', minWidth: 22, textAlign: 'center' }}>{dozens}</span>
        <button type="button" onClick={() => incDozens(1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#49331f', font: "700 18px 'Hanken Grotesk'", cursor: 'pointer' }}>+</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', font: "600 12px 'Hanken Grotesk'", color: '#a86a3e', marginBottom: 20 }}>
        <span>{money(tier.amount)}/dozen at this quantity</span>
        <span style={{ color: '#49331f', fontWeight: 700 }}>{money(total)} total</span>
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
