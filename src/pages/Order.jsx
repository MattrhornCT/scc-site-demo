import OrderForm from '../components/OrderForm.jsx';

export default function Order() {
  return (
    <main>
      <section style={{ textAlign: 'center', padding: '50px 34px 26px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '8%', top: 30, fontSize: 22, opacity: .7, animation: 'drift 6s ease-in-out infinite' }}>🌸</div>
        <div style={{ position: 'absolute', right: '10%', top: 56, fontSize: 18, color: '#e79ab4', animation: 'twinkle 2.6s ease-in-out infinite' }}>✦</div>
        <div style={{ display: 'inline-block', background: '#f9dbe3', color: '#96566b', border: '1.5px dashed #d98da8', borderRadius: 30, padding: '6px 15px', font: "700 11.5px 'Hanken Grotesk'", letterSpacing: '.05em', transform: 'rotate(-1.5deg)', marginBottom: 16 }}>✿ Custom orders open</div>
        <h1 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 46, letterSpacing: '-.02em', margin: '0 0 10px' }}>Let's build your order</h1>
        <p style={{ color: '#8a6f63', fontSize: 16, margin: '0 auto 20px', maxWidth: 480 }}>Pick a treat, make it yours, and I'll follow up with a proof and final quote — no payment now.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ background: '#f7ece4', borderRadius: 30, padding: '8px 15px', font: "600 12.5px 'Hanken Grotesk'", color: '#6b524a' }}>✓ Proof before I bake</span>
          <span style={{ background: '#f7ece4', borderRadius: 30, padding: '8px 15px', font: "600 12.5px 'Hanken Grotesk'", color: '#6b524a' }}>✓ GTA pickup &amp; delivery</span>
          <span style={{ background: '#f7ece4', borderRadius: 30, padding: '8px 15px', font: "600 12.5px 'Hanken Grotesk'", color: '#6b524a' }}>✓ Hand-iced fresh</span>
        </div>
      </section>
      <section style={{ maxWidth: 1040, margin: '0 auto', padding: '12px 24px 72px' }}>
        <div style={{ border: '1.5px solid #efe4d9', borderRadius: 26, overflow: 'hidden', boxShadow: '0 30px 70px -40px rgba(74,53,46,.55)', background: '#fbf4ee' }}>
          <OrderForm />
        </div>
      </section>
    </main>
  );
}
