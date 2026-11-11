import OrderForm from '../components/OrderForm.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function Order() {
  usePageMeta("Custom Orders — Shelby's Cookie Co.", 'Build a custom cookie order — pick your treats, see a running estimate, and get a proof and final quote. No payment now.');
  return (
    <main>
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '64px 40px 34px', textAlign: 'center' }}>
        <div className="kicker" style={{ color: '#b4506d', marginBottom: 16 }}>Custom orders open</div>
        <h1 className="serif h1" style={{ fontSize: 72, fontWeight: 400, letterSpacing: '-.035em', lineHeight: 1, margin: '0 0 18px' }}>Let's build <em style={{ fontWeight: 300, color: '#b4506d' }}>your order</em></h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: '#5c463c', maxWidth: 520, margin: '0 auto 26px' }}>Pick a treat, make it yours, and I'll follow up with a proof and final quote — no payment now.</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
          <li style={{ background: '#f6dde3', color: '#8a3550', borderRadius: 999, padding: '8px 16px', font: "600 13.5px 'Hanken Grotesk'" }}>✓ Proof before I bake</li>
          <li style={{ background: '#efe2d3', color: '#5c463c', borderRadius: 999, padding: '8px 16px', font: "600 13.5px 'Hanken Grotesk'" }}>✓ GTA pickup &amp; delivery</li>
          <li style={{ background: '#f6dde3', color: '#8a3550', borderRadius: 999, padding: '8px 16px', font: "600 13.5px 'Hanken Grotesk'" }}>✓ Hand-iced fresh</li>
        </ul>
      </section>
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '10px 40px 100px' }}>
        <div className="order-shell" style={{ background: '#efe2d3', borderRadius: 28, padding: 36, position: 'relative', overflow: 'hidden' }}>
          <OrderForm />
        </div>
      </section>
    </main>
  );
}
