import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import SceneManager from './SceneManager';
import LoadingScreen from './components/LoadingScreen';
import ContentLayer from './components/ContentLayer';
import OxygenGauge from './components/OxygenGauge';
import WaveWash from './components/WaveWash';
import DepthNarrative from './components/DepthNarrative';
import CinematicLens from './components/CinematicLens';
import { ScrollProvider, useScroll } from './context/ScrollContext';

import useDeviceProfile from './hooks/useDeviceProfile';

const NarrativeOverlay = () => {
  const { progress } = useScroll();
  const [val, setVal] = React.useState(0);
  
  useEffect(() => {
    let frameId;
    const update = () => {
      setVal(progress.current);
      frameId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frameId);
  }, [progress]);

  return <DepthNarrative scrollProgress={val} />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showWaveWash, setShowWaveWash] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const profile = useDeviceProfile();

  return (
    <div className="w-full h-full bg-black relative">
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onComplete={() => {
            setIsLoading(false);
            setShowWaveWash(true);
          }} />
        )}
      </AnimatePresence>

      <ScrollProvider>
        <Canvas 
          shadows 
          gl={{ antialias: true, alpha: true }}
          dpr={profile.dpr}
          frameloop="always"
          camera={{
            position: [0, 12, 0],
            rotation: [-Math.PI / 2, 0, 0],
            fov: 65,
            near: 0.1,
            far: 200
          }}
          style={{ background: '#00050a' }}
        >
          <color attach="background" args={['#00050a']} />
          <Suspense fallback={null}>
            <SceneManager setHoveredSkill={setHoveredSkill} />
            {showWaveWash && (
              <WaveWash onComplete={() => setShowWaveWash(false)} />
            )}
          </Suspense>
        </Canvas>

        {/* DOM Overlay Layers */}
        {!isLoading && (
          <>
            <ContentLayer setHoveredSkill={setHoveredSkill} />
            <OxygenGauge />
            <NarrativeOverlay />
            
            {/* Skill Tooltip Overlay */}
            {hoveredSkill && (
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 bg-black/90 backdrop-blur-xl border border-white/20 p-4 md:p-6 rounded-2xl text-center shadow-2xl scale-90 md:scale-110 w-[80%] max-w-[300px]">
                <h3 className="text-2xl md:text-3xl font-black mb-2" style={{ color: hoveredSkill.color }}>{hoveredSkill.name.toUpperCase()}</h3>
                <div className="text-white/60 font-mono text-[10px] md:text-sm mb-4">PROFICIENCY: {hoveredSkill.level}%</div>
                <div className="w-full h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                  <div className="h-full" style={{ width: `${hoveredSkill.level}%`, backgroundColor: hoveredSkill.color }} />
                </div>
                <div className="text-white/80 text-[8px] md:text-xs uppercase tracking-widest">{hoveredSkill.yearsExp} YEARS OF EXPERIENCE</div>
              </div>
            )}
          </>
        )}
      </ScrollProvider>
      
      {/* UI Overlay */}
      {!isLoading && (
        <div className="absolute top-3 left-4 md:fixed md:top-10 md:left-10 text-white pointer-events-none mix-blend-difference z-[70]">
          <h1 className="text-lg md:text-4xl font-black tracking-tighter uppercase italic font-outfit">JUDSON J</h1>
          <p className="text-[6px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.6em] opacity-50 font-mono">Abyssal Architect // Fullstack Engineer</p>
        </div>
      )}
      <CinematicLens />
    </div>
  );
}

export default App;
