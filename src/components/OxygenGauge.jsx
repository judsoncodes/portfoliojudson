import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScroll } from '../context/ScrollContext';

/**
 * OxygenGauge Component
 * A DOM-based overlay that visualizes depth/oxygen progress.
 * Now a direct DOM component (outside Canvas) for reliable layering.
 */
const OxygenGauge = () => {
  const { progress: scrollProgressRef } = useScroll();
  const [progress, setProgress] = useState(0);

  // Sync state with the global scroll ref
  useEffect(() => {
    let frameId;
    const sync = () => {
      // Direct ref access is safe here as sync is recursive
      const currentProgress = scrollProgressRef.current;
      setProgress(currentProgress);
      frameId = requestAnimationFrame(sync);
    };
    frameId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frameId);
  }, [scrollProgressRef]); // Only depend on the Ref object, not the state value

  // Calculate inverted bubble properties
  const bubbleOpacity = 1 - (progress * 0.7); 
  const oxygenLevel = 1 - progress; 

  return (
    <div className="fixed right-8 md:right-16 top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none select-none z-[60]">
        
        {/* Depth Label */}
        <div className="mb-6 flex flex-col items-center">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase mb-1 opacity-50" style={{ color: 'var(--depth-accent)' }}>Depth Status</span>
          <div 
            className="text-2xl font-mono font-bold tabular-nums transition-all duration-500"
            style={{ 
              color: 'var(--depth-accent)',
              textShadow: '0 0 15px var(--depth-accent-glow)'
            }}
          >
            {Math.round(progress * 10984)}<span className="text-xs ml-1 opacity-50">m</span>
          </div>
        </div>

        {/* The Gauge Container */}
        <div className="relative w-16 h-[320px] flex justify-center">
          
          {/* SVG for path-based animation */}
          <svg width="64" height="320" viewBox="0 0 64 320" className="overflow-visible">
            {/* Gauge Background Track */}
            <path 
              d="M 32 310 L 32 10" 
              stroke="rgba(34, 211, 238, 0.1)" 
              strokeWidth="12" 
              strokeLinecap="round" 
              fill="none"
            />

            {/* Tick Marks */}
            {[0.25, 0.5, 0.75].map((t) => (
              <g key={t} transform={`translate(0, ${310 - t * 300})`}>
                <line x1="20" y1="0" x2="44" y2="0" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
                <text x="48" y="4" fill="white" fillOpacity="0.2" fontSize="9" className="font-mono italic">
                  {Math.round(t * 100)}%
                </text>
              </g>
            ))}

            {/* Animated Path using stroke-dashoffset */}
            <motion.path
              d="M 32 310 L 32 10"
              stroke="var(--depth-accent)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="300"
              animate={{
                strokeDashoffset: progress * 300
              }}
              transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              style={{ filter: 'drop-shadow(0 0 10px var(--depth-accent))' }}
            />
          </svg>

          <div 
            className="absolute inset-0 flex justify-center items-center pointer-events-none"
            style={{
              clipPath: `inset(${(1 - oxygenLevel) * 100}% 0 0 0)`,
              transition: 'clip-path 0.1s linear'
            }}
          >
            <div 
              className="w-[1px] h-[300px] opacity-40 blur-[1px]" 
              style={{ background: 'linear-gradient(to top, transparent, var(--depth-accent), white)' }}
            />
          </div>

          {/* Floating Bubbles Container */}
          <div className="absolute inset-0 overflow-hidden" style={{ opacity: bubbleOpacity }}>
            <AnimatePresence mode="popLayout">
              {Array.from({ length: Math.ceil(8 * (1 - progress)) + 2 }).map((_, i) => (
                <Bubble key={`bubble-${i}`} index={i} progress={progress} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Label */}
        <div className="mt-6 flex flex-col items-center">
          <div className="h-px w-8 mb-2 opacity-30" style={{ backgroundColor: 'var(--depth-accent)' }} />
          <div className="text-[9px] text-white/30 font-mono tracking-[0.5em] [writing-mode:vertical-lr] uppercase h-24">
            Oxygen Reserve
          </div>
        </div>
    </div>
  );
};

/**
 * Single Floating Bubble Component
 * Speed and existence driven by depth progress.
 */
const Bubble = ({ index, progress }) => {
  // Bubbles travel faster when shallower (progress near 0)
  // Higher progress (deeper) = slower duration
  const duration = useMemo(() => 1.5 + Math.random() * 2 + (progress * 4), [progress]);
  const size = useMemo(() => 2 + Math.random() * 4, []);
  const xOffset = useMemo(() => (Math.random() - 0.5) * 20, []);

  return (
    <motion.div
      className="absolute bottom-0 w-1 h-1 bg-white/40 rounded-full blur-[0.5px]"
      style={{
        width: size,
        height: size,
        left: `calc(50% + ${xOffset}px)`
      }}
      animate={{
        y: [0, -320],
        opacity: [0, 0.8, 0],
        scale: [0.5, 1.2, 0.8],
        x: [`calc(50% + ${xOffset}px)`, `calc(50% + ${xOffset + (Math.random() - 0.5) * 10}px)`]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear",
        delay: index * 0.7
      }}
    />
  );
};

export default OxygenGauge;
