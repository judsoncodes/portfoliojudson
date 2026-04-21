import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import SceneManager from './SceneManager';
import LoadingScreen from './components/LoadingScreen';
import WaveWash from './components/WaveWash';
import { ScrollProvider } from './context/ScrollContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showWaveWash, setShowWaveWash] = useState(false);

  return (
    <div className="w-full h-full bg-black">
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onComplete={() => {
            setIsLoading(false);
            setShowWaveWash(true);
          }} />
        )}
      </AnimatePresence>

      <Canvas 
        shadows 
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ScrollProvider>
            <SceneManager />
            {showWaveWash && (
              <WaveWash onComplete={() => setShowWaveWash(false)} />
            )}
          </ScrollProvider>
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      {!isLoading && (
        <div className="absolute top-10 left-10 text-white pointer-events-none mix-blend-difference">
          <h1 className="text-4xl font-bold tracking-tighter">JUDSON J</h1>
          <p className="text-sm uppercase tracking-widest opacity-60">Fullstack Developer & ML Enthusiast</p>
        </div>
      )}
    </div>
  );
}

export default App;
