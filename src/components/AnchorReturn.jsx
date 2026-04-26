import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnchorReturn() {
  const [isWashing, setIsWashing] = useState(false);
  const depthRef = useRef(null);
  const progressRef = useRef(null);
  const progressRef2 = useRef(null);

  const handleReturn = () => {
    if (isWashing) return;
    setIsWashing(true);
    
    const container = document.getElementById('abyss-scroll-container') || window;
    const startY = container.scrollTop !== undefined ? container.scrollTop : window.scrollY;
    const duration = 5000; // 5 seconds to surface
    const startTime = performance.now();
    const maxDepth = 10994; // Mariana Trench depth
    
    // Lock scrolling for safety
    if (container.style) container.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Cubic In-Out Easing: Starts slow, reaches insane speed in middle, slows down at surface
        const easeProgress = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const currentY = startY * (1 - easeProgress);
        
        // Manually scroll the page
        if (container.scrollTo) {
            container.scrollTo({ top: currentY });
        }
        
        // Update HUD DOM directly for 60fps performance without React re-renders
        if (depthRef.current) {
            depthRef.current.innerText = Math.floor(maxDepth * (1 - progress));
        }
        if (progressRef.current && progressRef2.current) {
            const heightPct = `${progress * 100}%`;
            progressRef.current.style.height = heightPct;
            progressRef2.current.style.height = heightPct;
        }
        
        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        } else {
            setIsWashing(false);
            if (container.style) container.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
        }
    };
    
    requestAnimationFrame(animateScroll);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0 0 120px', gap: '0', 
      position: 'relative',
      marginTop: '-140px', // Pulled up even further to deeply attach to the section above
      pointerEvents: 'none' // Prevent this wide container from blocking clicks behind it
    }}>
      {/* ⚓ THE HYPER-REALISTIC IRON ANCHOR */}
      <motion.div
        animate={isWashing ? { y: -50 } : { y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ 
          cursor: 'pointer', position: 'relative', zIndex: 10, 
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          pointerEvents: 'auto' // ONLY the anchor graphic itself is clickable
        }}
        onClick={handleReturn}
      >
        {/* Chain */}
        <div style={{ position: 'relative', height: '250px', zIndex: 1 }}>
          <svg width="40" height="250" viewBox="0 0 40 250" fill="none">
            <defs>
              <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4a4e52" />
                <stop offset="50%" stopColor="#1a1c1e" />
                <stop offset="100%" stopColor="#333" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <g key={i} transform={`translate(0, ${i * 30})`}>
                {i % 2 === 0 ? (
                  <rect x="12" y="0" width="16" height="45" rx="8" stroke="url(#linkGrad)" strokeWidth="6" />
                ) : (
                  <rect x="5" y="5" width="30" height="35" rx="15" stroke="url(#linkGrad)" strokeWidth="6" />
                )}
                <rect x="18" y="25" width="4" height="10" fill="#00ffcc22" />
              </g>
            ))}
          </svg>
        </div>

        {/* Anchor Body */}
        <div style={{ position: 'relative', top: '-10px', zIndex: 2 }}>
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
          <circle cx="50" cy="15" r="10" stroke="url(#ironDusk)" strokeWidth="5" filter="url(#ironRelief)" />
          <circle cx="50" cy="15" r="5" fill="rgba(0,255,200,0.1)" />
          <rect x="46" y="25" width="8" height="70" fill="url(#ironDusk)" rx="2" filter="url(#ironRelief)" />
          <rect x="25" y="38" width="50" height="6" fill="url(#ironDusk)" rx="3" filter="url(#ironRelief)" />
          <path d="M50 95 C 20 95, 10 75, 10 50" stroke="url(#ironDusk)" strokeWidth="10" strokeLinecap="round" fill="none" filter="url(#ironRelief)" />
          <path d="M50 95 C 80 95, 90 75, 90 50" stroke="url(#ironDusk)" strokeWidth="10" strokeLinecap="round" fill="none" filter="url(#ironRelief)" />
          <path d="M10 50 L 2 60 L 15 65 Z" fill="#1a1c1e" stroke="#00ffcc44" />
          <path d="M90 50 L 98 60 L 85 65 Z" fill="#1a1c1e" stroke="#00ffcc44" />
          <circle cx="50" cy="95" r="4" fill="#00ffcc" style={{ filter: 'blur(3px)' }} />
        </svg>
      </div>
      
      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#00ffcc', letterSpacing: '0.25em', marginTop: '10px', textShadow: '0 0 10px rgba(0,255,200,0.5)' }}>
        [ PULL ANCHOR TO MOVE UP ]
      </div>

      </motion.div>

      {/* 🚀 FANCY HUD ASCENT METER */}
      <AnimatePresence>
        {isWashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0, left: 0,
              width: '100vw', height: '100vh',
              // Transparent so the user physically sees the portfolio whizzing past them!
              background: 'radial-gradient(circle, transparent 10%, rgba(0, 15, 20, 0.9) 100%)',
              boxShadow: 'inset 0 0 150px rgba(0,255,200,0.2)',
              zIndex: 99999,
              pointerEvents: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {/* Speed Particles (Water rushing down) */}
            <div className="ascent-particles" />
            <div className="ascent-speed-lines" />

            {/* Side Progress Bars */}
            <div style={{ position: 'absolute', left: '5%', top: '20%', bottom: '20%', width: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div ref={progressRef} style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '0%', background: '#00ffcc', boxShadow: '0 0 20px #00ffcc' }} />
            </div>
            <div style={{ position: 'absolute', right: '5%', top: '20%', bottom: '20%', width: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div ref={progressRef2} style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '0%', background: '#00ffcc', boxShadow: '0 0 20px #00ffcc' }} />
            </div>

            {/* Central Altimeter HUD */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '350px', height: '350px' }}>
                {/* Rotating Tech Rings */}
                <div className="hud-ring-outer" />
                <div className="hud-ring-inner" />
                <div className="hud-ring-dotted" />

                <div style={{ textAlign: 'center', zIndex: 10, backdropFilter: 'blur(5px)', padding: '30px', borderRadius: '50%' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '14px', color: '#00ffcc', letterSpacing: '0.4em', marginBottom: '10px' }}>
                        CURRENT DEPTH
                    </div>
                    
                    {/* The Ticking Number */}
                    <div style={{ 
                        fontFamily: 'Outfit, sans-serif', fontSize: '5vw', fontWeight: 900, color: '#fff', 
                        lineHeight: 1, textShadow: '0 0 30px rgba(0,255,200,0.8)',
                        display: 'flex', alignItems: 'baseline', justifyContent: 'center'
                    }}>
                        <span ref={depthRef}>10994</span>
                        <span style={{ fontSize: '2vw', color: '#00ffcc', marginLeft: '5px' }}>M</span>
                    </div>

                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#00ffcc', letterSpacing: '0.2em', marginTop: '15px', animation: 'pulse 0.5s infinite' }}>
                        ▲ ASCENDING ▲
                    </div>
                </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* HUD RINGS */
        .hud-ring-outer {
            position: absolute; inset: 0;
            border: 2px solid rgba(0,255,200,0.1);
            border-top: 2px solid #00ffcc;
            border-bottom: 2px solid #00ffcc;
            border-radius: 50%;
            animation: spin 3s linear infinite;
        }
        .hud-ring-inner {
            position: absolute; inset: 20px;
            border: 4px solid rgba(0,255,200,0.05);
            border-left: 4px solid #00ffcc;
            border-radius: 50%;
            animation: spinReverse 4s linear infinite;
        }
        .hud-ring-dotted {
            position: absolute; inset: 40px;
            border: 2px dashed rgba(0,255,200,0.3);
            border-radius: 50%;
            animation: spin 10s linear infinite;
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes spinReverse { 100% { transform: rotate(-360deg); } }

        /* SPEED LINES & PARTICLES */
        @keyframes rushDown {
          0% { background-position: 0 0; }
          100% { background-position: 0 100vh; }
        }
        .ascent-speed-lines {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 255, 200, 0.15) 50%, transparent 100%);
          background-size: 100% 200vh;
          animation: rushDown 0.3s linear infinite;
          opacity: 0.8;
          mix-blend-mode: screen;
        }
        .ascent-particles {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle at center, rgba(255,255,255,0.8) 1px, transparent 1.5px);
          background-size: 60px 100px;
          animation: rushDown 0.15s linear infinite;
          opacity: 0.3;
        }

        @keyframes pulse {
            0% { opacity: 0.3; }
            100% { opacity: 1; text-shadow: 0 0 15px #00ffcc; }
        }
      `}</style>
    </div>
  );
}
