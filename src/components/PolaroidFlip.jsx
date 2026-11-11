import { useEffect, useRef, useState } from 'react';

// Polaroid that flips over every 5–10s to reveal the next gallery photo + title.
// Two faces take turns: the hidden face is loaded with the next photo, then the
// card rotates a further 180° (always the same direction).
export default function PolaroidFlip({ photos }) {
  const n = photos.length;
  const [faces, setFaces] = useState([0, n > 1 ? 1 : 0]);
  const [turn, setTurn] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (n < 2 || paused) return undefined;
    const schedule = () => {
      timer.current = setTimeout(() => {
        if (document.hidden) { schedule(); return; }
        setTurn((t) => t + 1);
      }, 5000 + Math.random() * 5000);
    };
    schedule();
    return () => clearTimeout(timer.current);
  }, [turn, paused, n]);

  // when a flip lands, load the *next* photo onto the face that just turned away
  useEffect(() => {
    if (turn === 0 || n < 2) return;
    const shownSlot = turn % 2; // slot 0 shows on even turns, slot 1 on odd
    const hiddenSlot = 1 - shownSlot;
    const upcoming = (faces[shownSlot] + 1) % n;
    const id = setTimeout(() => {
      setFaces((f) => { const c = [...f]; c[hiddenSlot] = upcoming; return c; });
      const im = new Image(); im.src = photos[(upcoming + 1) % n].src;
    }, 1100);
    return () => clearTimeout(id);
  }, [turn]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!n) return null;

  const face = (slot, back) => {
    const p = photos[faces[slot]];
    return (
      <div className="pol-face" aria-hidden={(turn % 2 !== slot) ? 'true' : undefined} style={back ? { position: 'absolute', inset: 0, transform: 'rotateY(180deg)' } : undefined}>
        <img src={p.src} alt={turn % 2 === slot ? p.label : ''} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }} />
        <div className="hand" style={{ fontSize: 21, textAlign: 'center', marginTop: 6, color: '#b4506d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.label || 'fresh batch'} ♥</div>
      </div>
    );
  };

  return (
    <figure
      className="pol pol-flip"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ position: 'absolute', left: 0, bottom: 0, margin: 0, width: '42%', transform: 'rotate(-4deg)' }}
    >
      <div className="pol-inner" style={{ transform: `rotateY(${turn * 180}deg)` }}>
        {face(0, false)}
        {face(1, true)}
      </div>
    </figure>
  );
}
