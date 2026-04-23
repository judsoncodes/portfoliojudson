import React from 'react';

/**
 * CinematicLens Component
 * Provides a global overlay for post-processing effects like Vignette, 
 * Film Grain, and Scanlines to give the app a 'AAA' submarine look.
 */
const CinematicLens = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {/* 🌑 VIGNETTE: Darkens edges to focus on center */}
      <div 
        className="absolute inset-0 opacity-60" 
        style={{
          background: 'radial-gradient(circle, transparent 40%, black 150%)'
        }}
      />

      {/* 🎞️ FILM GRAIN: Adds texture/noise */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay animate-grain"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`
        }}
      />

      {/* 📺 SCANLINES: Submarine monitor effect */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, black 3px)'
        }}
      />

      {/* 💠 CORNER BRACKETS: HUD Framing */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-xl" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-cyan-500/20 rounded-tr-xl" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-cyan-500/20 rounded-bl-xl" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-cyan-500/20 rounded-br-xl" />

      {/* 📊 SYSTEM DATA: Subtle micro-stats at the bottom (Hidden on mobile) */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 gap-12 text-[8px] font-mono tracking-[0.4em] text-cyan-500/30 uppercase">
        <span>Press: 109.4 MPa</span>
        <span className="animate-pulse">Status: Live Uplink</span>
        <span>Temp: 2.4°C</span>
      </div>

      <style>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          30% { transform: translate(1%, 1%); }
          50% { transform: translate(-0.5%, 1.5%); }
          70% { transform: translate(1.5%, -0.5%); }
          90% { transform: translate(-1%, 0.5%); }
        }
        .animate-grain {
          animation: grain 8s steps(10) infinite;
        }
      `}</style>
    </div>
  );
};

export default CinematicLens;
