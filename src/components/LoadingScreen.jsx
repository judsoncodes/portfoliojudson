import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const statusMessages = [
  'Initializing aquatic engine...',
  'Loading GLSL shaders...',
  'Spawning marine entities...',
  'Synchronizing light caustics...',
  'Calibrating depth sensors...',
  'Ready to descend.'
];

const GodRays = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <div className="absolute -top-[50%] -left-[20%] w-[150%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_0%,transparent_0deg,rgba(34,211,238,0.1)_20deg,transparent_40deg,rgba(34,211,238,0.1)_60deg,transparent_80deg)] animate-[spin_20s_linear_infinite]" />
    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent" />
  </div>
);

const MarineSnow = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * -20
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-200/40 blur-[1px]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: ['-10vh', '110vh'],
            x: [`${p.x}%`, `${p.x + (Math.sin(p.id) * 10)}%`],
            opacity: [0, 1, 1, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

const LoadingScreen = ({ onComplete }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const progressBarRef = useRef(null);
  const progressTextRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < statusMessages.length - 1) return prev + 1;
        clearInterval(messageInterval);
        return prev;
      });
    }, 700);

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(".loading-content", {
          filter: "blur(20px) brightness(2)",
          opacity: 0,
          scale: 1.5,
          duration: 1.5,
          ease: "power4.in",
          onComplete: onComplete
        });
      }
    });

    tl.to(progressBarRef.current, {
      width: '100%',
      duration: 5,
      ease: 'power2.inOut',
      onUpdate: function () {
        const progress = Math.round(this.progress() * 100);
        if (progressTextRef.current) {
          progressTextRef.current.innerText = progress.toString().padStart(3, '0');
        }
      }
    });

    // Animate the displacement filter for "wavy" effect
    gsap.to("#turb", {
      attr: { baseFrequency: "0.01 0.05" },
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    return () => {
      clearInterval(messageInterval);
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#00040a] flex flex-col items-center justify-center font-mono text-cyan-400 select-none overflow-hidden">
      {/* Visual FX Layers */}
      <GodRays />
      <MarineSnow />

      {/* SVG Filters for Liquid Effect */}
      <svg className="hidden">
        <filter id="liquid">
          <feTurbulence id="turb" type="fractalNoise" baseFrequency="0.01 0.1" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" />
        </filter>
      </svg>

      <div className="loading-content w-full max-w-lg px-12 relative z-10 flex flex-col items-center" style={{ filter: 'url(#liquid)' }}>

        {/* Extraordinary Centerpiece */}
        <div className="relative mb-20 group">
          <motion.div
            className="w-24 h-24 border-2 border-cyan-500/30 rounded-full flex items-center justify-center relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full shadow-[0_0_20px_#22d3ee]" />
            <div className="w-12 h-12 bg-cyan-900/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <motion.div
                className="w-4 h-4 bg-cyan-400 rounded-sm"
                animate={{ scale: [1, 1.5, 1], rotate: [45, 135, 45] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Scanning Line */}
          <motion.div
            className="absolute -inset-4 border-l-2 border-cyan-400/50"
            animate={{ left: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="w-full">
          {/* Header */}
          <div className="flex justify-between items-end mb-4 border-b border-cyan-900/50 pb-2">
            <div>
              <h2 className="text-[12px] uppercase tracking-[0.5em] font-black text-cyan-200">System.Initialize</h2>
              <p className="text-[9px] opacity-40">ENCRYPTION: AES-256-GCM</p>
            </div>
            <div className="text-right">
              <span className="text-[20px] font-bold leading-none tracking-tighter" ref={progressTextRef}>000</span>
              <span className="text-[10px] opacity-50 ml-1">%</span>
            </div>
          </div>

          {/* Message Area */}
          <div className="h-10 mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                transition={{ duration: 0.3 }}
                className="text-[11px] tracking-[0.1em] text-cyan-300/80 flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                {statusMessages[currentMessageIndex]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Liquid Progress Bar */}
          <div className="relative h-2 bg-cyan-950/30 rounded-full overflow-hidden backdrop-blur-md border border-cyan-500/10">
            <div
              ref={progressBarRef}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-300 shadow-[0_0_25px_#22d3ee]"
              style={{ width: '0%' }}
            />
            {/* Wave Overlay */}
            <motion.div
              className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)]"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="mt-6 flex justify-between opacity-30 text-[8px] tracking-[0.3em] uppercase">
            <span>Lat: 12.9817° N</span>
            <span>Lon: 80.2184° E</span>
          </div>
        </div>
      </div>

      {/* Background Caustics (CSS) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scale-[3]" />

      {/* Bottom Label */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <span className="text-[9px] tracking-[0.6em] opacity-40 uppercase">Abyssal Protocol Activated</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
