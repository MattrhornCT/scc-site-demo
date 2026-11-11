import portrait from '../assets/photos/shelby-portrait-cookie.jpg';
import whisk from '../assets/photos/shelby-whisk-bowl.jpg';
import crossedTools from '../assets/photos/shelby-crossed-tools.jpg';
import heartCutter from '../assets/photos/shelby-heart-cutter.jpg';
import toolsHand from '../assets/photos/shelby-tools-hand.jpg';
import holdingLogo from '../assets/photos/shelby-holding-logo-cookies.jpg';
import { usePageMeta } from '../hooks/usePageMeta.js';

// Bracketed copy is placeholder for Shelby's own words — find and replace.
const VALUES = [
  { title: 'Designed with you', body: 'Every set starts as a conversation about your theme, colours and the little details. You see a proof before anything bakes.', bg: '#f6dde3', stroke: '#b4506d',
    icon: <><rect x="5" y="4" width="14" height="17" rx="2" /><rect x="9" y="2.5" width="6" height="3" rx="1" /><path d="M8.4 12.2 l2.3 2.3 L16 9" /></> },
  { title: 'Hand-iced, one by one', body: 'Baked fresh the week of your event and decorated by hand in small batches — no shortcuts.', bg: '#efe2d3', stroke: '#a0603f',
    icon: <><path d="M5 19 L14 10" /><path d="M14 10 L18.5 5.5 a2 2 0 0 1 2.8 2.8 L16.8 12.8 Z" /><path d="M4 20 l1-1" /></> },
  { title: 'Proudly GTA', body: 'Pickup or local delivery across the Greater Toronto Area, scheduled around your day.', bg: '#ecc3cf', stroke: '#8a3550',
    icon: <><path d="M12 21.5 C12 21.5 19 14.5 19 9 A7 7 0 1 0 5 9 C5 14.5 12 21.5 12 21.5Z" /><circle cx="12" cy="9" r="2.6" /></> },
];

export default function About({ go }) {
  usePageMeta(
    "About Shelby — Shelby's Cookie Co.",
    'Meet Shelby, the baker behind Shelby’s Cookie Co. — custom hand-iced sugar cookies across the Greater Toronto Area.'
  );

  return (
    <main>
      {/* HERO */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '64px 40px 90px' }}>
        <div className="hero" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,.95fr) minmax(0,1.05fr)', gap: 64, alignItems: 'center' }}>
          <div style={{ position: 'relative', padding: '20px 30px 30px 0' }}>
            <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, bottom: 10, left: 30, borderRadius: '400px 400px 22px 22px', border: '1.5px solid #3a2820' }} />
            <div className="zoom" style={{ position: 'relative', borderRadius: '400px 400px 18px 18px', aspectRatio: '4/5.2', boxShadow: '0 30px 60px -30px rgba(58,40,32,.55)' }}>
              <img src={portrait} alt="Shelby smiling and holding a Shelby's Cookie Co heart cookie" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 25%', display: 'block' }} />
            </div>
          </div>
          <div>
            <div className="kicker" style={{ color: '#b4506d', marginBottom: 20 }}>The baker behind the cookies</div>
            <h1 className="serif h1" style={{ fontSize: 96, fontWeight: 400, letterSpacing: '-.04em', lineHeight: .92, margin: '0 0 28px' }}>Hi, <em style={{ fontWeight: 300, color: '#b4506d' }}>I'm Shelby.</em></h1>
            <p style={{ fontSize: 19, lineHeight: 1.7, color: '#5c463c', margin: '0 0 18px', maxWidth: 500 }}>I design and hand-ice custom sugar cookies for the moments worth remembering — showers, weddings, birthdays, holidays and the occasional very fancy client gift.</p>
            <p style={{ fontSize: 19, lineHeight: 1.7, color: '#5c463c', margin: '0 0 30px', maxWidth: 500 }}>[One or two sentences in Shelby's voice — where she's based, how long she's been baking, what she loves most about it.]</p>
            <div className="hand" style={{ fontSize: 44, color: '#b4506d', transform: 'rotate(-2deg)', display: 'inline-block' }}>— Shelby ♥</div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section style={{ background: '#f6dde3', position: 'relative' }}>
        <div className="beads" aria-hidden="true" style={{ color: '#ecc3cf', position: 'absolute', top: 14, left: 0, right: 0 }} />
        <div className="two" style={{ maxWidth: 1240, margin: '0 auto', padding: '100px 40px', display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,.85fr)', gap: 72, alignItems: 'center' }}>
          <div>
            <div className="kicker" style={{ color: '#8a3550', marginBottom: 22 }}>How it started</div>
            <blockquote className="serif" style={{ margin: '0 0 30px', fontSize: 40, lineHeight: 1.2, fontWeight: 300, letterSpacing: '-.02em' }}>“[A short, heartfelt pull quote from Shelby about why she started.]”</blockquote>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: '#5c463c', margin: '0 0 16px' }}>[Story paragraph — the first cookie set, who it was for, and how it turned into Shelby's Cookie Co.]</p>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: '#5c463c', margin: 0 }}>[Story paragraph — what a typical week looks like now, and what still makes her smile about the work.]</p>
          </div>
          <div className="tile">
            <div style={{ background: '#ecc3cf', borderRadius: '400px 400px 14px 14px', padding: '20px 20px 0', overflow: 'hidden', boxShadow: '0 30px 60px -34px rgba(58,40,32,.5)' }}>
              <img className="ph" src={whisk} alt="Shelby whisking icing in a pearl mixing bowl" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', objectPosition: '50% 30%', display: 'block', borderRadius: '380px 380px 0 0' }} />
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '100px 40px 80px' }}>
        <div className="kicker" style={{ color: '#b4506d', marginBottom: 14 }}>How I work</div>
        <h2 className="serif h2" style={{ fontSize: 54, fontWeight: 400, letterSpacing: '-.03em', lineHeight: 1, margin: '0 0 40px' }}>Little things, <em style={{ fontWeight: 300, color: '#b4506d' }}>done with care</em></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
          {VALUES.map((v) => (
            <div key={v.title} className="lift step" style={{ background: v.bg, borderRadius: 22, padding: '30px 28px 34px', minHeight: 220 }}>
              <div className="serif" style={{ fontSize: 26, letterSpacing: '-.01em', marginBottom: 10 }}>{v.title}</div>
              <p style={{ margin: 0, color: '#5c463c', lineHeight: 1.65, fontSize: 15.5, maxWidth: 300 }}>{v.body}</p>
              <svg className="wm" aria-hidden="true" viewBox="0 0 24 24" style={{ stroke: v.stroke, opacity: .32 }}>{v.icon}</svg>
            </div>
          ))}
        </div>
      </section>

      {/* BEHIND THE SCENES */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 40px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 30 }}>
          <div>
            <div className="kicker" style={{ color: '#b4506d', marginBottom: 14 }}>Behind the scenes</div>
            <h2 className="serif h2" style={{ fontSize: 54, fontWeight: 400, letterSpacing: '-.03em', lineHeight: 1, margin: 0 }}>In the <em style={{ fontWeight: 300, color: '#b4506d' }}>kitchen</em></h2>
          </div>
          <span className="hand" style={{ fontSize: 26, color: '#8a3550', transform: 'rotate(-2deg)' }}>yes, the whisk is always pink</span>
        </div>
        <div className="collage" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gridTemplateRows: '260px 260px', gap: 18 }}>
          <div className="zoom" style={{ gridColumn: '1 / span 2', gridRow: '1 / span 2', borderRadius: 14 }}><img src={crossedTools} alt="Shelby in a Shelby's Cookie Co apron crossing a spatula and whisk" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 25%', display: 'block' }} /></div>
          <div className="zoom" style={{ gridColumn: '3 / span 2', gridRow: 1, borderRadius: 14 }}><img src={heartCutter} alt="Shelby peeking through a heart cookie cutter" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%', display: 'block' }} /></div>
          <div className="zoom" style={{ gridColumn: 3, gridRow: 2, borderRadius: 14 }}><img src={toolsHand} alt="Piping bags, a heart cutter and a pink whisk in hand" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></div>
          <div className="zoom" style={{ gridColumn: 4, gridRow: 2, borderRadius: 14 }}><img src={holdingLogo} alt="Shelby holding out two heart logo cookies" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#efe2d3', position: 'relative' }}>
        <div className="beads" aria-hidden="true" style={{ color: '#b4506d', opacity: .55, position: 'absolute', top: 16, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '96px 40px', textAlign: 'center' }}>
          <h2 className="serif h2" style={{ fontSize: 66, fontWeight: 400, letterSpacing: '-.035em', lineHeight: 1, margin: '0 0 18px' }}>Let's make something <em style={{ fontWeight: 300, color: '#b4506d' }}>sweet together.</em></h2>
          <p style={{ fontSize: 18, color: '#5c463c', margin: '0 0 32px' }}>Tell me about your event — I'd love to hear the idea.</p>
          <div style={{ display: 'flex', gap: 26, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={() => go('order')}>Start a custom order</button>
            <button type="button" className="link" onClick={() => go('gallery')}>Browse the gallery</button>
          </div>
        </div>
      </section>
    </main>
  );
}
