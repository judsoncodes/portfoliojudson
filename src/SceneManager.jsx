import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Lights, OceanBackground, MarineLayer, UILayer } from './components/SceneElements';
import FoodSystem from './components/FoodSystem';
import MarineSnow from './components/MarineSnow';
import useParallax from './hooks/useParallax';
import JellyfishGroup from './components/Jellyfish';
import SonarPulse from './components/SonarPulse';
import SeaFloor from './components/SeaFloor';

import disposalManager from './utils/DisposalManager';
import MemoryMonitor from './components/MemoryMonitor';
import useDeviceProfile from './hooks/useDeviceProfile';

const SceneManager = () => {
  const { gl, camera } = useThree();
  const foodRef = useRef([]); 
  const profile = useDeviceProfile();
  
  // Parallax Hook for layered depth movement
  const parallax = useParallax();
  const scroll = useScroll();
  const sceneGraphRef = useRef();
  
  // Refs for parallax groups
  const fgRef = useRef();
  const midRef = useRef();
  const bgRef = useRef();

  useFrame(() => {
    // Physical Descent: Move the entire scene upward as we scroll
    // The SeaFloor is at y=-12, so moving the group up by 12-15 units 
    // will bring the camera to the seabed.
    if (sceneGraphRef.current) {
      sceneGraphRef.current.position.y = scroll.progress.current * 14;
    }

    // Apply parallax offsets with device-specific multiplier
    const m = profile.parallaxMultiplier;
    if (fgRef.current) {
      fgRef.current.position.x = parallax.x * 0.08 * m;
      fgRef.current.position.y = parallax.y * 0.08 * m;
    }
    if (midRef.current) {
      midRef.current.position.x = parallax.x * 0.04 * m;
      midRef.current.position.y = parallax.y * 0.04 * m;
    }
    if (bgRef.current) {
      bgRef.current.position.x = parallax.x * 0.015 * m;
      bgRef.current.position.y = parallax.y * 0.015 * m;
    }
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      gl.setSize(width, height);
      if (camera.isPerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      disposalManager.disposeAll();
    };
  }, [gl, camera]);

  return (
    <>
      <MemoryMonitor />
      <color attach="background" args={['#010b14']} />
      <fog attach="fog" args={['#010b14', 10, 50]} />
      
      <PerspectiveCamera 
        makeDefault 
        fov={60} 
        near={0.1} 
        far={1000} 
        position={[0, 0, 20]} 
      />
      
      <OrbitControls enableDamping dampingFactor={0.05} />
      
      <Lights />
      
      <group name="SceneGraph">
        <OceanBackground />
        <MarineSnow count={profile.marineSnowCount} />
        <FoodSystem foodRef={foodRef} />
        <JellyfishGroup />
        <SonarPulse />
        <SeaFloor />
        
        {/* Layered Marine Life */}
        <group ref={bgRef} position={[0, 0, -3]}>
          <MarineLayer depth="bg" foodRef={foodRef} counts={profile.boidCounts} />
        </group>

        <group ref={midRef} position={[0, 0, 0]}>
          <MarineLayer depth="mid" foodRef={foodRef} counts={profile.boidCounts} />
        </group>

        <group ref={fgRef} position={[0, 0, 2]}>
          <MarineLayer depth="fg" foodRef={foodRef} counts={profile.boidCounts} />
        </group>
        
        <UILayer />
      </group>
    </>
  );
};

export default SceneManager;
