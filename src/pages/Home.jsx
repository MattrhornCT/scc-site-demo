import { useState } from 'react';
import logo from '../assets/logo.png';
import whisk from '../assets/photos/shelby-whisk-bowl.jpg';
import portrait from '../assets/photos/shelby-portrait-cookie.jpg';
import toolsHand from '../assets/photos/shelby-tools-hand.jpg';
import holdingLogo from '../assets/photos/shelby-holding-logo-cookies.jpg';
import { getRecentPhotos, getPhotosMatching, getRandomPhotos } from '../gallery/loadGallery.js';
import { CLIENT_LOGOS } from '../data/clientLogos.js';
import Testimonials from '../components/Testimonials.jsx';
import PolaroidFlip from '../components/PolaroidFlip.jsx';

const recentPhotos = getRecentPhotos(4);
const corporatePhotos = (() => {
  const c = getPhotosMatching(['corporate'], 2);
  return c.length ? c : getRecentPhotos(2);
})();

const TILE_STYLES = [
  { bg: '#ecc3cf', arch: true, mt: 0 },
  { bg: '#f6dde3', arch: false, mt: 32 },
  { bg: '#efe2d3', arch: true, mt: 0 },
  { bg: '#f6dde3', arch: false, mt: 32 },
];

const STEPS = [
  { n: 'i.', title: 'Tell me the occasion', body: 'Theme, colours, date and quantity.', bg: '#fbf6f0', numColor: '#b4506d', stroke: '#b4506d', op: .32, fg: '#3a2820', sub: '#5c463c',
    icon: <><rect x="3" y="8.5" width="18" height="12.5" rx="1.5" /><line x1="3" y1="12.5" x2="21" y2="12.5" /><line x1="12" y1="8.5" x2="12" y2="21" /><path d="M12 8.5 C12 4 7.5 4 7.5 6.5 C7.5 8.5 12 8.5 12 8.5Z" /><path d="M12 8.5 C12 4 16.5 4 16.5 6.5 C16.5 8.5 12 8.5 12 8.5Z" /></> },
  { n: 'ii.', title: 'Approve your proof', body: 'A design mock before anything bakes.', bg: '#f6dde3', numColor: '#8a3550', stroke: '#a0603f', op: .32, fg: '#3a2820', sub: '#5c463c',
    icon: <><rect x="5" y="4" width="14" height="17" rx="2" /><rect x="9" y="2.5" width="6" height="3" rx="1" /><path d="M8.4 12.2 l2.3 2.3 L16 9" /></> },
  { n: 'iii.', title: 'Baked & decorated', body: 'Hand-iced fresh the week of.', bg: '#ecc3cf', numColor: '#8a3550', stroke: '#8a3550', op: .32, fg: '#3a2820', sub: '#5c463c',
    icon: <><circle cx="12" cy="12" r="9" /><circle cx="9" cy="9.4" r="1.1" /><circle cx="15.2" cy="10" r="1.1" /><circle cx="10.3" cy="14.6" r="1.1" /><circle cx="14.6" cy="15" r="1.1" /></> },
  { n: 'iv.', title: 'Pickup or delivery', body: 'GTA pickup or local delivery.', bg: '#3a2820', numColor: '#e7aabd', stroke: '#e7aabd', op: .45, fg: '#fbf6f0', sub: '#e3d2c8',
    icon: <><path d="M12 21.5 C12 21.5 19 14.5 19 9 A7 7 0 1 0 5 9 C5 14.5 12 21.5 12 21.5Z" /><circle cx="12" cy="9" r="2.6" /></> },
];

const titleCase = (s) => s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());

export default function Home({ go }) {
  const [polaroidPhotos] = useState(() => getRandomPhotos(5));
  const [swapped, setSwapped] = useState(false);
  const hoverOn = (e) => { if (!e.pointerType || e.pointerType === 'mouse') setSwapped(true); };

  return (
    <main>
      {/* HERO */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '60px 40px 70px' }}>
        <div className="hero" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,.9fr)', gap: 56, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#f6dde3', color: '#8a3550', borderRadius: 999, padding: '8px 16px', marginBottom: 28 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#b4506d' }} />
              <span className="kicker" style={{ letterSpacing: '.16em' }}>Custom sugar cookies · GTA</span>
            </div>
            <h1 className="serif h1" style={{ fontSize: 90, lineHeight: .95, fontWeight: 400, letterSpacing: '-.035em', margin: '0 0 30px' }}>
              Baked by hand,<br />
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <em style={{ fontWeight: 300, color: '#b4506d' }}>iced with heart.</em>
                <svg aria-hidden="true" viewBox="0 0 400 30" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: -16, width: '100%', height: 22, overflow: 'visible' }}>
                  <path className="pipe" d="M4,18 C40,4 70,28 105,15 S170,4 205,16 S270,28 305,14 S370,6 396,16" fill="none" stroke="#e7aabd" strokeWidth="7" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.65, maxWidth: 460, color: '#5c463c', margin: '0 0 36px' }}>Hi, I'm Shelby. Every order is designed with you and decorated one cookie at a time — for showers, weddings, birthdays and branded corporate gifts.</p>
            <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="button" className="btn" onClick={() => go('order')} onPointerEnter={hoverOn} onPointerLeave={() => setSwapped(false)} onFocus={() => setSwapped(true)} onBlur={() => setSwapped(false)}>Start a custom order</button>
              <button type="button" className="link" onClick={() => go('gallery')}>Browse the gallery</button>
            </div>
          </div>

          <div className={`hero-art${swapped ? ' swapped' : ''}`} style={{ position: 'relative' }}>
            <div className="art-layer" style={{ position: 'relative', padding: '20px 30px 70px 46px' }}>
            <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 6, bottom: 54, left: 66, borderRadius: '400px 400px 22px 22px', border: '1.5px solid #3a2820' }} />
            <div className="zoom" style={{ position: 'relative', borderRadius: '400px 400px 18px 18px', aspectRatio: '4/5.2', background: '#f2d7dd', boxShadow: '0 30px 60px -30px rgba(58,40,32,.55)' }}>
              <img src={whisk} alt="Shelby whisking icing in a pearl mixing bowl" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%', display: 'block' }} />
            </div>
            {/* spinning badge */}
            <div style={{ position: 'absolute', right: -6, top: '38%', width: 128, height: 128, borderRadius: '50%', background: '#3a2820', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 30px -14px rgba(58,40,32,.7)' }}>
              <svg className="badge" viewBox="0 0 200 200" role="img" aria-label="Hand-iced in the GTA, made to order" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <defs><path id="a2c" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" /></defs>
                <text style={{ font: "700 17px 'Hanken Grotesk'", letterSpacing: '3.4px', fill: '#fbf6f0' }}><textPath href="#a2c">HAND-ICED IN THE GTA ✦ MADE TO ORDER ✦</textPath></text>
              </svg>
              <img src={logo} alt="" style={{ width: '46%', position: 'relative' }} />
            </div>
            <PolaroidFlip photos={polaroidPhotos} />
            <div className="hand note" style={{ position: 'absolute', left: -74, top: 24, fontSize: 26, color: '#5c463c', transform: 'rotate(-8deg)' }}>that's me!
              <svg aria-hidden="true" viewBox="0 0 70 40" style={{ display: 'block', width: 64, margin: '2px 0 0 40px' }}><path d="M4,6 C30,4 50,14 60,32 M60,32 L48,28 M60,32 L62,20" fill="none" stroke="#5c463c" strokeWidth="2.2" strokeLinecap="round" /></svg>
            </div>
            </div>
            <div className="hero-steps" aria-hidden={!swapped}>
            <div className="hs-head"><span className="kicker" style={{ color: '#8a3550' }}>Custom orders</span><h2 className="serif" style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-.03em', lineHeight: 1, margin: '8px 0 0' }}>How it <em style={{ fontWeight: 300, color: '#b4506d' }}>works</em></h2></div>
            <ol className="hs-grid">
              {STEPS.map((st, i) => (
                <li key={st.n} className="step" style={{ '--i': i, background: st.bg, color: st.fg, borderRadius: 24, padding: '30px 30px 28px', boxShadow: '0 24px 40px -28px rgba(58,40,32,.5)' }}>
                  <span className="serif" style={{ display: 'block', fontSize: 54, fontStyle: 'italic', fontWeight: 300, color: st.numColor, lineHeight: 1, marginBottom: 12 }}>{st.n}</span>
                  <span style={{ display: 'block', font: "700 21px 'Hanken Grotesk'", marginBottom: 8 }}>{st.title}</span>
                  <p style={{ margin: 0, color: st.sub, lineHeight: 1.55, fontSize: 16, maxWidth: 220 }}>{st.body}</p>
                  <svg className="wm" aria-hidden="true" viewBox="0 0 24 24" style={{ stroke: st.stroke, opacity: st.op, width: 150, height: 150 }}>{st.icon}</svg>
                </li>
              ))}
            </ol>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px' }}><div className="beads" aria-hidden="true" style={{ color: '#ecc3cf' }} /></div>

      {/* RECENT WORK */}
      {recentPhotos.length > 0 && (
        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '72px 40px 80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 30 }}>
            <div>
              <div className="kicker" style={{ color: '#b4506d', marginBottom: 14 }}>Recent work</div>
              <h2 className="serif h2" style={{ fontSize: 48, fontWeight: 400, letterSpacing: '-.03em', lineHeight: 1, margin: 0 }}>Fresh out of <em style={{ fontWeight: 300, color: '#b4506d' }}>the oven</em></h2>
            </div>
            <button type="button" className="link" onClick={() => go('gallery')}>See the full gallery →</button>
          </div>
          <div className="grid4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 22, alignItems: 'start' }}>
            {recentPhotos.map((p, i) => {
              const s = TILE_STYLES[i % TILE_STYLES.length];
              return (
                <button type="button" key={p.id} className="gcard tile" onClick={() => go('gallery')} aria-label={`${p.label} — open gallery`} style={{ marginTop: s.mt }}>
                  <div style={{ background: s.bg, borderRadius: s.arch ? '200px 200px 12px 12px' : 12, padding: '16px 16px 0', overflow: 'hidden' }}>
                    <img className="ph" src={p.src} alt={p.label} style={{ width: '100%', aspectRatio: '1/1.05', objectFit: 'cover', display: 'block', borderRadius: s.arch ? '180px 180px 0 0' : '6px 6px 0 0' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginTop: 14 }}>
                    <span className="serif" style={{ fontSize: 19 }}>{p.label}</span>
                    {p.occasion && <span style={{ font: "600 12px 'Hanken Grotesk'", background: '#f6dde3', color: '#8a3550', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>{titleCase(p.occasion)}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <Testimonials />

      {/* ABOUT */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '110px 40px 100px' }}>
        <div className="two" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 72, alignItems: 'center' }}>
          <div>
            <div className="kicker" style={{ color: '#b4506d', marginBottom: 14 }}>The baker</div>
            <h2 className="serif" style={{ fontSize: 58, fontWeight: 400, letterSpacing: '-.03em', lineHeight: 1, margin: '0 0 26px' }}>Meet <em style={{ fontWeight: 300, color: '#b4506d' }}>Shelby</em></h2>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: '#5c463c', margin: '0 0 18px' }}>Every cookie starts as a conversation — your theme, your colours, the little details that make the day yours. I sketch a proof, you approve it, and then I bake and hand-ice each one in small batches.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', marginTop: 8 }}>
              <div className="hand" style={{ fontSize: 42, color: '#b4506d', transform: 'rotate(-2deg)', display: 'inline-block' }}>— Shelby ♥</div>
              <button type="button" className="link" onClick={() => go('about')}>Read my story →</button>
            </div>
          </div>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 18, alignItems: 'end' }}>
            <div aria-hidden="true" style={{ position: 'absolute', left: -26, top: -26, width: 150, height: 150, borderRadius: '50%', background: '#f6dde3', zIndex: 0 }} />
            <div className="zoom" style={{ position: 'relative', borderRadius: '300px 300px 12px 12px' }}><img src={portrait} alt="Shelby smiling and holding a Shelby's Cookie Co heart cookie" style={{ width: '100%', aspectRatio: '3/4.4', objectFit: 'cover', display: 'block' }} /></div>
            <div style={{ position: 'relative', marginBottom: 48 }}>
              <div className="zoom" style={{ borderRadius: 12, border: '8px solid #efe2d3' }}><img src={toolsHand} alt="Piping bags, a heart cutter and a pink whisk in hand" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block', borderRadius: 4 }} /></div>
              <div className="hand" style={{ position: 'absolute', bottom: -40, right: 0, fontSize: 22, color: '#5c463c', transform: 'rotate(-4deg)' }}>the essentials ↑</div>
            </div>
          </div>
        </div>
      </section>

      {/* CORPORATE */}
      <section style={{ background: '#3a2820', color: '#fbf6f0', padding: '96px 40px' }}>
        <div className="two" style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: corporatePhotos.length ? 'minmax(0,1fr) minmax(0,1fr)' : 'minmax(0,1fr)', gap: 64, alignItems: 'center' }}>
          <div>
            <div className="kicker" style={{ color: '#e7aabd', marginBottom: 14 }}>For teams</div>
            <h2 className="serif" style={{ fontSize: 54, fontWeight: 400, letterSpacing: '-.03em', lineHeight: 1.02, margin: '0 0 22px' }}>Your logo, <em style={{ fontWeight: 300, color: '#efe2d3' }}>iced by hand.</em></h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: '#e3d2c8', margin: '0 0 30px', maxWidth: 460 }}>Branded cookies for launches, client gifts and closing boxes — matched to your colours and packaged to impress.</p>
            <button type="button" className="btn btn-cream" onClick={() => go('corporate')}>Corporate gifting →</button>
            <div className="kicker" style={{ marginTop: 44, fontSize: 11, color: '#b9a296' }}>Trusted by teams at</div>
            <div className="serif" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 30px', marginTop: 14, fontSize: 20, fontStyle: 'italic', color: '#e3d2c8' }}>
              {CLIENT_LOGOS.map((name, i) => <span key={i}>{name}</span>)}
            </div>
          </div>
          {corporatePhotos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
              <div className="zoom" style={{ borderRadius: 12, border: '8px solid #efe2d3' }}><img src={corporatePhotos[0].srcLarge} alt={corporatePhotos[0].label} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block', borderRadius: 4 }} /></div>
              {corporatePhotos[1] && <div className="zoom" style={{ borderRadius: '300px 300px 12px 12px', marginTop: 44, border: '8px solid #ecc3cf' }}><img src={corporatePhotos[1].srcLarge} alt={corporatePhotos[1].label} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} /></div>}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS + CTA */}
      <section style={{ background: '#efe2d3', position: 'relative', overflow: 'hidden' }}>
        <div className="beads" aria-hidden="true" style={{ color: '#b4506d', opacity: .55, position: 'absolute', top: 16, left: 0, right: 0 }} />
        <div className="two" style={{ maxWidth: 1240, margin: '0 auto', padding: '96px 40px 90px', display: 'grid', gridTemplateColumns: 'minmax(0,.85fr) minmax(0,1.15fr)', gap: 64, alignItems: 'stretch', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 28 }}>
            <div className="kicker" style={{ color: '#8a3550' }}>Custom orders</div>
            <div>
              <h2 className="serif h2" style={{ fontSize: 66, fontWeight: 400, letterSpacing: '-.035em', lineHeight: 1, margin: '0 0 20px' }}>Ready<br /><em style={{ fontWeight: 300, color: '#b4506d', whiteSpace: 'nowrap' }}>when you are.</em></h2>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: '#5c463c', margin: 0, maxWidth: 400 }}>Tell me about your event and I'll take it from there — four easy steps from idea to doorstep.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <button type="button" className="btn" onClick={() => go('order')}>Start a custom order</button>
              <img className="pop" src={holdingLogo} alt="Shelby holding out two heart logo cookies" style={{ width: 62, height: 62, objectFit: 'cover', borderRadius: '50%', border: '4px solid #fbf6f0', display: 'block', boxShadow: '0 10px 20px -10px rgba(58,40,32,.6)' }} />
              <span className="hand" style={{ fontSize: 24, color: '#8a3550', transform: 'rotate(-3deg)', lineHeight: 1 }}>can't wait to<br />bake for you!</span>
            </div>
          </div>
          <div>
            <div className="kicker" style={{ color: '#8a3550', marginBottom: 16 }}>How it works</div>
            <ol className="steps-ol" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14 }}>
              {STEPS.map((s) => (
                <li key={s.n} className="lift step" style={{ background: s.bg, color: s.fg, borderRadius: 20, padding: '22px 24px 24px', minHeight: 150 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                    <span className="serif" style={{ fontSize: 30, fontStyle: 'italic', fontWeight: 300, color: s.numColor, lineHeight: 1 }}>{s.n}</span>
                    <span style={{ font: "700 16.5px 'Hanken Grotesk'" }}>{s.title}</span>
                  </div>
                  <p style={{ margin: 0, color: s.sub, lineHeight: 1.55, fontSize: 14.5, maxWidth: 200 }}>{s.body}</p>
                  <svg className="wm" aria-hidden="true" viewBox="0 0 24 24" style={{ stroke: s.stroke, opacity: s.op }}>{s.icon}</svg>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
