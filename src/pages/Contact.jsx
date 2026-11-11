import { useState } from 'react';
import { OWNER_EMAIL } from '../config.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

const inputStyle = { width: '100%', background: '#fff', border: '1.5px solid #e6d6c8', borderRadius: 10, padding: '11px 13px', font: "500 14px 'Hanken Grotesk'", color: '#3a2820' };
const label = { font: "600 12px 'Hanken Grotesk'", color: '#5c463c', display: 'block', marginBottom: 5 };

export default function Contact({ goOrder }) {
  usePageMeta(
    "Contact — Shelby's Cookie Co.",
    "Get in touch about a custom cookie order, event, or corporate gifting enquiry across the Greater Toronto Area."
  );

  return (
    <main>
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '64px 40px 30px', textAlign: 'center' }}>
        <div className="kicker" style={{ color: '#b4506d', marginBottom: 16 }}>Say hello</div>
        <h1 className="serif h1" style={{ fontSize: 64, fontWeight: 400, letterSpacing: '-.035em', lineHeight: 1, margin: '0 0 18px' }}>Let's talk <em style={{ fontWeight: 300, color: '#b4506d' }}>about your order</em></h1>
        <p style={{ color: '#5c463c', fontSize: 18, lineHeight: 1.6, margin: '0 auto', maxWidth: 520 }}>Questions about custom cookies, timelines, or corporate gifting — I read every message myself.</p>
      </section>

      <section className="contact-layout" style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 40px 100px', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 26, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', border: '1.5px solid #efe2d3', borderRadius: 22, padding: '24px 22px', boxShadow: '0 20px 40px -30px rgba(58,40,32,.45)' }}>
            <div style={{ font: "700 11px 'Hanken Grotesk'", letterSpacing: '.14em', textTransform: 'uppercase', color: '#b4506d', marginBottom: 14 }}>Get in touch</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ font: "600 12px 'Hanken Grotesk'", color: '#5c463c', marginBottom: 3 }}>Email</div>
                <a href={`mailto:${OWNER_EMAIL}`} style={{ font: "700 14.5px 'Hanken Grotesk'", color: '#3a2820' }}>{OWNER_EMAIL}</a>
              </div>
              <div>
                <div style={{ font: "600 12px 'Hanken Grotesk'", color: '#5c463c', marginBottom: 3 }}>Service area</div>
                <div style={{ font: "600 14.5px 'Hanken Grotesk'", color: '#3a2820' }}>Greater Toronto Area — pickup &amp; local delivery</div>
              </div>
              <div>
                <div style={{ font: "600 12px 'Hanken Grotesk'", color: '#5c463c', marginBottom: 3 }}>Response time</div>
                <div style={{ font: "600 14.5px 'Hanken Grotesk'", color: '#3a2820' }}>Usually within 1–2 business days</div>
              </div>
            </div>
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #efe2d3', font: "500 12.5px 'Hanken Grotesk'", color: '#5c463c', lineHeight: 1.5 }}>
              For a full custom order, the <button onClick={goOrder} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, font: 'inherit', color: '#b4506d', fontWeight: 700 }}>order form</button> gets you a faster quote — this page is best for general questions.
            </div>
          </div>

          <NewsletterBox />
        </div>

        <div style={{ border: '1.5px solid #efe2d3', borderRadius: 20, background: '#fbf6f0', padding: '26px 24px', boxShadow: '0 14px 30px -24px rgba(58,40,32,.45)' }}>
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
      <h2 style={{ font: "400 20px 'Fraunces'", color: '#3a2820', margin: '0 0 4px' }}>Send a message</h2>
      <p style={{ font: "500 13px 'Hanken Grotesk'", color: '#5c463c', margin: '0 0 20px' }}>This form is still being wired up — for now, email is the fastest way to reach me.</p>

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
        <div style={{ marginTop: 16, background: '#efe2d3', border: '1.5px solid #e6d6c8', borderRadius: 14, padding: '13px 15px', font: "500 13px 'Hanken Grotesk'", color: '#5c463c', lineHeight: 1.55 }}>
          Thanks — this form isn't connected yet, so nothing was sent. Please email <a href={`mailto:${OWNER_EMAIL}`} style={{ color: '#3a2820', fontWeight: 700 }}>{OWNER_EMAIL}</a> directly and I'll get back to you.
        </div>
      )}

      <button type="submit" className="btn" disabled={!canSubmit} style={{ width: '100%', marginTop: 18 }}>Send message</button>
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
    <div style={{ background: '#3a2820', color: '#fbf6f0', borderRadius: 20, padding: '22px 22px' }}>
      <div style={{ font: "700 11px 'Hanken Grotesk'", letterSpacing: '.14em', textTransform: 'uppercase', color: '#e3d2c8', marginBottom: 8 }}>Stay in the loop</div>
      <p style={{ font: "500 13px 'Hanken Grotesk'", color: '#e3d2c8', lineHeight: 1.5, margin: '0 0 14px' }}>New gallery designs, seasonal flavours, and the occasional discount — no spam.</p>
      {subscribed ? (
        <div style={{ font: "700 13.5px 'Hanken Grotesk'", color: '#ecc3cf' }}>You're on the list ✓</div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@email.com"
            style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.2)', borderRadius: 10, padding: '10px 12px', font: "500 13.5px 'Hanken Grotesk'", color: '#fbf6f0' }}
          />
          <button type="submit" style={{ cursor: 'pointer', background: '#ecc3cf', border: 'none', color: '#3a2820', borderRadius: 10, padding: '10px 16px', font: "700 13px 'Hanken Grotesk'", flex: 'none' }}>Subscribe</button>
        </form>
      )}
    </div>
  );
}
