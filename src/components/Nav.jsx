import { useState } from 'react';
import logo from '../assets/logo.png';

// Order matches the A2 design: Gallery · Custom Orders · Corporate · About · Contact.
const LINKS = [
  { view: 'gallery', label: 'Gallery' },
  { view: 'order', label: 'Custom Orders' },
  { view: 'corporate', label: 'Corporate' },
  { view: 'about', label: 'About' },
  { view: 'contact', label: 'Contact' },
];

export default function Nav({ view, go }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = (v) => () => { setMenuOpen(false); go(v); };

  const links = LINKS.map((l) => (
    <button key={l.view} type="button" className={'navlink' + (view === l.view ? ' active' : '')} aria-current={view === l.view ? 'page' : undefined} onClick={nav(l.view)}>{l.label}</button>
  ));

  return (
    <header style={{ background: '#fbf6f0', position: 'relative', zIndex: 50 }}>
      <div className="nav" style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <button type="button" onClick={nav('home')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: 'none', border: 'none', padding: 0, color: 'inherit' }}>
          <img src={logo} alt="" style={{ height: 40 }} />
          <span className="serif" style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-.01em' }}>Shelby's Cookie Co.</span>
        </button>

        <nav className="nav-links" aria-label="Main" style={{ alignItems: 'center', gap: 30 }}>{links}</nav>

        <button type="button" className="btn nav-cta" onClick={nav('order')} style={{ padding: '11px 22px', fontSize: 14 }}>Start an order</button>

        <button
          type="button"
          className="nav-burger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          style={{ cursor: 'pointer', background: 'none', border: 'none', width: 34, height: 34, position: 'relative' }}
        >
          <span style={{ position: 'absolute', left: 6, right: 6, top: menuOpen ? 16 : 11, height: 2.5, background: '#3a2820', borderRadius: 2, transition: 'all .2s ease', transform: menuOpen ? 'rotate(45deg)' : 'none' }} />
          <span style={{ position: 'absolute', left: 6, right: 6, top: 16, height: 2.5, background: '#3a2820', borderRadius: 2, transition: 'opacity .2s ease', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ position: 'absolute', left: 6, right: 6, top: menuOpen ? 16 : 21, height: 2.5, background: '#3a2820', borderRadius: 2, transition: 'all .2s ease', transform: menuOpen ? 'rotate(-45deg)' : 'none' }} />
        </button>
      </div>

      {menuOpen && (
        <nav className="nav nav-mobile-panel" aria-label="Mobile" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 14, padding: '6px 40px 22px' }}>
          {links}
          <button type="button" className="btn" onClick={nav('order')} style={{ marginTop: 6, padding: '12px 24px', fontSize: 14 }}>Start an order</button>
        </nav>
      )}
      <div className="beads" aria-hidden="true" style={{ color: '#ecc3cf' }} />
    </header>
  );
}
