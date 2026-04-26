import React, { useState } from 'react';

export default function SignalSection() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSend = async () => {
    setSending(true);
    await new Promise(r => setTimeout(r, 2500)); // Simulating deep sea transmission
    setSending(false);
    setSent(true);
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '60px 15px' }}>
      
      {/* 🌊 ABYSSAL SONAR PULSES */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '20px', pointerEvents: 'none' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `clamp(200px, ${i * 30}vw, ${i * 300}px)`, 
            height: `clamp(200px, ${i * 30}vw, ${i * 300}px)`,
            borderRadius: '50%',
            border: '2px solid rgba(0,255,200,0.1)',
            animation: `sonarEpic ${4 + i}s ease-out infinite`,
            animationDelay: `${i * 0.8}s`,
            boxShadow: 'inset 0 0 50px rgba(0,255,200,0.05)',
          }} />
        ))}
      </div>

      {/* 💎 THE UPLINK TERMINAL (Card) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 0%, rgba(0,40,60,0.9) 0%, rgba(0,10,20,1) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,255,200,0.2)',
        borderRadius: '12px',
        boxShadow: '0 0 100px rgba(0,0,0,1), inset 0 0 60px rgba(0,255,200,0.05)',
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* 📟 HEADER: THE FINAL SIGNAL */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00ffcc88', letterSpacing: '0.6em', marginBottom: '15px' }}>
            // FINAL_TRANSMISSION // ABYSSAL_UPLINK
          </div>
          <h2 style={{
            fontFamily: '"Arial Black", sans-serif',
            fontSize: 'clamp(28px, 10vw, 110px)',
            fontWeight: 900, fontStyle: 'italic',
            color: '#fff',
            textShadow: '0 0 30px rgba(0,255,200,0.8), 0 0 60px rgba(0,255,200,0.4)',
            margin: '0',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>SIGNAL</h2>
          <div style={{ 
            height: '4px', 
            background: 'linear-gradient(90deg, transparent, #00ffcc, transparent)', 
            margin: '30px auto', 
            maxWidth: '300px',
            opacity: 0.6
          }} />
        </div>

        {/* 📡 CONNECTION MATRIX */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: 'DOMAIN', value: 'Chennai, India', icon: '⊕' },
            { label: 'ENCRYPTED_ID', value: 'jjudsoncse2024@citchennai.net', icon: '◬' },
            { label: 'UPLINK_CORE', value: 'judsoncodes', icon: '⌬' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center', padding: '0 10px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#00ffcc', letterSpacing: '0.2em', marginBottom: '8px' }}>
                {item.icon} {item.label}
              </div>
              <div style={{
                fontFamily: 'monospace', fontSize: window.innerWidth < 768 ? '11px' : '13px',
                color: 'rgba(200,240,255,0.8)',
                letterSpacing: '0.05em',
                wordBreak: 'break-all',
                overflowWrap: 'anywhere'
              }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* 🧪 TERMINAL FORM */}
        {!sent ? (
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              {['name', 'email'].map(field => (
                <div key={field} style={{ position: 'relative' }}>
                  <div style={{
                    fontFamily: 'monospace', fontSize: '9px',
                    color: '#00ffcc', letterSpacing: '0.2em',
                    marginBottom: '6px', opacity: 0.7
                  }}>{field.toUpperCase()}::</div>
                  <input
                    value={form[field]}
                    onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
                    style={{
                      width: '100%', padding: '12px 16px',
                      background: 'rgba(0,255,200,0.03)',
                      border: '1px solid rgba(0,255,200,0.1)',
                      borderBottom: '2px solid rgba(0,255,200,0.3)',
                      color: '#fff',
                      fontFamily: 'monospace', fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s',
                    }}
                  />
                </div>
              ))}
            </div>
            
            <div style={{ marginBottom: '40px', position: 'relative' }}>
              <div style={{
                fontFamily: 'monospace', fontSize: '9px',
                color: '#00ffcc', letterSpacing: '0.2em',
                marginBottom: '6px', opacity: 0.7
              }}>CONTENT::</div>
              <textarea
                rows={5}
                value={form.message}
                onChange={e => setForm(f => ({...f, message: e.target.value}))}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'rgba(0,255,200,0.03)',
                  border: '1px solid rgba(0,255,200,0.1)',
                  borderBottom: '2px solid rgba(0,255,200,0.3)',
                  color: '#fff',
                  fontFamily: 'monospace', fontSize: '14px',
                  outline: 'none', resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 🍾 HYPER-REALISTIC HORIZONTAL BOTTLE (Send Button) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
              <button
                onClick={handleSend}
                disabled={sending}
                style={{
                  position: 'relative',
                  width: 'clamp(200px, 85vw, 320px)', height: '100px',
                  background: 'none', border: 'none',
                  cursor: sending ? 'wait' : 'pointer',
                  padding: 0,
                  outline: 'none',
                  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: window.innerWidth < 768 ? 'scale(0.7) translateY(-20px)' : 'scale(1)',
                  marginTop: window.innerWidth < 768 ? '-20px' : '0'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px) rotate(-3deg) scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = window.innerWidth < 768 ? 'scale(0.7) translateY(-20px)' : 'translateY(0) rotate(0deg) scale(1)'}
              >
                {/* 🛡️ Caustic Glow under bottle */}
                <div style={{
                  position: 'absolute', bottom: '-15px', left: '15%', width: '70%', height: '30px',
                  background: 'radial-gradient(ellipse, rgba(0,255,200,0.4), transparent 70%)',
                  filter: 'blur(10px)',
                  zIndex: 0
                }} />

                {/* 🪵 The Cork (Horizontal) */}
                <div style={{
                  position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)',
                  width: '30px', height: '36px',
                  background: 'linear-gradient(to right, #4a2c1d, #6d4c3a, #4a2c1d)',
                  borderRadius: '6px 2px 2px 6px',
                  border: '1px solid #3a1c0d',
                  boxShadow: 'inset -5px 0 10px rgba(0,0,0,0.5)',
                  zIndex: 1
                }} />

                {/* 🍾 Bottle Neck (Horizontal) */}
                <div style={{
                  position: 'absolute', left: '25px', top: '50%', transform: 'translateY(-50%)',
                  width: '70px', height: '50px',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(0, 255, 200, 0.3)',
                  borderRight: 'none',
                  borderRadius: '12px 0 0 12px',
                  zIndex: 2
                }} />

                {/* 🍾 Bottle Body (Curved Glass - Horizontal) */}
                <div style={{
                  position: 'absolute', left: '93px', top: '50%', transform: 'translateY(-50%)',
                  width: '180px', height: '130px',
                  background: 'linear-gradient(135deg, rgba(0, 255, 200, 0.1) 0%, rgba(0, 20, 30, 0.7) 100%)',
                  backdropFilter: 'blur(18px)',
                  border: '2px solid rgba(0, 255, 200, 0.4)',
                  borderRadius: '45px 65px 65px 45px',
                  boxShadow: 'inset 0 0 50px rgba(0,255,200,0.15), 0 40px 80px rgba(0,0,0,0.9)',
                  zIndex: 2,
                  overflow: 'hidden'
                }}>
                  {/* Subtle Liquid Line (Horizontal bottom) */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, width: '100%', height: '30%',
                    background: 'rgba(0, 255, 200, 0.05)',
                    borderTop: '1px solid rgba(0, 255, 200, 0.1)'
                  }} />
                </div>

                {/* 📜 The Parchment Scroll (Horizontal) */}
                <div style={{
                  position: 'absolute', left: '115px', top: '50%', transform: 'translateY(-50%)',
                  width: '140px', height: '38px',
                  background: 'linear-gradient(180deg, #d4b45d 0%, #f3e5ab 50%, #d4b45d 100%)',
                  border: '1px solid #b1944e',
                  borderRadius: '4px',
                  boxShadow: '4px 8px 20px rgba(0,0,0,0.5)',
                  zIndex: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: sending ? 'bottleLaunch 0.3s infinite alternate' : 'none'
                }}>
                  <div style={{ position: 'absolute', left: '45%', top: 0, width: '8px', height: '100%', background: '#800' }} />
                  <span style={{ 
                    fontFamily: 'monospace', fontSize: '12px', fontWeight: 900, color: '#321', 
                    letterSpacing: '0.25em', textTransform: 'uppercase'
                  }}>
                    {sending ? 'SIGNALING' : 'INITIATE'}
                  </span>
                </div>

                {/* ✨ Advanced Specular Highlights (Horizontal) */}
                <div style={{
                  position: 'absolute', top: '42px', left: '110px', width: '120px', height: '6px',
                  background: 'linear-gradient(to right, rgba(255,255,255,0.4), transparent)',
                  borderRadius: '100px', filter: 'blur(1px)', zIndex: 4
                }} />
                <div style={{
                  position: 'absolute', bottom: '42px', left: '130px', width: '80px', height: '3px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '100px', filter: 'blur(1px)', zIndex: 4
                }} />

                {/* 🖋️ Etched ID */}
                <div style={{
                  position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%) rotate(90deg)',
                  fontFamily: 'monospace', fontSize: '8px', color: 'rgba(0,255,200,0.2)',
                  letterSpacing: '0.5em', zIndex: 4, whiteSpace: 'nowrap'
                }}>LVTHN_77</div>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{
              fontFamily: '"Arial Black", monospace',
              fontSize: '24px', color: '#00ffcc',
              textShadow: '0 0 30px rgba(0,255,200,1)',
              letterSpacing: '0.3em', marginBottom: '20px',
            }}>SIGNAL_LAUNCHED</div>
            <div style={{ fontFamily: 'monospace', fontSize: '14px', color: '#00ffcc88', letterSpacing: '0.2em' }}>
              The bottle is adrift in the abyssal current. 
              Transmission success.
            </div>
            {/* Animated floating bottle icon */}
            <div style={{ marginTop: '40px', fontSize: '40px', animation: 'bottleFloat 3s infinite ease-in-out' }}>
              🍾
            </div>
          </div>
        )}

        {/* 🗺️ ABYSSAL COORDINATES */}
        <div style={{
          marginTop: '80px', textAlign: 'center',
          fontFamily: 'monospace', fontSize: '10px',
          color: '#00ffcc44', letterSpacing: '0.4em',
        }}>
          COORD_LAT: 13.0827°N // COORD_LON: 80.2707°E // STATE: DEPLOYED // SECTOR: JUDSON_FINAL
        </div>
      </div>

      <style>{`
        @keyframes sonarEpic {
          0% { transform: translate(-50%,-50%) scale(0.4); opacity: 0; }
          50% { opacity: 0.4; }
          100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
        }
        @keyframes bottleFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(15deg); }
        }
        @keyframes bottleLaunch {
          from { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          to { transform: translate(-50%, -50%) scale(0.9); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
