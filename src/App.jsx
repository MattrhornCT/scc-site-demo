import { useState } from 'react';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Gallery from './pages/Gallery.jsx';
import Order from './pages/Order.jsx';

export default function App() {
  const [view, setView] = useState('home');

  const go = (v) => {
    setView(v);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav view={view} goHome={() => go('home')} goGallery={() => go('gallery')} goOrder={() => go('order')} />
      <div style={{ animation: 'fadeUp .55s ease both' }}>
        {view === 'home' && <Home goOrder={() => go('order')} goGallery={() => go('gallery')} />}
        {view === 'gallery' && <Gallery />}
        {view === 'order' && <Order />}
      </div>
      <Footer goHome={() => go('home')} goGallery={() => go('gallery')} goOrder={() => go('order')} />
    </div>
  );
}
