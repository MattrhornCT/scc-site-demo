import logo from '../assets/logo.png';

export default function Footer({ goHome, goGallery, goOrder, goCorporate, goContact }) {
  const linkStyle = { textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', color: '#c9b3a6', font: '600 13.5px \'Hanken Grotesk\'', padding: 0 };
  return (
    <footer className="page-pad" style={{ background: '#35241a', color: '#c9b3a6', paddingTop: 44, paddingBottom: 34 }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 34, justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ maxWidth: 300 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <img src={logo} alt="Shelby's Cookie Co." style={{ height: 36 }} />
            <span style={{ font: '800 16px \'Bricolage Grotesque\'', color: '#fbf4ee' }}>Shelby's Cookie Co.</span>
          </div>
          <p style={{ font: '500 13px \'Hanken Grotesk\'', lineHeight: 1.6, margin: 0 }}>Hand-made, hand-iced custom sugar cookies for the moments worth remembering.</p>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: 22, color: '#e79ab4', transform: 'rotate(-3deg)', marginTop: 14 }}>baked with love ♥</div>
        </div>
        <div style={{ display: 'flex', gap: 52, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ font: '700 11px \'Hanken Grotesk\'', letterSpacing: '.14em', textTransform: 'uppercase', color: '#8a6f5f', marginBottom: 2 }}>Explore</span>
            <button onClick={goHome} style={linkStyle}>Home</button>
            <button onClick={goGallery} style={linkStyle}>Gallery</button>
            <button onClick={goOrder} style={linkStyle}>Custom Orders</button>
            <button onClick={goCorporate} style={linkStyle}>Corporate Gifting</button>
            <button onClick={goContact} style={linkStyle}>Contact</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ font: '700 11px \'Hanken Grotesk\'', letterSpacing: '.14em', textTransform: 'uppercase', color: '#8a6f5f', marginBottom: 2 }}>Say hello</span>
            <a href="mailto:hello@shelbyscookieco.ca" style={{ color: '#c9b3a6', font: '600 13.5px \'Hanken Grotesk\'' }}>hello@shelbyscookieco.ca</a>
            <span style={{ font: '600 13.5px \'Hanken Grotesk\'', color: '#c9b3a6' }}>Greater Toronto Area</span>
            <span style={{ font: '500 12.5px \'Hanken Grotesk\'', color: '#8a6f5f' }}>Pickup &amp; local delivery</span>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: '26px auto 0', paddingTop: 18, borderTop: '1px solid rgba(255,255,255,.09)', font: '500 12px \'Hanken Grotesk\'', color: '#8a6f5f' }}>© 2026 Shelby's Cookie Co. · Made in the GTA</div>
    </footer>
  );
}
