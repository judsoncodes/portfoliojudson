import React from 'react';
import { motion } from 'framer-motion';

export default function MissionTimeline({ events }) {
  return (
    <div className="relative py-20 pl-8 md:pl-20">
      {/* 🚢 VERTICAL DEPTH LINE */}
      <div className="absolute left-8 md:left-20 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500/50 via-cyan-500/20 to-transparent" />
      
      {/* 🌊 DEPTH MARKERS */}
      <div className="absolute left-[28px] md:left-[76px] top-0 bottom-0 flex flex-col justify-between py-10 pointer-events-none opacity-20 font-mono text-[8px] text-cyan-400">
        {['0M', '2000M', '4000M', '6000M', '8000M', 'MAX'].map(m => <span key={m}>{m}</span>)}
      </div>

      <div className="flex flex-col gap-16 md:gap-24 relative">
        {events.map((event, i) => (
          <motion.div
            key={event.title}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            className="relative"
          >
            {/* 🎯 NODE POINT */}
            <div className="absolute -left-[10px] md:-left-[10px] top-1/2 -translate-y-1/2">
               <div className={`w-4 h-4 rounded-full border-2 border-cyan-400 ${event.status === 'COMPLETED' ? 'bg-cyan-400 shadow-[0_0_15px_#00ffcc]' : 'bg-black'} z-10 relative`} />
               <div className="absolute -inset-2 bg-cyan-400/20 rounded-full blur-sm animate-pulse" />
            </div>

            {/* 📟 LOG CARD */}
            <div className="ml-8 md:ml-12 p-6 md:p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="font-mono text-[10px] text-cyan-500/60 tracking-[0.4em]">
                   {event.date} // {event.status}
                </div>
                <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[9px] font-bold text-cyan-300 tracking-widest uppercase">
                   {event.title}
                </div>
              </div>

              <h3 className="text-xl md:text-3xl font-black text-white italic tracking-tighter mb-4 group-hover:text-cyan-400 transition-colors">
                {event.event}
              </h3>

              {/* Decorative scan line */}
              <div className="w-full h-px bg-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-400/40 w-1/3 animate-[scanLine_3s_infinite_linear]" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        @keyframes scanLine {
          from { transform: translateX(-100%); }
          to { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
