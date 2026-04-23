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
        <div className="legend-subtitle">// SYSTEM_ARCHITECT</div>
        <h1 className="legend-title">ABYSSAL</h1>
        <h1 className="legend-title" style={{ marginTop: '-15px', color: '#00ffcc' }}>ARCHITECT</h1>

        {/* EPIC NARRATIVE */}
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 'clamp(11px, 3.5vw, 14px)',
          lineHeight: '1.6',
          color: 'rgba(180, 220, 255, 0.8)',
          maxWidth: '650px',
          margin: '20px 0',
          borderLeft: '2px solid #00ffcc',
          paddingLeft: '15px',
          textShadow: '0 0 20px rgba(0,0,0,1)',
          letterSpacing: '-0.02em'
        }}>
          I command the monoliths that stand at the edge of the digital abyss. 
          As an architect of supreme resilience, I navigate the crushing pressures 
          of Machine Learning and Fullstack systems. With 300+ tactical algorithmic 
          solutions and a mastery over the primal languages of C++, Python, and Java, 
          I engineer the legendary structures that define the future of the deep.
        </p>

        {/* 🔋 REACTOR STAT NODES */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '50px' }}>
          {[
            { val: '300+', label: 'LEETCODE' },
            { val: '8.0', label: 'SYNC_INDEX' },
            { val: 'CIT', label: 'DOMAIN' },
            { val: '5+', label: 'ARTIFACTS' },
          ].map(stat => (
            <div key={stat.label} className="reactor-node">
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#00ffcc' }}>{stat.val}</div>
              <div style={{ fontSize: '10px', color: 'rgba(0,255,200,0.4)', letterSpacing: '0.2em', marginTop: '5px' }}>
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
