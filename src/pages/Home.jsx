import logo from '../assets/logo.png';
import logoBlack from '../assets/logo-black.svg';
import { getRecentPhotos } from '../gallery/loadGallery.js';
import Testimonials from '../components/Testimonials.jsx';

const steps = [
  { n: 1, title: 'Tell me the occasion', body: 'Theme, colours, date and quantity.' },
  { n: 2, title: 'Approve your proof', body: 'A design mock before anything bakes.' },
  { n: 3, title: 'Baked & decorated', body: 'Hand-iced fresh the week of.' },
  { n: 4, title: 'Pickup or delivery', body: 'GTA pickup or local delivery.' },
];

const recentPhotos = getRecentPhotos(3);

export default function Home({ goOrder, goGallery }) {
  return (
    <main>
      <section className="home-hero" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.05fr .95fr', alignItems: 'stretch', gap: 0 }}>
        <div className="page-pad" style={{ paddingTop: 70, paddingBottom: 74 }}>
          <div style={{ font: '600 12px \'Hanken Grotesk\'', letterSpacing: '.2em', textTransform: 'uppercase', color: '#a86a3e', marginBottom: 20 }}>Custom sugar cookies · GTA</div>
          <h1 className="hero-title" style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 60, lineHeight: .98, letterSpacing: '-.02em', margin: '0 0 22px' }}>
            Baked by hand,<br />iced with{' '}
            <span style={{ color: '#a86a3e', position: 'relative', display: 'inline-block' }}>
              heart.
              <span style={{ position: 'absolute', right: -30, top: -14, fontFamily: "'Caveat',cursive", fontSize: 30, color: '#e79ab4', animation: 'twinkle 2.4s ease-in-out infinite' }}>✿</span>
            </span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 420, color: '#6b524a', margin: '0 0 30px' }}>Hi, I'm Shelby. Every order is designed with you and decorated one cookie at a time — for showers, weddings, birthdays and branded corporate gifts.</p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="cta" onClick={goOrder} style={{ cursor: 'pointer', background: '#49331f', color: '#fbf4ee', border: 'none', borderRadius: 30, padding: '16px 28px', font: '700 15px \'Hanken Grotesk\'' }}>Start a custom order</button>
            <button onClick={goGallery} style={{ cursor: 'pointer', background: 'none', border: 'none', font: '600 15px \'Hanken Grotesk\'', color: '#4a352e', borderBottom: '2px solid #f5cad9', padding: '0 0 3px' }}>See the gallery →</button>
          </div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: 24, color: '#a86a3e', transform: 'rotate(-3deg)', marginTop: 34 }}>— can't wait to bake for you! ♥</div>
        </div>
        <div style={{ background: '#f5cad9', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflow: 'hidden' }}>
          <svg viewBox="0 0 40 400" preserveAspectRatio="none" style={{ position: 'absolute', left: -1, top: 0, height: '100%', width: 26 }}>
            <path d="M40,0 C10,20 10,40 25,50 C40,60 40,80 25,90 C10,100 10,120 25,130 C40,140 40,160 25,170 C10,180 10,200 25,210 C40,220 40,240 25,250 C10,260 10,280 25,290 C40,300 40,320 25,330 C10,340 10,360 25,370 C40,380 40,395 40,400 L0,400 L0,0 Z" fill="#fbf4ee" />
          </svg>
          <div style={{ position: 'absolute', top: 36, right: 44, fontSize: 26, animation: 'drift 5s ease-in-out infinite' }}>🌸</div>
          <div style={{ position: 'absolute', bottom: 54, left: 64, fontSize: 22, animation: 'drift 6s ease-in-out infinite .8s' }}>♥</div>
          <div style={{ position: 'absolute', bottom: 34, right: 70, fontSize: 18, color: '#fff', animation: 'twinkle 2.8s ease-in-out infinite .4s' }}>✦</div>
          <img src={logo} style={{ width: '74%', filter: 'drop-shadow(0 16px 30px rgba(73,51,31,.24))', animation: 'floatyslow 6s ease-in-out infinite' }} alt="Shelby's Cookie Co." />
        </div>
      </section>

      <section className="page-pad" style={{ paddingTop: 64, paddingBottom: 56, background: '#f7ece4' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 36, margin: '0 0 6px', textAlign: 'center' }}>How custom ordering works</h2>
          <p style={{ textAlign: 'center', color: '#8a6f63', fontSize: 15.5, margin: '0 0 38px' }}>Four warm little steps from idea to doorstep.</p>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {steps.map((s) => (
              <div key={s.n} className="lift" style={{ position: 'relative', overflow: 'hidden', background: '#fff', borderRadius: 22, padding: '26px 22px', boxShadow: '0 12px 26px -18px rgba(74,53,46,.5)' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#f9dbe3', color: '#a86a3e', font: "800 18px 'Bricolage Grotesque'", display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 15 }}>{s.n}</div>
                  <div style={{ font: "700 15.5px 'Hanken Grotesk'", marginBottom: 5 }}>{s.title}</div>
                  <p style={{ fontSize: 13, color: '#8a6f63', lineHeight: 1.55, margin: 0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-pad" style={{ paddingTop: 60, paddingBottom: 64 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 32, margin: 0 }}>Recently out of the oven</h2>
            <button onClick={goGallery} style={{ cursor: 'pointer', background: 'none', border: 'none', font: "600 14px 'Hanken Grotesk'", color: '#a86a3e' }}>Full gallery →</button>
          </div>
          <div className="recent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {recentPhotos.map((photo) => (
              <div key={photo.id} className="gcard" onClick={goGallery} style={{ cursor: 'pointer', aspectRatio: '1', borderRadius: 24, overflow: 'hidden', position: 'relative', background: '#f3e6de', boxShadow: '0 12px 26px -20px rgba(74,53,46,.5)' }}>
                <img src={photo.src} alt={photo.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <span style={{ position: 'absolute', left: 14, bottom: 14, font: "600 10px ui-monospace,Menlo,monospace", color: '#a89482', background: '#fbf4ee', padding: '5px 8px', borderRadius: 6 }}>{photo.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="page-pad" style={{ position: 'relative', background: '#49331f', color: '#fbf4ee', paddingTop: 66, paddingBottom: 62, textAlign: 'center', marginTop: 8 }}>
        <svg viewBox="0 0 1200 24" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: -1, width: '100%', height: 22 }}>
          <path d="M0,0 C40,24 80,24 120,12 C160,0 200,0 240,12 C280,24 320,24 360,12 C400,0 440,0 480,12 C520,24 560,24 600,12 C640,0 680,0 720,12 C760,24 800,24 840,12 C880,0 920,0 960,12 C1000,24 1040,24 1080,12 C1120,0 1160,0 1200,12 L1200,0 Z" fill="#f7ece4" />
        </svg>
        <div style={{ width: 56, height: 50, margin: '8px auto 18px', background: '#f5cad9', WebkitMask: `url(${logoBlack}) center/contain no-repeat`, mask: `url(${logoBlack}) center/contain no-repeat`, animation: 'floaty 4s ease-in-out infinite' }} />
        <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 42, margin: '0 0 10px' }}>Ready when you are.</h2>
        <p style={{ color: '#e6c3ce', fontSize: 16.5, margin: '0 0 28px' }}>Tell me about your event and I'll take it from there.</p>
        <button className="cta" onClick={goOrder} style={{ cursor: 'pointer', background: '#f5cad9', color: '#49331f', border: 'none', borderRadius: 30, padding: '16px 32px', font: "700 15px 'Hanken Grotesk'" }}>Start a custom order</button>
      </section>
    </main>
  );
}
