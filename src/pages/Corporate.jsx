import { useState } from 'react';
import { OWNER_EMAIL } from '../config.js';
import { GIFTING_TIERS, giftingTierFor } from '../data/gifting.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import logo from '../assets/logo.png';
import logoBlack from '../assets/logo-black.svg';

function money(n) {
  n = Math.round(n * 100) / 100;
  return '$' + (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2));
}

const inputStyle = { width: '100%', background: '#fff', border: '1.5px solid #e6d8cc', borderRadius: 10, padding: '11px 13px', font: "500 14px 'Hanken Grotesk'", color: '#4a352e' };
const label = { font: "600 12px 'Hanken Grotesk'", color: '#6b524a', display: 'block', marginBottom: 5 };

const OCCASIONS = [
  'Real estate closings',
  'Mortgage broker client gifts',
  'Clinic & med-spa referral thank-yous',
  'Law firm client gifting',
  'Conference & trade show handouts',
  'Branch & office openings',
  'Employee milestones',
];

export default function Corporate() {
  usePageMeta(
    "Corporate & Branded Cookie Gifting — Shelby's Cookie Co.",
    'Logo-accurate custom cookies for corporate gifting, client closings, and office milestones across the GTA. Volume pricing from ' + money(GIFTING_TIERS[GIFTING_TIERS.length - 1].amount) + '/dozen, invoicing accommodated.'
  );

  return (
    <main style={{ fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <section className="page-pad" style={{ background: '#35241a', color: '#fbf4ee', paddingTop: 64, paddingBottom: 56 }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', border: '1px solid rgba(251,244,238,.3)', borderRadius: 6, padding: '5px 12px', font: "700 11px 'Hanken Grotesk'", letterSpacing: '.12em', textTransform: 'uppercase', color: '#d9b3bf', marginBottom: 18 }}>Corporate &amp; Client Gifting</div>
          <h1 className="hero-title-sm" style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 40, letterSpacing: '-.02em', margin: '0 0 14px', lineHeight: 1.15 }}>Branded cookies your clients actually remember opening.</h1>
          <p style={{ font: "500 16px 'Hanken Grotesk'", color: '#d3c2b7', lineHeight: 1.6, margin: '0 0 24px', maxWidth: 620 }}>Logo-accurate custom cookies for closings, referral thank-yous, and office milestones — priced and delivered like the professional gift they are, not a catering add-on.</p>
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', font: "600 13px 'Hanken Grotesk'", color: '#c9b3a6' }}>
            <span>✓ Invoicing &amp; PO numbers accommodated</span>
            <span>✓ Volume pricing shown up front</span>
            <span>✓ GTA delivery scheduled to your date</span>
          </div>
        </div>
      </section>

      <section className="page-pad" style={{ maxWidth: 780, margin: '0 auto', paddingTop: 48, paddingBottom: 8 }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 24, color: '#49331f', margin: '0 0 18px' }}>Where this fits</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {OCCASIONS.map((o) => (
            <div key={o} style={{ background: '#f7ece4', borderRadius: 10, padding: '13px 15px', font: "600 13.5px 'Hanken Grotesk'", color: '#49331f' }}>{o}</div>
          ))}
        </div>
      </section>

      <section className="page-pad" style={{ maxWidth: 780, margin: '0 auto', paddingTop: 40, paddingBottom: 8 }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 24, color: '#49331f', margin: '0 0 6px' }}>Volume pricing</h2>
        <p style={{ font: "500 13.5px 'Hanken Grotesk'", color: '#8a6f63', margin: '0 0 16px' }}>4 dozen minimum. Rate applies per dozen across the whole order.</p>
        <div style={{ border: '1.5px solid #efe4d9', borderRadius: 14, overflow: 'hidden' }}>
          {GIFTING_TIERS.map((t, i) => (
            <div key={t.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: i % 2 ? '#fbf4ee' : '#fff', borderTop: i > 0 ? '1px solid #efe4d9' : 'none' }}>
              <span style={{ font: "700 15px 'Hanken Grotesk'", color: '#49331f' }}>{t.min}{t.max ? `–${t.max}` : '+'} dozen</span>
              <span style={{ font: "800 18px 'Bricolage Grotesque'", color: '#49331f' }}>{money(t.amount)}<span style={{ font: "500 12px 'Hanken Grotesk'", color: '#8a6f63' }}> /dozen</span></span>
            </div>
          ))}
        </div>
      </section>

      <section className="page-pad" style={{ maxWidth: 780, margin: '0 auto', paddingTop: 40, paddingBottom: 8 }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 24, color: '#49331f', margin: '0 0 16px' }}>Lead time &amp; logistics</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}><b style={{ color: '#49331f' }}>Lead time</b><span style={{ color: '#6b524a' }}>2 weeks minimum for volume orders — more for larger runs or during November/December.</span></div>
          <div style={{ display: 'flex', gap: 12 }}><b style={{ color: '#49331f' }}>Delivery</b><span style={{ color: '#6b524a' }}>GTA delivery scheduled to your date, or pickup in North York.</span></div>
          <div style={{ display: 'flex', gap: 12 }}><b style={{ color: '#49331f' }}>Invoicing</b><span style={{ color: '#6b524a' }}>PO numbers and invoicing terms are accommodated — just note it in your enquiry below.</span></div>
        </div>
      </section>

      <section style={{ maxWidth: 640, margin: '48px auto 72px', padding: '0 24px' }}>
        <div style={{ border: '1.5px solid #efe4d9', borderRadius: 22, background: '#fbf4ee', padding: '30px 28px', boxShadow: '0 30px 70px -40px rgba(74,53,46,.4)' }}>
          <CorporateEnquiryForm />
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
        <div style={{ width: 54, height: 48, margin: '0 auto 18px', background: '#a86a3e', WebkitMask: `url(${logoBlack}) center/contain no-repeat`, mask: `url(${logoBlack}) center/contain no-repeat` }} />
        <h2 style={{ font: "800 24px 'Bricolage Grotesque'", color: '#49331f', margin: '0 0 10px' }}>Enquiry sent</h2>
        <p style={{ font: "500 14px 'Hanken Grotesk'", color: '#8a6f63', lineHeight: 1.55, maxWidth: 360, margin: '0 auto' }}>Thanks — I'll follow up with a formal quote and next steps.</p>
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

      <h2 style={{ font: "800 20px 'Bricolage Grotesque'", color: '#49331f', margin: '0 0 4px' }}>Request corporate pricing</h2>
      <p style={{ font: "500 13px 'Hanken Grotesk'", color: '#8a6f63', margin: '0 0 20px' }}>A few logistics details — no design questions needed yet.</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ flex: '1 1 100%' }}>
          <label style={label}>Company name</label>
          <input value={company} onChange={(e) => setCompany(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 100%' }}>
          <label style={label}>Your name</label>
          <input value={contact.name} onChange={(e) => setContact('name', e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 240px' }}>
          <label style={label}>Email</label>
          <input value={contact.email} onChange={(e) => setContact('email', e.target.value)} type="email" style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <label style={label}>Phone</label>
          <input value={contact.phone} onChange={(e) => setContact('phone', e.target.value)} style={inputStyle} />
        </div>

        <div style={{ flex: '1 1 100%', marginTop: 4, display: 'flex', alignItems: 'center', gap: 16, background: '#f7ece4', borderRadius: 13, padding: '12px 16px' }}>
          <span style={{ font: "600 13px 'Hanken Grotesk'", color: '#49331f', flex: 1 }}>Dozens (4 minimum)</span>
          <button type="button" onClick={() => setDozens((d) => Math.max(4, d - 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#49331f', font: "700 17px 'Hanken Grotesk'", cursor: 'pointer' }}>−</button>
          <span style={{ font: "800 19px 'Bricolage Grotesque'", color: '#49331f', minWidth: 20, textAlign: 'center' }}>{dozens}</span>
          <button type="button" onClick={() => setDozens((d) => d + 1)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #d8c4b5', background: '#fff', color: '#49331f', font: "700 17px 'Hanken Grotesk'", cursor: 'pointer' }}>+</button>
        </div>
        <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'space-between', font: "600 12px 'Hanken Grotesk'", color: '#a86a3e', marginTop: -4 }}>
          <span>{money(tier.amount)}/dozen at this quantity</span>
          <span style={{ color: '#49331f', fontWeight: 700 }}>{money(total)} total</span>
        </div>

        <div style={{ flex: '1 1 100%' }}>
          <label style={label}>Brand colours <span style={{ color: '#b9a596', fontWeight: 500 }}>· optional</span></label>
          <input value={colours} onChange={(e) => setColours(e.target.value)} placeholder="e.g. navy and gold" style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 100%' }}>
          <label style={label}>Occasion</label>
          <input value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="e.g. closing gifts, office opening" style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 100%' }}>
          <label style={label}>Delivery date</label>
          <input value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} type="date" style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 100%' }}>
          <label style={label}>Delivery address</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} style={{ ...inputStyle, lineHeight: 1.5, resize: 'vertical', fontFamily: "'Hanken Grotesk',sans-serif" }} />
        </div>
        <div style={{ flex: '1 1 100%' }}>
          <label style={label}>Logo <span style={{ color: '#b9a596', fontWeight: 500 }}>· optional for now</span></label>
          <label style={{ display: 'block', cursor: 'pointer', border: '1.5px dashed #d8c4b5', background: '#fff', borderRadius: 10, padding: 14, textAlign: 'center', font: "600 13px 'Hanken Grotesk'", color: '#6b524a' }}>
            {logoFile ? logoFile.name : '＋ Add your logo'}
            <input type="file" accept="image/*" onChange={(e) => onLogo(e.target.files)} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {submitError && (
        <div style={{ marginTop: 16, background: '#f9dbe3', border: '1.5px solid #e6a6c0', borderRadius: 14, padding: '14px 16px', font: "500 13px 'Hanken Grotesk'", color: '#7a3c52', lineHeight: 1.55 }}>
          <p style={{ margin: '0 0 10px' }}>Something went wrong sending this automatically. Email <a href={`mailto:${OWNER_EMAIL}`} style={{ color: '#7a3c52', fontWeight: 700 }}>{OWNER_EMAIL}</a> with your details, or copy them now and paste them into an email:</p>
          <button type="button" onClick={copyEnquiryDetails} style={{ cursor: 'pointer', background: '#fff', border: '1.5px solid #e6a6c0', color: '#7a3c52', borderRadius: 30, padding: '9px 16px', font: "700 13px 'Hanken Grotesk'" }}>{copied ? 'Copied ✓' : 'Copy enquiry details'}</button>
        </div>
      )}

      <button type="submit" disabled={submitting} style={{ width: '100%', marginTop: 18, cursor: 'pointer', background: '#49331f', border: 'none', color: '#fbf4ee', borderRadius: 30, padding: 15, font: "700 15px 'Hanken Grotesk'", opacity: (canSubmit && !submitting) ? 1 : .45 }}>{submitting ? 'Sending…' : 'Request pricing'}</button>
    </form>
  );
}
