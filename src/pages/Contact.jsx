import { useState } from 'react';
import { OWNER_EMAIL } from '../config.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

const inputStyle = { width: '100%', background: '#fff', border: '1.5px solid #e6d8cc', borderRadius: 10, padding: '11px 13px', font: "500 14px 'Hanken Grotesk'", color: '#4a352e' };
const label = { font: "600 12px 'Hanken Grotesk'", color: '#6b524a', display: 'block', marginBottom: 5 };

export default function Contact({ goOrder }) {
  usePageMeta(
    "Contact — Shelby's Cookie Co.",
    "Get in touch about a custom cookie order, event, or corporate gifting enquiry across the Greater Toronto Area."
  );

  return (
    <main>
      <section className="page-pad" style={{ textAlign: 'center', paddingTop: 54, paddingBottom: 30 }}>
        <span style={{ display: 'inline-block', background: '#f9dbe3', color: '#96566b', border: '1.5px dashed #d98da8', borderRadius: 30, padding: '6px 15px', font: "700 11.5px 'Hanken Grotesk'", letterSpacing: '.05em', transform: 'rotate(-1.5deg)', marginBottom: 16 }}>✿ Say hello</span>
        <h1 className="hero-title-sm" style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 46, letterSpacing: '-.02em', margin: '0 0 10px' }}>Let's talk about your order</h1>
        <p style={{ color: '#8a6f63', fontSize: 16, margin: '0 auto', maxWidth: 480 }}>Questions about custom cookies, timelines, or corporate gifting — I read every message myself.</p>
      </section>

      <section className="contact-layout" style={{ maxWidth: 1040, margin: '0 auto', padding: '20px 24px 30px', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 26, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', border: '1.5px solid #efe4d9', borderRadius: 20, padding: '24px 22px', boxShadow: '0 14px 30px -24px rgba(74,53,46,.5)' }}>
            <div style={{ font: "700 11px 'Hanken Grotesk'", letterSpacing: '.14em', textTransform: 'uppercase', color: '#a86a3e', marginBottom: 14 }}>Get in touch</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ font: "600 12px 'Hanken Grotesk'", color: '#8a6f63', marginBottom: 3 }}>Email</div>
                <a href={`mailto:${OWNER_EMAIL}`} style={{ font: "700 14.5px 'Hanken Grotesk'", color: '#49331f' }}>{OWNER_EMAIL}</a>
              </div>
              <div>
                <div style={{ font: "600 12px 'Hanken Grotesk'", color: '#8a6f63', marginBottom: 3 }}>Service area</div>
                <div style={{ font: "600 14.5px 'Hanken Grotesk'", color: '#49331f' }}>Greater Toronto Area — pickup &amp; local delivery</div>
              </div>
              <div>
                <div style={{ font: "600 12px 'Hanken Grotesk'", color: '#8a6f63', marginBottom: 3 }}>Response time</div>
                <div style={{ font: "600 14.5px 'Hanken Grotesk'", color: '#49331f' }}>Usually within 1–2 business days</div>
              </div>
            </div>
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #f2e8dd', font: "500 12.5px 'Hanken Grotesk'", color: '#8a6f63', lineHeight: 1.5 }}>
              For a full custom order, the <button onClick={goOrder} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, font: 'inherit', color: '#a86a3e', fontWeight: 700 }}>order form</button> gets you a faster quote — this page is best for general questions.
            </div>
          </div>

          <NewsletterBox />
        </div>

        <div style={{ border: '1.5px solid #efe4d9', borderRadius: 20, background: '#fbf4ee', padding: '26px 24px', boxShadow: '0 14px 30px -24px rgba(74,53,46,.5)' }}>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [noted, setNoted] = useState(false);
  const canSubmit = !!(name.trim() && email.trim() && message.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setNoted(true);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ font: "800 20px 'Bricolage Grotesque'", color: '#49331f', margin: '0 0 4px' }}>Send a message</h2>
      <p style={{ font: "500 13px 'Hanken Grotesk'", color: '#8a6f63', margin: '0 0 20px' }}>This form is still being wired up — for now, email is the fastest way to reach me.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={label}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={label}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={inputStyle} />
        </div>
        <div>
          <label style={label}>Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} style={{ ...inputStyle, lineHeight: 1.5, resize: 'vertical', fontFamily: "'Hanken Grotesk',sans-serif" }} />
        </div>
      </div>

      {noted && (
        <div style={{ marginTop: 16, background: '#f7ece4', border: '1.5px solid #e6d8cc', borderRadius: 14, padding: '13px 15px', font: "500 13px 'Hanken Grotesk'", color: '#6b524a', lineHeight: 1.55 }}>
          Thanks — this form isn't connected yet, so nothing was sent. Please email <a href={`mailto:${OWNER_EMAIL}`} style={{ color: '#49331f', fontWeight: 700 }}>{OWNER_EMAIL}</a> directly and I'll get back to you.
        </div>
      )}

      <button type="submit" disabled={!canSubmit} style={{ width: '100%', marginTop: 18, cursor: 'pointer', background: '#49331f', border: 'none', color: '#fbf4ee', borderRadius: 30, padding: 15, font: "700 15px 'Hanken Grotesk'", opacity: canSubmit ? 1 : .45 }}>Send message</button>
    </form>
  );
}

function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <div style={{ background: '#49331f', color: '#fbf4ee', borderRadius: 20, padding: '22px 22px' }}>
      <div style={{ font: "700 11px 'Hanken Grotesk'", letterSpacing: '.14em', textTransform: 'uppercase', color: '#e6c3ce', marginBottom: 8 }}>Stay in the loop</div>
      <p style={{ font: "500 13px 'Hanken Grotesk'", color: '#e6c3ce', lineHeight: 1.5, margin: '0 0 14px' }}>New gallery designs, seasonal flavours, and the occasional discount — no spam.</p>
      {subscribed ? (
        <div style={{ font: "700 13.5px 'Hanken Grotesk'", color: '#f5cad9' }}>You're on the list ✓</div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@email.com"
            style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.2)', borderRadius: 10, padding: '10px 12px', font: "500 13.5px 'Hanken Grotesk'", color: '#fbf4ee' }}
          />
          <button type="submit" style={{ cursor: 'pointer', background: '#f5cad9', border: 'none', color: '#49331f', borderRadius: 10, padding: '10px 16px', font: "700 13px 'Hanken Grotesk'", flex: 'none' }}>Subscribe</button>
        </form>
      )}
    </div>
  );
}
