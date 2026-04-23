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
              background: 'linear-gradient(145deg, rgba(10,25,35,0.9) 0%, rgba(5,15,25,0.95) 100%)',
              backdropFilter: 'blur(15px)',
              borderRadius: '20px',
              padding: '45px',
              border: '1px solid rgba(0,255,200,0.1)',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(0,255,200,0.4)';
              e.currentTarget.style.boxShadow = '0 30px 80px rgba(0,255,200,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = 'rgba(0,255,200,0.1)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.8)';
            }}
          >
            {/* 🔍 SCANNING OVERLAY (Hover effect) */}
            <div className="artifact-scan" style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
              background: 'linear-gradient(90deg, transparent, #00ffcc, transparent)',
              opacity: 0, transition: 'opacity 0.3s'
            }} />

            {/* 🏷️ CLASSIFICATION LABEL */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '30px'
            }}>
              <div style={{
                fontFamily: 'monospace', fontSize: '10px', color: '#00ffcc', 
                letterSpacing: '0.4em', background: 'rgba(0,255,200,0.1)', 
                padding: '6px 12px', borderRadius: '4px'
              }}>
                CLASSIFIED_RELICT_0{i+1}
              </div>
              <div style={{
                fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.2em'
              }}>
                DEPTH: 8000M
              </div>
            </div>

            {/* 🚀 PROJECT NAME */}
            <h3 style={{
              fontFamily: '"Arial Black", sans-serif',
              fontSize: '32px', fontWeight: 900, color: '#fff',
              margin: '0 0 15px 0', letterSpacing: '-0.02em',
              textShadow: '0 0 20px rgba(0,255,200,0.3)'
            }}>{proj.name}</h3>

            {/* 🛠️ TECH STACK DNA */}
            <div style={{
              display: 'flex', gap: '10px', marginBottom: '25px', opacity: 0.8
            }}>
              {proj.period.split('|').map(tech => (
                <span key={tech} style={{
                  fontFamily: 'monospace', fontSize: '9px', color: '#00ffcc',
                  border: '1px solid rgba(0,255,200,0.3)', padding: '3px 8px',
                  borderRadius: '2px'
                }}>{tech.trim()}</span>
              ))}
            </div>

            {/* 📄 DESCRIPTION */}
            <p style={{
              fontFamily: 'monospace', fontSize: '14px', lineHeight: 1.8,
              color: 'rgba(200,240,255,0.7)', margin: 0,
              borderLeft: '1px solid rgba(0,255,200,0.2)', paddingLeft: '20px'
            }}>
              {proj.description}
            </p>

            {/* 🧬 DNA STRIP (Visual Decoration) */}
            <div style={{
              position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)',
              display: 'flex', flexDirection: 'column', gap: '5px', opacity: 0.1
            }}>
              {[...Array(8)].map((_, j) => (
                <div key={j} style={{
                  width: '4px', height: '4px', background: '#00ffcc', borderRadius: '50%'
                }} />
              ))}
            </div>

            {/* 🔘 MISSION ACCESS BUTTON */}
            <div style={{
              marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(0,255,200,0.05)',
              display: 'flex', alignItems: 'center', gap: '12px',
              fontFamily: 'monospace', fontSize: '11px', color: '#00ffcc',
              letterSpacing: '0.2em', fontWeight: 900
            }}>
              [ INITIALIZE_MISSION_LOG ] 
              <span style={{ fontSize: '18px', animation: 'arrowMove 1s infinite alternate' }}>→</span>
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
