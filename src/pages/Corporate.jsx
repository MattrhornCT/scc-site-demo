import { useState } from 'react';
import { OWNER_EMAIL } from '../config.js';
import { GIFTING_TIERS, giftingTierFor } from '../data/gifting.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { getPhotosMatching, getRecentPhotos } from '../gallery/loadGallery.js';
import portrait from '../assets/photos/shelby-portrait-cookie.jpg';
import logoBlack from '../assets/logo-black.svg';

function money(n) {
  n = Math.round(n * 100) / 100;
  return '$' + (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2));
}

const OCCASIONS = [
  'Real estate closings',
  'Mortgage broker client gifts',
  'Clinic & med-spa referral thank-yous',
  'Law firm client gifting',
  'Conference & trade show handouts',
  'Branch & office openings',
  'Employee milestones',
];

// Real corporate-themed gallery photos where they exist, otherwise recent work.
const heroPhotos = (() => {
  const c = getPhotosMatching(['corporate'], 2);
  return c.length ? c : getRecentPhotos(2);
})();

const TIER_STYLES = [
  { bg: '#f6dde3', fg: '#3a2820', kicker: '#8a3550' },
  { bg: '#efe2d3', fg: '#3a2820', kicker: '#a0603f' },
  { bg: '#3a2820', fg: '#fbf6f0', kicker: '#e7aabd' },
];

const LOGISTICS = [
  { title: 'Lead time', body: '2 weeks minimum for volume orders — more for larger runs or during November/December.', bg: '#fbf6f0', stroke: '#b4506d',
    icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
  { title: 'Delivery', body: 'GTA delivery scheduled to your date, or pickup in North York.', bg: '#f6dde3', stroke: '#8a3550',
    icon: <><path d="M12 21.5 C12 21.5 19 14.5 19 9 A7 7 0 1 0 5 9 C5 14.5 12 21.5 12 21.5Z" /><circle cx="12" cy="9" r="2.6" /></> },
  { title: 'Invoicing', body: 'PO numbers and invoicing terms are accommodated — just note it in your enquiry below.', bg: '#ecc3cf', stroke: '#8a3550',
    icon: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8.5 8h7M8.5 12h7M8.5 16h4" /></> },
];

const tierLabel = (t) => `${t.min}${t.max ? `–${t.max}` : '+'} dozen`;

export default function Corporate() {
  usePageMeta(
    "Corporate & Branded Cookie Gifting — Shelby's Cookie Co.",
    'Logo-accurate custom cookies for corporate gifting, client closings, and office milestones across the GTA. Volume pricing from ' + money(GIFTING_TIERS[GIFTING_TIERS.length - 1].amount) + '/dozen, invoicing accommodated.'
  );

  return (
    <main>
      {/* HERO */}
      <section style={{ background: '#3a2820', color: '#fbf6f0', overflow: 'hidden' }}>
        <div className="hero" style={{ maxWidth: 1240, margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: heroPhotos.length ? 'minmax(0,1.15fr) minmax(0,.85fr)' : 'minmax(0,1fr)', gap: 56, alignItems: 'center' }}>
          <div>
            <div className="kicker" style={{ color: '#e7aabd', marginBottom: 22 }}>Corporate &amp; client gifting</div>
            <h1 className="serif h1" style={{ fontSize: 70, fontWeight: 400, letterSpacing: '-.035em', lineHeight: 1, margin: '0 0 24px' }}>Branded cookies your clients <em style={{ fontWeight: 300, color: '#e7aabd' }}>actually remember opening.</em></h1>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: '#e3d2c8', maxWidth: 520, margin: '0 0 30px' }}>Logo-accurate custom cookies for closings, referral thank-yous, and office milestones — priced and delivered like the professional gift they are, not a catering add-on.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 34px', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {['✓ Invoicing & PO numbers accommodated', '✓ Volume pricing shown up front', '✓ GTA delivery scheduled to your date'].map((t) => (
                <li key={t} style={{ border: '1.5px solid rgba(251,246,240,.25)', borderRadius: 999, padding: '8px 15px', font: "600 13.5px 'Hanken Grotesk'" }}>{t}</li>
              ))}
            </ul>
            <a className="btn btn-cream" href="#request">Request corporate pricing</a>
          </div>
          {heroPhotos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
              <div className="zoom" style={{ borderRadius: 12, border: '8px solid #efe2d3' }}><img src={heroPhotos[0].srcLarge} alt={heroPhotos[0].label} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block', borderRadius: 4 }} /></div>
              {heroPhotos[1] && <div className="zoom" style={{ borderRadius: '300px 300px 12px 12px', marginTop: 54, border: '8px solid #ecc3cf' }}><img src={heroPhotos[1].srcLarge} alt={heroPhotos[1].label} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} /></div>}
            </div>
          )}
        </div>
      </section>

      {/* WHERE THIS FITS */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '84px 40px 40px' }}>
        <div className="two" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,.7fr) minmax(0,1.3fr)', gap: 56, alignItems: 'start' }}>
          <div>
            <div className="kicker" style={{ color: '#b4506d', marginBottom: 14 }}>Where this fits</div>
            <h2 className="serif h2" style={{ fontSize: 48, fontWeight: 400, letterSpacing: '-.03em', lineHeight: 1, margin: 0 }}>Gifts for <em style={{ fontWeight: 300, color: '#b4506d' }}>every milestone</em></h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
            {OCCASIONS.map((o) => <li key={o} className="fit" style={{ background: '#f6dde3', borderRadius: 14, padding: '14px 18px', font: "600 15px 'Hanken Grotesk'" }}>{o}</li>)}
          </ul>
        </div>
      </section>

      {/* PRICING + LOGISTICS */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '60px 40px 90px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 26 }}>
          <div>
            <div className="kicker" style={{ color: '#b4506d', marginBottom: 14 }}>Volume pricing</div>
            <h2 className="serif h2" style={{ fontSize: 48, fontWeight: 400, letterSpacing: '-.03em', lineHeight: 1, margin: 0 }}>Simple, <em style={{ fontWeight: 300, color: '#b4506d' }}>up-front pricing</em></h2>
          </div>
          <p style={{ margin: 0, color: '#5c463c', maxWidth: 360, lineHeight: 1.6 }}>4 dozen minimum. Rate applies per dozen across the whole order.</p>
        </div>
        <div className="tiers" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(GIFTING_TIERS.length, 1)},minmax(0,1fr))`, gap: 16, marginBottom: 56 }}>
          {GIFTING_TIERS.map((t, i) => {
            const st = TIER_STYLES[Math.min(i, TIER_STYLES.length - 1)];
            return (
              <div key={t.key} className="tier" style={{ background: st.bg, color: st.fg, borderRadius: 22, padding: '28px 26px' }}>
                <div className="kicker" style={{ fontSize: 11, color: st.kicker, marginBottom: 14 }}>{tierLabel(t)}</div>
                <div>
                  <span className="serif" style={{ fontSize: 56, fontWeight: 400, letterSpacing: '-.03em' }}>{money(t.amount)}</span>
                  <span className="serif" style={{ fontSize: 20, fontStyle: 'italic', fontWeight: 300 }}> / dozen</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="kicker" style={{ color: '#b4506d', marginBottom: 16 }}>Lead time &amp; logistics</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          {LOGISTICS.map((l) => (
            <div key={l.title} className="lift step" style={{ background: l.bg, borderRadius: 20, padding: '24px 24px 28px', minHeight: 170 }}>
              <div style={{ font: "700 17px 'Hanken Grotesk'", marginBottom: 8 }}>{l.title}</div>
              <p style={{ margin: 0, color: '#5c463c', lineHeight: 1.6, fontSize: 15, maxWidth: 260 }}>{l.body}</p>
              <svg className="wm" aria-hidden="true" viewBox="0 0 24 24" style={{ stroke: l.stroke, opacity: .32 }}>{l.icon}</svg>
            </div>
          ))}
        </div>
      </section>

      {/* REQUEST FORM */}
      <section id="request" style={{ background: '#efe2d3', position: 'relative' }}>
        <div className="beads" aria-hidden="true" style={{ color: '#b4506d', opacity: .55, position: 'absolute', top: 16, left: 0, right: 0 }} />
        <div className="two" style={{ maxWidth: 1240, margin: '0 auto', padding: '96px 40px', display: 'grid', gridTemplateColumns: 'minmax(0,.75fr) minmax(0,1.25fr)', gap: 56, alignItems: 'start' }}>
          <div>
            <div className="kicker" style={{ color: '#8a3550', marginBottom: 14 }}>Request pricing</div>
            <h2 className="serif h2" style={{ fontSize: 52, fontWeight: 400, letterSpacing: '-.03em', lineHeight: 1, margin: '0 0 18px' }}>Let's get your <em style={{ fontWeight: 300, color: '#b4506d' }}>gift box</em> started</h2>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: '#5c463c', margin: '0 0 26px' }}>A few logistics details — no design questions needed yet.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img className="pop" src={portrait} alt="Shelby" style={{ width: 62, height: 62, objectFit: 'cover', objectPosition: '50% 20%', borderRadius: '50%', border: '4px solid #fbf6f0' }} />
              <span className="hand" style={{ fontSize: 24, color: '#8a3550', lineHeight: 1.05 }}>I'll reply within<br />a couple of days!</span>
            </div>
          </div>
          <div style={{ background: '#fbf6f0', borderRadius: 24, padding: 32, boxShadow: '0 30px 60px -40px rgba(58,40,32,.5)' }}>
            <CorporateEnquiryForm />
          </div>
        </div>
      </section>
    </main>
  );
}

function CorporateEnquiryForm() {
  const [contact, setContactState] = useState({ name: '', email: '', phone: '' });
  const [company, setCompany] = useState('');
  const [dozens, setDozens] = useState(4);
  const [colours, setColours] = useState('');
  const [occasion, setOccasion] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [address, setAddress] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [copied, setCopied] = useState(false);
  // Honeypot — same pattern as OrderForm.jsx.
  const [companyWebsite, setCompanyWebsite] = useState('');

  const setContact = (f, v) => setContactState((c) => ({ ...c, [f]: v }));
  const tier = giftingTierFor(dozens);
  const total = tier.amount * dozens;
  const canSubmit = !!(contact.name && contact.email && company.trim() && address.trim() && dozens >= 4);

  const orderSummary = `Branded Client Gifting — ${company} — ${dozens} dozen · ${money(tier.amount)}/doz — ${money(total)} total`;

  const onLogo = (fileList) => {
    const file = (fileList || [])[0];
    if (!file) return;
    if (logoFile) { try { URL.revokeObjectURL(logoFile.url); } catch (e) {} }
    setLogoFile({ file, url: URL.createObjectURL(file), name: file.name });
  };

  const copyEnquiryDetails = async () => {
    const text = [
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Phone: ${contact.phone}`,
      `Delivery date: ${deliveryDate}`,
      '',
      orderSummary,
      colours ? `Brand colours: ${colours}` : '',
      occasion ? `Occasion: ${occasion}` : '',
      address ? `Delivery address: ${address}` : '',
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Clipboard API can be unavailable — the owner's email shown alongside
      // this button is still a usable fallback either way.
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError(false);
    try {
      const itemsPayload = [{ product: 'Branded Client Gifting', company, dozens, colours, occasion, address, price: total }];
      const formData = new FormData();
      formData.append('name', contact.name);
      formData.append('email', contact.email);
      formData.append('phone', contact.phone);
      formData.append('eventDate', deliveryDate);
      formData.append('total', String(total));
      formData.append('smallBatchFee', '0');
      formData.append('itemsJson', JSON.stringify(itemsPayload));
      formData.append('orderSummary', orderSummary);
      formData.append('deviceType', window.innerWidth < 768 ? 'mobile' : 'desktop');
      formData.append('companyWebsite', companyWebsite);
      if (logoFile) formData.append('photo1', logoFile.file);

      const res = await fetch('/order', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({ ok: false }));
      if (res.ok && data.ok) setSubmitted(true); else setSubmitError(true);
    } catch (err) {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 4px' }}>
        <div style={{ width: 54, height: 48, margin: '0 auto 18px', background: '#b4506d', WebkitMask: `url(${logoBlack}) center/contain no-repeat`, mask: `url(${logoBlack}) center/contain no-repeat` }} />
        <h2 className="serif" style={{ fontSize: 34, fontWeight: 400, margin: '0 0 10px' }}>Enquiry <em style={{ fontWeight: 300, color: '#b4506d' }}>sent</em></h2>
        <p className="hand" style={{ fontSize: 26, color: '#b4506d', margin: 0 }}>thank you — I'll follow up with a formal quote and next steps ♥</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
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

      <div className="f2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '16px 18px' }}>
        <div className="fld"><label htmlFor="c-co">Company name</label><input id="c-co" type="text" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} /></div>
        <div className="fld"><label htmlFor="c-name">Your name</label><input id="c-name" type="text" autoComplete="name" value={contact.name} onChange={(e) => setContact('name', e.target.value)} /></div>
        <div className="fld"><label htmlFor="c-email">Email</label><input id="c-email" type="email" autoComplete="email" value={contact.email} onChange={(e) => setContact('email', e.target.value)} /></div>
        <div className="fld"><label htmlFor="c-phone">Phone</label><input id="c-phone" type="tel" autoComplete="tel" value={contact.phone} onChange={(e) => setContact('phone', e.target.value)} /></div>
      </div>

      <div style={{ margin: '22px 0', padding: 20, background: '#f6dde3', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ font: "700 12px 'Hanken Grotesk'", letterSpacing: '.08em', textTransform: 'uppercase', color: '#5c463c', marginBottom: 10 }}>Dozens <span className="opt">(4 minimum)</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button type="button" className="step-btn" onClick={() => setDozens((d) => Math.max(4, d - 1))} aria-label="Fewer dozens">−</button>
            <span className="serif" style={{ fontSize: 34, minWidth: 44, textAlign: 'center' }} aria-live="polite">{dozens}</span>
            <button type="button" className="step-btn" onClick={() => setDozens((d) => d + 1)} aria-label="More dozens">+</button>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ font: "600 14px 'Hanken Grotesk'", color: '#8a3550' }}>{money(tier.amount)}/dozen at this quantity</div>
          <div className="serif" style={{ fontSize: 40, letterSpacing: '-.02em' }}>{money(total)} total</div>
        </div>
      </div>

      <div className="f2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '16px 18px' }}>
        <div className="fld"><label htmlFor="c-col">Brand colours <span className="opt">· optional</span></label><input id="c-col" type="text" placeholder="e.g. navy and gold" value={colours} onChange={(e) => setColours(e.target.value)} /></div>
        <div className="fld"><label htmlFor="c-occ">Occasion</label><input id="c-occ" type="text" placeholder="e.g. closing gifts, office opening" value={occasion} onChange={(e) => setOccasion(e.target.value)} /></div>
        <div className="fld"><label htmlFor="c-date">Delivery date</label><input id="c-date" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} /></div>
        <div className="fld"><label htmlFor="c-addr">Delivery address</label><textarea id="c-addr" rows={1} autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ resize: 'vertical', lineHeight: 1.4 }} /></div>
      </div>

      <div className="fld" style={{ marginTop: 16 }}>
        <span className="lbl">Logo <span className="opt">· optional for now</span></span>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1.5px dashed #d58aa1', borderRadius: 14, padding: 22, background: '#fff', cursor: 'pointer', font: "600 15px 'Hanken Grotesk'", color: '#8a3550' }}>
          {logoFile ? logoFile.name : '＋ Add your logo'}
          <input type="file" accept="image/*" onChange={(e) => onLogo(e.target.files)} style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
        </label>
      </div>

      {submitError && (
        <div style={{ marginTop: 16, background: '#f6dde3', border: '1.5px solid #d58aa1', borderRadius: 14, padding: '14px 16px', font: "500 13px 'Hanken Grotesk'", color: '#8a3550', lineHeight: 1.55 }}>
          <p style={{ margin: '0 0 10px' }}>Something went wrong sending this automatically. Email <a href={`mailto:${OWNER_EMAIL}`} style={{ color: '#8a3550', fontWeight: 700 }}>{OWNER_EMAIL}</a> with your details, or copy them now and paste them into an email:</p>
          <button type="button" onClick={copyEnquiryDetails} style={{ cursor: 'pointer', background: '#fff', border: '1.5px solid #d58aa1', color: '#8a3550', borderRadius: 30, padding: '9px 16px', font: "700 13px 'Hanken Grotesk'" }}>{copied ? 'Copied ✓' : 'Copy enquiry details'}</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginTop: 26 }}>
        <span style={{ fontSize: 13.5, color: '#5c463c' }}>No payment now — I'll reply with a quote.</span>
        <button type="submit" className="btn" disabled={submitting} style={{ opacity: (canSubmit && !submitting) ? 1 : .45 }}>{submitting ? 'Sending…' : 'Request pricing'}</button>
      </div>
    </form>
  );
}
