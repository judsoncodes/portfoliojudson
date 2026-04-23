import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScroll } from '../context/ScrollContext';
import { profileData } from '../data';
import RadarChart from './RadarChart';
import { getInterpolatedZone } from '../utils/depthZones';
import SkillCreatures from './SkillCreatures';
import AboutSection from './AboutSection';
import RecordsSection from './RecordsSection';
import SignalSection from './SignalSection';
import ArtifactsSection from './ArtifactsSection';
import AnchorReturn from './AnchorReturn';

/**
 * Section Component
 * Handles the glassmorphism card and whileInView animations.
 */
const Section = ({ title, children, delay = 0, transparent = false }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="min-h-screen w-full flex items-center justify-center p-2 md:p-12 lg:p-24"
    >
      <motion.div 
        className={`max-w-4xl w-full border border-cyan-400/5 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 overflow-hidden relative group transition-colors duration-700 pointer-events-auto ${transparent ? 'bg-transparent' : ''}`}
        style={{ 
          backgroundColor: 'transparent',
          border: '1px solid rgba(0, 255, 200, 0.05)',
          boxShadow: 'none'
        }}
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
const ContentLayer = ({ setHoveredSkill }) => {
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

  const skillColors = {
    'React': '#00f2ff',
    'Python': '#ff007b',
    'CSS': '#ffea00',
    'ML/AI': '#9d00ff',
    'C++': '#ff4d00',
    'Java': '#00ff44',
    'SQL': '#0066ff',
    'ThreeJS': '#ffffff'
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollVal = scrollTop / (scrollHeight - clientHeight);
    target.current = scrollVal;
  };

  return (
    <div 
      id="abyss-scroll-container"
      className="absolute inset-0 overflow-y-auto scroll-smooth pointer-events-none hide-scrollbar select-none z-40"
      onScroll={handleScroll}
    >
      {/* Hero / About */}
      <Section title="" transparent={true}>
        <AboutSection />
      </Section>

      {/* Arsenal Section - Showcasing Skill Creatures */}
      <Section title="Arsenal" transparent>
        <div className="flex flex-col items-center gap-12">
          {/* Interactive 3D Skill Ecosystem */}
          <div className="w-full h-[600px] rounded-[3rem] border border-white/10 relative overflow-hidden pointer-events-auto shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            <SkillCreatures />
            
            {/* Cinematic Scanning Overlay */}
            <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/30 blur-sm animate-[scan_4s_linear_infinite]" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
          </div>
          
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 pointer-events-auto">
            {profileData.skills.map((skill) => (
              <div 
                key={skill.name} 
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group backdrop-blur-sm"
                style={{ borderTop: `2px solid ${skillColors[skill.name] || 'var(--depth-accent)'}` }}
              >
                <div className="font-bold text-sm mb-1 transition-colors" style={{ color: skillColors[skill.name] || 'var(--depth-accent)' }}>{skill.name}</div>
                <div className="text-[9px] text-white/40 uppercase tracking-widest mb-1">{skill.level}</div>
                <div className="text-[10px] text-white/60 leading-tight">{skill.description}</div>
              </div>
            ))}
          </div>
          
          <div className="text-center text-white/30 text-[10px] uppercase tracking-[0.4em] animate-pulse">
            Hover over creatures below to analyze proficiency
          </div>
        </div>
      </Section>

      {/* Projects */}
      <Section title="" transparent={true}>
        <ArtifactsSection projects={profileData.projects} />
      </Section>

      {/* Achievements / Internships */}
      <Section title="" transparent={true}>
        <RecordsSection />
      </Section>

      {/* Contact */}
      <Section title="" transparent={true}>
        <SignalSection />
      </Section>

      {/* Footer Return - The Anchor */}
      <div style={{ pointerEvents: 'auto' }}>
        <AnchorReturn />
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ContentLayer;

