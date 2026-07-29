import { useState } from 'react';
import logo from '../assets/logo.png';

export default function Nav({ view, goHome, goGallery, goOrder, goCorporate, goContact }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const underline = (
    <span style={{ position: 'absolute', left: 0, right: 0, bottom: -6, height: 2.5, background: '#a86a3e', borderRadius: 2 }} />
  );

  const go = (fn) => () => { setMenuOpen(false); fn(); };

  const links = (
    <>
      <button className="navlink" onClick={go(goHome)}>Home{view === 'home' && underline}</button>
      <button className="navlink" onClick={go(goGallery)}>Gallery{view === 'gallery' && underline}</button>
      <button className="navlink" onClick={go(goOrder)}>Custom Orders{view === 'order' && underline}</button>
      <button className="navlink" onClick={go(goCorporate)}>Corporate{view === 'corporate' && underline}</button>
      <button className="navlink" onClick={go(goContact)}>Contact{view === 'contact' && underline}</button>
    </>
  );

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(251,244,238,.86)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(74,53,46,.08)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 34px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <button onClick={go(goHome)} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
          <img src={logo} alt="Shelby's Cookie Co." style={{ height: 40 }} />
          <span style={{ font: '800 17px \'Bricolage Grotesque\'', color: '#49331f' }}>Shelby's Cookie Co.</span>
        </button>

        <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          {links}
          <button className="cta" onClick={go(goOrder)} style={{ cursor: 'pointer', background: '#49331f', color: '#fbf4ee', border: 'none', borderRadius: 30, padding: '10px 20px', font: '700 13.5px \'Hanken Grotesk\'' }}>Start an order</button>
        </nav>

        <button
          className="nav-burger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          style={{ display: 'none', cursor: 'pointer', background: 'none', border: 'none', width: 34, height: 34, position: 'relative' }}
        >
          <span style={{ position: 'absolute', left: 6, right: 6, top: menuOpen ? 16 : 11, height: 2.5, background: '#49331f', borderRadius: 2, transition: 'all .2s ease', transform: menuOpen ? 'rotate(45deg)' : 'none' }} />
          <span style={{ position: 'absolute', left: 6, right: 6, top: 16, height: 2.5, background: '#49331f', borderRadius: 2, transition: 'opacity .2s ease', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ position: 'absolute', left: 6, right: 6, top: menuOpen ? 16 : 21, height: 2.5, background: '#49331f', borderRadius: 2, transition: 'all .2s ease', transform: menuOpen ? 'rotate(-45deg)' : 'none' }} />
        </button>
      </div>

      {menuOpen && (
        <nav className="nav-mobile-panel" style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 34px 20px', borderTop: '1px solid rgba(74,53,46,.08)' }}>
          {links}
          <button className="cta" onClick={go(goOrder)} style={{ marginTop: 10, cursor: 'pointer', background: '#49331f', color: '#fbf4ee', border: 'none', borderRadius: 30, padding: '12px 20px', font: '700 13.5px \'Hanken Grotesk\'' }}>Start an order</button>
        </nav>
      )}
    </header>
  );
}
