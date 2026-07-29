import { TESTIMONIALS } from '../data/testimonials.js';
import { CLIENT_LOGOS } from '../data/clientLogos.js';

export default function Testimonials() {
  return (
    <section className="page-pad" style={{ paddingTop: 60, paddingBottom: 64, background: '#f7ece4' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 36, margin: '0 0 6px', textAlign: 'center' }}>What people are saying</h2>
        <p style={{ textAlign: 'center', color: '#8a6f63', fontSize: 15.5, margin: '0 0 38px' }}>A few notes from past orders.</p>
        <div className="testimonial-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="lift" style={{ background: '#fff', borderRadius: 22, padding: '24px 22px', boxShadow: '0 12px 26px -18px rgba(74,53,46,.5)' }}>
              <div style={{ fontSize: 20, color: '#e79ab4', marginBottom: 10 }}>“</div>
              <p style={{ font: "500 14px 'Hanken Grotesk'", color: '#6b524a', lineHeight: 1.6, margin: '0 0 16px' }}>{t.quote}</p>
              <div style={{ font: "700 13px 'Hanken Grotesk'", color: '#49331f' }}>{t.name}</div>
              <div style={{ font: "600 11.5px 'Hanken Grotesk'", color: '#a86a3e', letterSpacing: '.03em' }}>{t.tag}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 46, textAlign: 'center' }}>
          <div style={{ font: "700 11px 'Hanken Grotesk'", letterSpacing: '.14em', textTransform: 'uppercase', color: '#a8917f', marginBottom: 16 }}>Trusted by teams at</div>
          <div className="logo-strip" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            {CLIENT_LOGOS.map((name) => (
              <span key={name} style={{ font: "700 14px 'Bricolage Grotesque'", color: '#b9a596', background: '#fff', border: '1.5px solid #efe4d9', borderRadius: 10, padding: '10px 18px' }}>{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
