import React from 'react';
import { motion } from 'framer-motion';

export default function ArtifactsSection({ projects }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '60px 15px' }}>
      
      {/* 🔮 THE ARTIFACT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        {projects.map((proj, i) => (
          <motion.div
            key={proj.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.15 }}
            style={{
              position: 'relative',
              background: 'linear-gradient(145deg, rgba(10,25,35,0.8) 0%, rgba(5,15,25,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '35px 25px',
              border: '1px solid rgba(0,255,200,0.08)',
              overflow: 'hidden',
              boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
              cursor: 'pointer',
              transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.01)';
              e.currentTarget.style.borderColor = 'rgba(0,255,200,0.3)';
              e.currentTarget.style.boxShadow = '0 40px 90px rgba(0,255,200,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = 'rgba(0,255,200,0.08)';
              e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.8)';
            }}
          >
            {/* 🔍 SCANNING OVERLAY (Hover effect) */}
            <div className="artifact-scan" style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
              background: 'linear-gradient(90deg, transparent, #00ffcc, transparent)',
              opacity: 0.1, transition: 'opacity 0.3s'
            }} />

            {/* 🏷️ CLASSIFICATION LABEL */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '35px'
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#00ffcc', 
                letterSpacing: '0.4em', background: 'rgba(0,255,200,0.1)', 
                padding: '8px 16px', borderRadius: '4px', textTransform: 'uppercase'
              }}>
                Relict_v0{i+1}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.2em'
              }}>
                8K_DEPTH
              </div>
            </div>

            {/* 🚀 PROJECT NAME */}
            <h3 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(24px, 8vw, 36px)', fontWeight: 800, color: '#fff',
              margin: '0 0 15px 0', letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              lineHeight: 1.1,
              textShadow: '0 0 30px rgba(0,255,200,0.2)'
            }}>{proj.name}</h3>

            {/* 🛠️ TECH STACK DNA */}
            <div style={{
              display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap'
            }}>
              {proj.period.split('|').map(tech => (
                <span key={tech} style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(0,255,200,0.6)',
                  border: '1px solid rgba(0,255,200,0.15)', padding: '4px 10px',
                  borderRadius: '30px', background: 'rgba(0,255,200,0.03)'
                }}>{tech.trim()}</span>
              ))}
            </div>

            {/* 📄 DESCRIPTION */}
            <p style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', lineHeight: 1.7,
              color: 'rgba(200,230,255,0.6)', margin: 0,
              maxWidth: '90%'
            }}>
              {proj.description}
            </p>

            {/* 🧬 DNA STRIP (Visual Decoration) */}
            <div style={{
              position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
              display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.1
            }}>
              {[...Array(12)].map((_, j) => (
                <div key={j} style={{
                  width: '3px', height: '3px', background: '#00ffcc', borderRadius: '50%'
                }} />
              ))}
            </div>

            {/* 🔘 MISSION ACCESS BUTTON */}
            <div style={{
              marginTop: '45px', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.03)',
              display: 'flex', alignItems: 'center', gap: '15px',
              fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#00ffcc',
              letterSpacing: '0.3em', fontWeight: 700, opacity: 0.8
            }}>
              [ INITIALIZE_LOG ] 
              <span style={{ fontSize: '16px', animation: 'arrowMove 1s infinite alternate' }}>→</span>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        @keyframes arrowMove {
          from { transform: translateX(0); }
          to { transform: translateX(10px); }
        }
        .artifact-scan {
          animation: artifactScan 4s infinite linear;
        }
        @keyframes artifactScan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
