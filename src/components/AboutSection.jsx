import React from 'react';
import './LegendarySubmarineUI.css';

export default function AboutSection() {
  return (
    <div className="legend-sub-root">
      {/* 🐉 LEVIATHAN ALLOY HULL */}
      <div className="hull-texture" />
      
      {/* 🌀 ENERGY VEINS */}
      <div className="energy-vein" style={{ top: '20%' }} />
      <div className="energy-vein" style={{ top: '50%', animationDelay: '-2s' }} />
      <div className="energy-vein" style={{ top: '80%', animationDelay: '-1s' }} />

      {/* 🔭 THE ABYSSAL PERISCOPE */}
      <div className="periscope">
        <div className="periscope-scan" />
        <div style={{
          position: 'absolute', inset: '20px', 
          border: '1px solid rgba(0,255,200,0.2)', borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'monospace', fontSize: '10px', color: '#00ffcc88'
        }}>SCANNING...</div>
      </div>

      {/* 💎 CRYSTAL CORE (Holographic Card) */}
      <div className="crystal-card">
        {/* ☢️ X-RAY SCANNING BEAM */}
        <div className="xray-scan" />
        
        {/* ⚡ INTERFERENCE GLITCH OVERLAY */}
        <div className="interference" />
        
        {/* MISSION STATUS & RADIO CHECK */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div className="warning-pulse" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="radio-container">
              {[0.4, 0.7, 0.2, 0.9, 0.5, 0.8].map((d, i) => (
                <div key={i} className="wave-bar" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00ffcc', letterSpacing: '0.2em' }}>
              RADIO_CHECK: SIGNAL_LOCKED
            </span>
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(0,255,200,0.5)', letterSpacing: '0.2em' }}>
            // STATUS: SUPREME_OPERATIONAL // CLASS: ARCHITECT_V
          </span>
        </div>

        {/* LEGENDARY TITLE */}
        <div className="legend-subtitle text-[8px] md:text-[10px]">// PERSONNEL_DOSSIER</div>
        <h1 className="legend-title">ABOUT THE</h1>
        <h1 className="legend-title md:-mt-4" style={{ color: 'var(--depth-accent)' }}>DEVELOPER</h1>

        {/* PROFILE IDENTIFICATION & NARRATIVE */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start mt-10">
          
          {/* PERSONNEL IDENTIFICATION PANEL */}
          <div className="relative group shrink-0 w-full md:w-auto flex justify-center md:block">
            {/* TACTICAL FRAME */}
            <div className="relative w-full max-w-[320px] md:w-[320px] aspect-[3/4] rounded-2xl border-2 border-white/5 bg-black/40 p-2 overflow-hidden backdrop-blur-md transition-all duration-500 group-hover:border-cyan-400/30">

               {/* SCANNING LASER EFFECT */}
               <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/40 blur-sm animate-[scanLine_4s_linear_infinite] z-20" />
               
               {/* THE IMAGE */}
               <div className="w-full h-full rounded-xl overflow-hidden relative min-h-[300px]">
                  <div 
                    className="absolute inset-0 bg-cover bg-center grayscale-[0.2] transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                    style={{ backgroundImage: 'url("/profile.jpg.jpeg")' }}
                  />
                  
                  {/* AQUATIC HUD OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/80 via-transparent to-cyan-400/10 pointer-events-none mix-blend-overlay" />
                  
                  {/* DATA MATRIX OVERLAY */}
                  <div className="absolute top-4 right-4 text-right font-mono text-[8px] text-cyan-400/60 leading-tight">
                    DEEP_SCAN_ACTIVE<br/>
                    LAT: 12.9716 N<br/>
                    LON: 80.2437 E
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 border border-white/10 backdrop-blur-md rounded-lg">
                    <div className="font-mono text-[8px] text-cyan-500 tracking-[0.4em] mb-1 uppercase">Personnel ID</div>
                    <div className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">Judson J</div>
                    <div className="flex gap-1 mt-3">
                      {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 ${i < 5 ? 'bg-cyan-500' : 'bg-white/10'} rounded-full`} />)}
                    </div>
                  </div>
               </div>

               {/* CORNER ACCENTS */}
               <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-2xl" />
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50 rounded-br-2xl" />
            </div>

            {/* EXTERNAL LABELS */}
            <div className="absolute -left-6 top-1/2 -rotate-90 origin-center font-mono text-[7px] md:text-[9px] text-cyan-400/20 uppercase tracking-[0.5em] md:tracking-[1em] whitespace-nowrap">
              Biometric_Verification_System
            </div>
          </div>

          {/* MISSION OBJECTIVES / NARRATIVE */}
          <div className="flex-1 space-y-8">
            <div className="space-y-2">
              <div className="font-mono text-[10px] text-cyan-500/40 tracking-[0.6em] uppercase">// LOG_ENTRY_ALPHA</div>
              <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
                Commanding the <span className="text-cyan-400">Digital Deep</span>
              </h2>
            </div>

            <p className="font-mono text-xs md:text-base text-white/70 leading-relaxed border-l-2 border-cyan-400/20 pl-6 py-2">
              I command the monoliths that stand at the edge of the digital abyss. 
              As an architect of supreme resilience, I navigate the crushing pressures 
              of Machine Learning and Fullstack systems. With 300+ tactical algorithmic 
              solutions and a mastery over the primal languages of C++, Python, and Java, 
              I engineer the legendary structures that define the future of the deep.
            </p>

            <div className="grid grid-cols-2 gap-4 md:gap-8 pt-6">
               <div className="p-4 border border-white/5 bg-white/5 rounded-xl">
                  <div className="font-mono text-[8px] text-cyan-500/60 uppercase mb-2">Primary Objective</div>
                  <div className="text-xs text-white/90 font-bold uppercase tracking-widest">Architectural Resilience</div>
               </div>
               <div className="p-4 border border-white/5 bg-white/5 rounded-xl">
                  <div className="font-mono text-[8px] text-cyan-500/60 uppercase mb-2">Specialization</div>
                  <div className="text-xs text-white/90 font-bold uppercase tracking-widest">Neural Infrastructure</div>
               </div>
            </div>
          </div>
        </div>


        {/* 🔋 REACTOR STAT NODES */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '50px' }}>
          {[
            { val: '300+', label: 'LEETCODE' },
            { val: '8.0', label: 'SYNC_INDEX' },
            { val: 'CIT', label: 'DOMAIN' },
            { val: '5+', label: 'ARTIFACTS' },
          ].map(stat => (
            <div key={stat.label} className="reactor-node">
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--depth-accent)' }}>{stat.val}</div>
              <div style={{ fontSize: '10px', color: 'var(--depth-accent)', opacity: 0.4, letterSpacing: '0.2em', marginTop: '5px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIVET DETAILS */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', fontFamily: 'monospace', fontSize: '9px', color: '#333' }}>
        SERIAL_NO: 77-LVTHN-2026
      </div>
    </div>
  );
}
