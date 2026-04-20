import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Lights, OceanBackground, MarineLayer, UILayer } from './components/SceneElements';
import CausticsLayer from './components/CausticsLayer';
import FishMesh from './components/FishMesh';

const SceneManager = () => {
  const { gl, camera, size } = useThree();

  useEffect(() => {
    const handleResize = () => {
      // Custom resize logic as requested
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
      
      {/* OrbitControls placeholder - disable in production */}
      <OrbitControls enableDamping dampingFactor={0.05} />

      <Lights />
      
      <group name="SceneGraph">
        <OceanBackground />
        <CausticsLayer />
        <FishMesh />
        
        <MarineLayer depth="bg" />
        <MarineLayer depth="mid" />
        <MarineLayer depth="fg" />
        
        <UILayer />
      </group>
    </>
  );
};

export default SceneManager;
