export default function Footer({ go }) {
  const linkStyle = { cursor: 'pointer', background: 'none', border: 'none', color: '#e3d2c8', font: '600 14px \'Hanken Grotesk\'', padding: 0 };
  return (
    <footer style={{ background: '#3a2820', color: '#e3d2c8', padding: '36px 40px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, fontSize: 14, alignItems: 'center' }}>
        <span className="serif" style={{ fontSize: 19, color: '#fbf6f0' }}>Shelby's Cookie Co.</span>
        <span style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => go('gallery')} style={linkStyle}>Gallery</button>
          <button type="button" onClick={() => go('order')} style={linkStyle}>Custom Orders</button>
          <button type="button" onClick={() => go('corporate')} style={linkStyle}>Corporate</button>
          <button type="button" onClick={() => go('about')} style={linkStyle}>About</button>
          <button type="button" onClick={() => go('contact')} style={linkStyle}>Contact</button>
        </span>
        <span><a href="mailto:hello@shelbyscookieco.ca" style={{ textDecoration: 'none' }}>hello@shelbyscookieco.ca</a> · Greater Toronto Area · Pickup &amp; local delivery</span>
        <span>© 2026</span>
      </div>
    </footer>
  );
}
