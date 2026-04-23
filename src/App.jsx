import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import SceneManager from './SceneManager';
import LoadingScreen from './components/LoadingScreen';
import ContentLayer from './components/ContentLayer';
import OxygenGauge from './components/OxygenGauge';
import WaveWash from './components/WaveWash';
import DepthNarrative from './components/DepthNarrative';
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
    <div className="w-full h-full bg-black relative touch-none">
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
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 bg-black/80 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-center shadow-2xl scale-110">
                <h3 className="text-3xl font-black mb-2" style={{ color: hoveredSkill.color }}>{hoveredSkill.name.toUpperCase()}</h3>
                <div className="text-white/60 font-mono text-sm mb-4">PROFICIENCY: {hoveredSkill.level}%</div>
                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                  <div className="h-full" style={{ width: `${hoveredSkill.level}%`, backgroundColor: hoveredSkill.color }} />
                </div>
                <div className="text-white/80 text-xs uppercase tracking-widest">{hoveredSkill.yearsExp} YEARS OF EXPERIENCE</div>
              </div>
            )}
          </>
        )}
      </ScrollProvider>
      
      {/* UI Overlay */}
      {!isLoading && (
        <div className="absolute top-10 left-10 text-white pointer-events-none mix-blend-difference z-50">
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic">JUDSON J</h1>
          <p className="text-xs uppercase tracking-[0.4em] opacity-60">Fullstack Engineer // Machine Learning</p>
        </div>
      )}
    </div>
  );
}

export default App;
