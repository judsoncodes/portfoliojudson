import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import SceneManager from './SceneManager';
import LoadingScreen from './components/LoadingScreen';
import ContentLayer from './components/ContentLayer';
import OxygenGauge from './components/OxygenGauge';
import WaveWash from './components/WaveWash';
import { ScrollProvider } from './context/ScrollContext';

import useDeviceProfile from './hooks/useDeviceProfile';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showWaveWash, setShowWaveWash] = useState(false);
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
          frameloop="demand"
        >
          <Suspense fallback={null}>
            <SceneManager />
            {showWaveWash && (
              <WaveWash onComplete={() => setShowWaveWash(false)} />
            )}
          </Suspense>
        </Canvas>

        {/* DOM Overlay Layers */}
        {!isLoading && (
          <>
            <ContentLayer />
            <OxygenGauge />
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
