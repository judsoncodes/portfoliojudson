import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScroll } from '../context/ScrollContext';
import { profileData } from '../data';
import RadarChart from './RadarChart';
import { getInterpolatedZone } from '../utils/depthZones';

/**
 * Section Component
 * Handles the glassmorphism card and whileInView animations.
 */
const Section = ({ title, children, delay = 0 }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="min-h-screen w-full flex items-center justify-center p-6 md:p-24"
    >
      <motion.div 
        className="max-w-5xl w-full backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-16 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative group transition-colors duration-700"
        style={{ backgroundColor: 'rgba(var(--depth-bg-rgb), 0.6)' }}
        data-sonar-target
      >
        {/* Accent Glow */}
        <div 
          className="absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full opacity-20 group-hover:opacity-40 transition-all duration-700"
          style={{ backgroundColor: 'var(--depth-accent)' }}
        />
        
        <div className="relative z-10">
          <h2 
            className="text-4xl md:text-6xl font-black mb-8 tracking-tighter uppercase italic flex items-center gap-4 transition-all duration-500"
            style={{ 
              color: 'var(--depth-accent)',
              textShadow: '0 0 20px var(--depth-accent-glow)'
            }}
          >
            <span className="w-8 h-px bg-current opacity-50" />
            {title}
          </h2>
          <div className="text-white/70 text-lg md:text-xl leading-relaxed font-light">
            {children}
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

/**
 * ContentLayer
 * Renders the portfolio content over the WebGL scene.
 * Syncs real DOM scroll to the virtual scrollProgress context.
 */
/**
 * ContentLayer
 * Renders the portfolio content over the WebGL scene.
 * Syncs real DOM scroll to the virtual scrollProgress context.
 */
const ContentLayer = () => {
  const { target, progress } = useScroll();

  // Sync CSS variables for the entire DOM layer
  useEffect(() => {
    let frameId;
    const syncCSS = () => {
      const zone = getInterpolatedZone(progress.current);
      const root = document.documentElement;
      
      root.style.setProperty('--depth-accent', zone.accent);
      root.style.setProperty('--depth-accent-glow', `${zone.accent}66`); // 40% opacity hex
      
      // Convert hex to RGB for background-color transparency
      const r = parseInt(zone.bg.slice(1, 3), 16);
      const g = parseInt(zone.bg.slice(3, 5), 16);
      const b = parseInt(zone.bg.slice(5, 7), 16);
      root.style.setProperty('--depth-bg-rgb', `${r}, ${g}, ${b}`);
      
      frameId = requestAnimationFrame(syncCSS);
    };

    frameId = requestAnimationFrame(syncCSS);
    return () => cancelAnimationFrame(frameId);
  }, [progress]);

  // Mapping string levels to numerical values for the Radar Chart
  const levelMap = {
    'Proficient': 95,
    'Competent': 80,
    'Intermediate': 65,
    'Beginner': 40
  };

  const radarSkills = profileData.skills.map(s => ({
    name: s.name,
    value: levelMap[s.level] || 50
  }));

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollVal = scrollTop / (scrollHeight - clientHeight);
    target.current = scrollVal;
  };

  return (
    <div 
      className="absolute inset-0 overflow-y-auto scroll-smooth pointer-events-auto hide-scrollbar select-none z-40"
      onScroll={handleScroll}
    >
      {/* Hero / About */}
      <Section title="The Descent">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold tracking-tight transition-colors" style={{ color: 'var(--depth-accent)' }}>{profileData.title}</h3>
          <p className="max-w-2xl">{profileData.summary}</p>
          <div className="pt-8 flex flex-wrap gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--depth-accent)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--depth-accent)' }} />
              {profileData.education[0].institution}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/50 uppercase tracking-widest">
              GPA: {profileData.education[0].gpa}
            </div>
          </div>
        </div>
      </Section>

      {/* Radar Skills Section */}
      <Section title="Arsenal">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2 flex justify-center">
            <RadarChart skills={radarSkills} size={360} />
          </div>
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
            {profileData.skills.map((skill) => (
              <div key={skill.name} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group" style={{ borderLeft: '2px solid var(--depth-accent)' }}>
                <div className="font-bold mb-1 transition-colors" style={{ color: 'var(--depth-accent)' }}>{skill.name}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">{skill.level}</div>
                <div className="text-xs text-white/60 leading-snug">{skill.description}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Projects */}
      <Section title="Artifacts">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } }
          }}
          className="grid md:grid-cols-2 gap-8"
        >
          {profileData.projects.map((proj) => (
            <motion.div 
              key={proj.name}
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1 }
              }}
              className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group flex flex-col justify-between h-full"
              style={{ borderTop: '1px solid var(--depth-accent)' }}
            >
              <div>
                <div className="text-[10px] font-mono mb-4 uppercase tracking-[0.3em]" style={{ color: 'var(--depth-accent)' }}>{proj.period}</div>
                <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors tracking-tight">{proj.name}</h3>
                <p className="text-base text-white/50 leading-relaxed">{proj.description}</p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-all" style={{ color: 'var(--depth-accent)' }}>
                Access Mission Log <span className="text-lg">→</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Achievements / Internships */}
      <Section title="Records">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="font-mono text-sm tracking-[0.3em] uppercase mb-4 opacity-80" style={{ color: 'var(--depth-accent)' }}>Achievements</h4>
            <ul className="space-y-4">
              {profileData.achievements.map((ach, i) => (
                <li key={i} className="flex gap-4 text-sm text-white/70">
                  <span className="font-bold" style={{ color: 'var(--depth-accent)' }}>#0{i+1}</span>
                  {ach}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-mono text-sm tracking-[0.3em] uppercase mb-4 opacity-80" style={{ color: 'var(--depth-accent)' }}>Deployments</h4>
            <ul className="space-y-4">
              {profileData.internships.map((int, i) => (
                <li key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--depth-accent)' }} />
                  <span className="text-sm text-white/80">{int}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Signal">
        <div className="flex flex-col items-center text-center space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-2">Location</span>
              <span className="text-white font-mono">{profileData.contact.location}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-2">Matrix</span>
              <span className="text-white font-mono">{profileData.contact.email}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-2">Link</span>
              <span className="text-white font-mono">{profileData.contact.github}</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <a 
              href={`mailto:${profileData.contact.email}`} 
              className="px-12 py-6 text-white rounded-2xl font-black transition-all transform hover:-translate-y-2 shadow-2xl uppercase tracking-widest"
              style={{ 
                backgroundColor: 'var(--depth-accent)',
                boxShadow: '0 10px 40px var(--depth-accent-glow)'
              }}
            >
              Initiate Uplink
            </a>
          </div>
        </div>
      </Section>

      {/* Footer Space */}
      <div className="h-[40vh] flex items-end justify-center pb-20">
        <div className="text-white/10 text-[9px] font-mono uppercase tracking-[1.5em]">
          SYSTEM ONLINE // {profileData.name} // 2026
        </div>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ContentLayer;

