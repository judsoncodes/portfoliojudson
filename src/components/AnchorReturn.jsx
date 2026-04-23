import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnchorReturn() {
  const [isWashing, setIsWashing] = useState(false);

  const handleReturn = () => {
    setIsWashing(true);
    
    // Target the specific scroll container we created in ContentLayer
    const container = document.getElementById('abyss-scroll-container');
    
    // Scroll to top after a delay (when wave is at full screen)
    setTimeout(() => {
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 800);

    // Hide wave after animation completes
    setTimeout(() => {
      setIsWashing(false);
    }, 2000);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '100px 0 120px', gap: '24px',
      position: 'relative'
    }}>
      <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#00ffcc44', letterSpacing: '0.3em' }}>
        // END OF TRANSMISSION // ASCENT AVAILABLE
      </div>

      {/* ⚓ THE HYPER-REALISTIC IRON ANCHOR & MECHANICAL CHAIN */}
      <motion.div
        animate={isWashing ? { y: 20 } : { y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ y: 30, scale: 0.98 }}
        style={{ cursor: 'pointer', position: 'relative', zIndex: 10, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        onClick={handleReturn}
      >
        {/* 🛠️ ANCHOR HATCH (Connecting to Signal Border) */}
        <div style={{
          width: '120px', height: '20px',
          background: 'linear-gradient(180deg, #050a0f, #1a1c1e)',
          border: '1px solid rgba(0,255,200,0.2)',
          borderRadius: '4px 4px 0 0',
          position: 'relative', top: '-10px',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.8)'
        }} />

        {/* ⛓️ THE HEAVY IRON CHAIN (SVG for realism) */}
        <div style={{ position: 'relative', top: '-15px', height: '180px' }}>
          <svg width="40" height="200" viewBox="0 0 40 200" fill="none">
            <defs>
              <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4a4e52" />
                <stop offset="50%" stopColor="#1a1c1e" />
                <stop offset="100%" stopColor="#333" />
              </linearGradient>
            </defs>
            {/* Render 5-6 Interlocking links */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <g key={i} transform={`translate(0, ${i * 30})`}>
                {/* Horizontal link (side view) */}
                {i % 2 === 0 ? (
                  <rect x="12" y="0" width="16" height="45" rx="8" stroke="url(#linkGrad)" strokeWidth="6" />
                ) : (
                  /* Vertical link (front view) */
                  <rect x="5" y="5" width="30" height="35" rx="15" stroke="url(#linkGrad)" strokeWidth="6" />
                )}
                {/* Connector highlights */}
                <rect x="18" y="25" width="4" height="10" fill="#00ffcc22" />
              </g>
            ))}
          </svg>
        </div>

        <div style={{ position: 'relative', top: '-20px' }}>
          <svg width="120" height="150" viewBox="0 0 100 120" fill="none">
          <defs>
            <linearGradient id="ironDusk" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a4e52" />
              <stop offset="50%" stopColor="#1a1c1e" />
              <stop offset="100%" stopColor="#050505" />
            </linearGradient>
            <filter id="ironRelief">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
              <feOffset in="blur" dx="1" dy="1" result="offset" />
              <feComposite in="SourceGraphic" in2="offset" operator="over" />
            </filter>
          </defs>

          {/* Heavy Ring (Now connected to chain) */}
          <circle cx="50" cy="15" r="10" stroke="url(#ironDusk)" strokeWidth="5" filter="url(#ironRelief)" />
          <circle cx="50" cy="15" r="5" fill="rgba(0,255,200,0.1)" />

          {/* Thick Shaft */}
          <rect x="46" y="25" width="8" height="70" fill="url(#ironDusk)" rx="2" filter="url(#ironRelief)" />

          {/* Stock (Crossbar) */}
          <rect x="25" y="38" width="50" height="6" fill="url(#ironDusk)" rx="3" filter="url(#ironRelief)" />

          {/* Arms & Flukes */}
          <path 
            d="M50 95 C 20 95, 10 75, 10 50" 
            stroke="url(#ironDusk)" strokeWidth="10" strokeLinecap="round" fill="none"
            filter="url(#ironRelief)"
          />
          <path 
            d="M50 95 C 80 95, 90 75, 90 50" 
            stroke="url(#ironDusk)" strokeWidth="10" strokeLinecap="round" fill="none"
            filter="url(#ironRelief)"
          />

          {/* Sharp Flukes */}
          <path d="M10 50 L 2 60 L 15 65 Z" fill="#1a1c1e" stroke="#00ffcc44" />
          <path d="M90 50 L 98 60 L 85 65 Z" fill="#1a1c1e" stroke="#00ffcc44" />

          {/* Center Point Glow */}
          <circle cx="50" cy="95" r="4" fill="#00ffcc" style={{ filter: 'blur(3px)' }} />
        </svg>
      </div>

        {/* 🫧 Pull Bubbles (Only visible when clicking) */}
        {isWashing && (
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -100, scale: 2 }}
                style={{
                  position: 'absolute', width: '8px', height: '8px',
                  borderRadius: '50%', background: 'rgba(255,255,255,0.4)',
                  left: (Math.random() - 0.5) * 40
                }}
              />
            ))}
          </div>
        )}

        {/* Caustic Shadow */}
        <div style={{
          position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
          width: '80px', height: '20px', background: 'radial-gradient(ellipse, rgba(0,255,200,0.2), transparent 70%)',
          filter: 'blur(5px)', zIndex: -1
        }} />
      </motion.div>

      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00ffcc66', letterSpacing: '0.25em' }}>
        ↑ ASCEND TO SURFACE
      </div>

      {/* 🌊 MESMERIZING WAVE WASHOUT OVERLAY */}
      <AnimatePresence>
        {isWashing && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '-100%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: [0.45, 0, 0.55, 1] }}
            style={{
              position: 'fixed',
              top: 0, left: 0,
              width: '100vw', height: '250vh',
              background: 'linear-gradient(to top, #00080a 0%, #001a22 20%, #00ffcc 35%, #008877 50%, #001a22 100%)',
              zIndex: 9999,
              pointerEvents: 'none',
              filter: 'contrast(1.1) brightness(1.2)',
              display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}
          >
            {/* ☀️ ABYSSAL GOD RAYS (Shining through the wave) */}
            {[...Array(6)].map((_, i) => (
              <div key={`ray-${i}`} style={{
                position: 'absolute', top: '10%', left: `${15 + i * 15}%`,
                width: '60px', height: '80%',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
                transform: `rotate(${15 - i * 5}deg)`,
                filter: 'blur(30px)',
                opacity: 0.6
              }} />
            ))}

            {/* 🫧 BUBBLE FIELD (Rising with the wave) */}
            {[...Array(40)].map((_, i) => (
              <div key={`bubble-${i}`} style={{
                position: 'absolute',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${4 + Math.random() * 12}px`,
                height: `${4 + Math.random() * 12}px`,
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.5)',
                filter: 'blur(1px)',
                animation: `bubbleRise ${1 + Math.random() * 2}s infinite linear`,
                animationDelay: `${Math.random() * 2}s`
              }} />
            ))}

            {/* 🌊 FOAM CREST */}
            <div style={{
              position: 'absolute', top: '34%', width: '100%', height: '15px',
              background: 'linear-gradient(to bottom, transparent, #fff, transparent)',
              boxShadow: '0 0 150px 60px rgba(255,255,255,0.5)',
              zIndex: 10
            }} />
            
            {/* 🌫️ TURBULENCE DISTORTION */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle, transparent 20%, rgba(0,255,200,0.05) 100%)',
              mixBlendMode: 'overlay'
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bubbleRise {
          0% { transform: translateY(100px) scale(1); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-300px) scale(1.5); opacity: 0; }
        }
        @keyframes anchorPulse {
          0% { filter: drop-shadow(0 0 10px rgba(0,255,200,0.2)); }
          100% { filter: drop-shadow(0 0 30px rgba(0,255,200,0.5)); }
        }
      `}</style>
    </div>
  );
}
