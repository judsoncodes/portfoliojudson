import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Lights, OceanBackground, MarineLayer, UILayer } from './components/SceneElements';
import CausticsLayer from './components/CausticsLayer';
import FoodSystem from './components/FoodSystem';
import MarineSnow from './components/MarineSnow';
import useParallax from './hooks/useParallax';

const SceneManager = () => {
  const { gl, camera } = useThree();
  const foodRef = useRef([]); 
  
  // Parallax Hook
  const parallax = useParallax();
  
  // Refs for parallax groups
  const fgRef = useRef();
  const midRef = useRef();
  const bgRef = useRef();

  useFrame(() => {
    if (fgRef.current) {
      fgRef.current.position.x = parallax.x * 0.08;
      fgRef.current.position.y = parallax.y * 0.08;
    }
    if (midRef.current) {
      midRef.current.position.x = parallax.x * 0.04;
      midRef.current.position.y = parallax.y * 0.04;
    }
    if (bgRef.current) {
      bgRef.current.position.x = parallax.x * 0.015;
      bgRef.current.position.y = parallax.y * 0.015;
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
    return () => window.removeEventListener('resize', handleResize);
  }, [gl, camera]);

  return (
    <>
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
        <CausticsLayer />
        <MarineSnow />
        <FoodSystem foodRef={foodRef} />
        
        {/* Parallax Layers */}
        <group ref={bgRef} position={[0, 0, -3]}>
          <MarineLayer depth="bg" foodRef={foodRef} />
        </group>

        <group ref={midRef} position={[0, 0, 0]}>
          <MarineLayer depth="mid" foodRef={foodRef} />
        </group>

        <group ref={fgRef} position={[0, 0, 2]}>
          <MarineLayer depth="fg" foodRef={foodRef} />
        </group>
        
        <UILayer />
      </group>
    </>
  );
};

export default SceneManager;
