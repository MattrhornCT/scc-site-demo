import logo from '../assets/logo.png';

export default function Nav({ view, goHome, goGallery, goOrder }) {
  const underline = (
    <span style={{ position: 'absolute', left: 0, right: 0, bottom: -6, height: 2.5, background: '#a86a3e', borderRadius: 2 }} />
  );

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(251,244,238,.86)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(74,53,46,.08)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 34px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
          <img src={logo} alt="Shelby's Cookie Co." style={{ height: 40 }} />
          <span style={{ font: '800 17px \'Bricolage Grotesque\'', color: '#49331f' }}>Shelby's Cookie Co.</span>
        </button>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          <button className="navlink" onClick={goHome}>Home{view === 'home' && underline}</button>
          <button className="navlink" onClick={goGallery}>Gallery{view === 'gallery' && underline}</button>
          <button className="navlink" onClick={goOrder}>Custom Orders{view === 'order' && underline}</button>
          <a className="navlink" href="mailto:hello@shelbyscookieco.ca" style={{ color: '#4a352e' }}>Contact</a>
          <button className="cta" onClick={goOrder} style={{ cursor: 'pointer', background: '#49331f', color: '#fbf4ee', border: 'none', borderRadius: 30, padding: '10px 20px', font: '700 13.5px \'Hanken Grotesk\'' }}>Start an order</button>
        </nav>
      </div>
    </header>
  );
}
