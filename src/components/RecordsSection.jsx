import React from 'react';

export default function RecordsSection() {
  const achievements = [
    { id: '01', text: 'Completed basics of PYTHON FOR DATA SCIENCE in IBM Cloud Skills.', type: 'CERT' },
    { id: '02', text: 'Completed basics of SQL in IBM Cloud Skills.', type: 'CERT' },
    { id: '03', text: 'Completed Cybersecurity, IoT, and Modern AI at Cisco Networking Academy.', type: 'CERT' },
    { id: '04', text: 'Solved 300+ LeetCode problems. Strong DSA & C++ skills.', type: 'SKILL' },
  ];
  const deployments = [
    { text: 'Completed internship on Google Cloud Skills Boost platform.', org: 'GOOGLE' },
    { text: 'Palo Alto Networks — Cybersecurity Internship.', org: 'PALO_ALTO' },
  ];  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '60px 10px' }}>
      
      {/* 🛡️ THE IRON VAULT CONTAINER */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(160deg, rgba(2, 10, 15, 0.4) 0%, rgba(0, 20, 30, 0.6) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,255,150,0.12)',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 0 80px rgba(0,255,136,0.06), inset 0 0 60px rgba(0,20,10,0.8)',
      }}>

        {/* 🛠️ Iron piping — decorative power delivery system */}
        <div style={{
          position: 'absolute', top: 0, left: 'clamp(20px, 10vw, 60px)', width: '1px', height: '100%',
          background: 'linear-gradient(180deg, #00ff88 0%, transparent 30%, transparent 70%, #00ff88 100%)',
          opacity: 0.15,
        }} />
        
        {/* 🧬 DNA strip — bioluminescent nucleotides (Hidden on very small screens to save space) */}
        <div style={{
          position: 'absolute', left: '12px', top: '80px', bottom: '20px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-around',
          width: '4px',
          zIndex: 5,
          opacity: 0.4,
          visibility: window.innerWidth < 480 ? 'hidden' : 'visible'
        }}>
          {Array.from({length: 18}).map((_, i) => (
            <div key={i} style={{
              width: '4px', height: '4px', borderRadius: '50%',
              background: i % 3 === 0 ? '#00ff88' : i % 3 === 1 ? '#00ffcc' : 'rgba(0,255,136,0.2)',
              boxShadow: i % 3 !== 2 ? `0 0 8px ${i % 3 === 0 ? '#00ff88' : '#00ffcc'}` : 'none',
              animation: 'nucleoPulse 3s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>

        {/* 📟 VAULT CONTENT */}
        <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(30px, 6vw, 60px) clamp(10px, 4vw, 40px) 40px clamp(15px, 8vw, 80px)' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#00ff8888', letterSpacing: '0.5em', marginBottom: '10px' }}>
              // DEEP_SEA_ARCHIVES
            </div>
            <h2 style={{
              fontFamily: '"Arial Black", sans-serif',
              fontSize: 'clamp(32px, 8vw, 52px)', fontWeight: 900, fontStyle: 'italic',
              color: '#fff', textShadow: '0 0 30px rgba(0,255,136,0.5)',
              margin: 0, letterSpacing: '-0.02em', lineHeight: 1
            }}>RECORDS</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {/* 🏆 ACHIEVEMENTS */}
            {achievements.map((item, i) => (
              <div key={item.id} style={{
                position: 'relative',
                padding: 'clamp(15px, 4vw, 24px)',
                background: 'rgba(0,255,136,0.03)',
                border: '1px solid rgba(0,255,136,0.08)',
                borderLeft: '4px solid #00ff88',
                borderRadius: '0 4px 4px 0',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'default'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0,255,136,0.07)';
                e.currentTarget.style.borderLeftColor = '#00ffcc';
                e.currentTarget.style.transform = 'translateX(8px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0,255,136,0.03)';
                e.currentTarget.style.borderLeftColor = '#00ff88';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
              >
                <div style={{ display: 'flex', gap: 'clamp(15px, 5vw, 25px)', position: 'relative', zIndex: 1 }}>
                  <span style={{
                    fontFamily: '"Arial Black", monospace',
                    fontSize: 'clamp(20px, 6vw, 32px)', fontWeight: 900,
                    color: 'rgba(0,255,136,0.15)',
                    lineHeight: 1, flexShrink: 0,
                  }}>#{item.id}</span>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#00ff88', opacity: 0.6, letterSpacing: '0.25em', marginBottom: '8px' }}>
                      {item.type} // VERIFIED
                    </div>
                    <p style={{ fontFamily: 'monospace', fontSize: 'clamp(13px, 4vw, 15px)', color: 'rgba(200,245,220,0.9)', lineHeight: 1.6, margin: 0 }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* 📡 DEPLOYMENTS (Integrated into grid) */}
            <div style={{ marginTop: '30px', marginBottom: '10px', fontFamily: 'monospace', fontSize: '12px', color: '#00ff88', letterSpacing: '0.3em', borderBottom: '1px solid rgba(0,255,136,0.2)', paddingBottom: '10px' }}>
              ACTIVE_DEPLOYMENTS
            </div>
            {deployments.map((dep, i) => (
              <div key={i} style={{
                padding: '24px 30px',
                background: 'rgba(0,255,136,0.04)',
                border: '1px solid rgba(0,255,136,0.1)',
                borderRight: '4px solid #00ffcc',
                borderRadius: '4px 0 0 4px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,136,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,255,136,0.04)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#00ffcc', boxShadow: '0 0 10px #00ffcc' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00ffcc', letterSpacing: '0.3em', fontWeight: 900 }}>{dep.org}</span>
                </div>
                <p style={{ fontFamily: 'monospace', fontSize: '14px', color: 'rgba(180,230,210,0.8)', margin: 0, lineHeight: 1.8 }}>{dep.text}</p>
              </div>
            ))}
          </div>

          {/* 🛠️ DIAGNOSTIC VAULT STATUS */}
          <div style={{
            marginTop: '50px',
            padding: '24px',
            border: '1px solid rgba(0,255,136,0.15)',
            borderRadius: '6px',
            background: 'rgba(0,255,136,0.02)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
          }}>
            {[
              { label: 'AUTH_LEVEL', value: 'OMEGA', color: '#00ffcc' },
              { label: 'CLEARANCE', value: 'FULL_ACCESS', color: '#00ff88' },
              { label: 'INTEGRITY', value: '■■■■■ 100%', color: '#00ffcc' },
              { label: 'VERIFICATION', value: 'CRYPTOGRAPHIC', color: '#00ff88' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '10px', padding: '8px 0', borderBottom: '1px solid rgba(0,255,136,0.06)' }}>
                <span style={{ color: '#00ff8855', letterSpacing: '0.15em' }}>{item.label}</span>
                <span style={{ color: item.color, textShadow: `0 0 10px ${item.color}`, fontWeight: 900 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes heartbeat {
            0% { box-shadow: 0 0 0 0 rgba(0,255,136,0.6); }
            70% { box-shadow: 0 0 0 12px rgba(0,255,136,0); }
            100% { box-shadow: 0 0 0 0 rgba(0,255,136,0); }
          }
          @keyframes nucleoPulse {
            0%, 100% { opacity: 0.4; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes recordScan {
            0% { top: 0%; }
            100% { top: 100%; }
          }
          @keyframes cardScan {
            0% { left: -40px; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}
