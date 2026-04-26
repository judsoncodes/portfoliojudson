import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Lights, OceanBackground, MarineLayer, UILayer } from './components/SceneElements';
import FoodSystem from './components/FoodSystem';
import MarineSnow from './components/MarineSnow';
import useParallax from './hooks/useParallax';
import JellyfishGroup from './components/Jellyfish';
import SonarPulse from './components/SonarPulse';
import SeaFloor from './components/SeaFloor';
import { useScroll } from './context/ScrollContext';
import CoralSystem from './components/CoralSystem';
import KelpForest from './components/KelpForest';
import SeabedDetails from './components/SeabedDetails';
import Starfish from './components/Starfish';
import Crab from './components/Crab';
import Octopus from './components/Octopus';
import FishSystem from './components/FishSystem';
import MantaRay from './components/MantaRay';
import ProjectPanels from './components/ProjectPanels';
import CurrentStreams from './components/CurrentStreams';
import BubbleVents from './components/BubbleVents';
import HydrothermalVents from './components/HydrothermalVents';
import AbyssalRuins from './components/AbyssalRuins';
import LeviathanSilhouette from './components/LeviathanSilhouette';
import CausticsLayer from './components/CausticsLayer';
import { getInterpolatedZone } from './utils/depthZones';
import PlanktonTrails from './components/PlanktonTrails';

import disposalManager from './utils/DisposalManager';
import MemoryMonitor from './components/MemoryMonitor';
import useDeviceProfile from './hooks/useDeviceProfile';
import VolumetricLighting from './components/VolumetricLighting';
import { EffectComposer, RenderPass, UnrealBloomPass } from 'three-stdlib';

const SceneManager = ({ setHoveredSkill }) => {
  const { gl, camera, scene, size } = useThree();
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

  const composer = useRef();

  useEffect(() => {
    // Initialize Post-Processing
    gl.autoClear = false;
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      1.2, // intensity
      0.6, // radius
      0.95 // threshold - only very bright things glow
    );
    
    const comp = new EffectComposer(gl);
    comp.addPass(renderPass);
    comp.addPass(bloomPass);
    composer.current = comp;

    return () => {
      gl.autoClear = true;
      comp.dispose();
    };
  }, [gl, scene, camera, size]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const s = scroll.progress.current;

    // 1. Dynamic Bloom Modulation
    if (composer.current) {
      const bloomPass = composer.current.passes[1];
      const pulse = Math.sin(t * 0.5) * 0.1;
      bloomPass.strength = (0.35 + pulse) * (1 - s * 0.4); 
      composer.current.render();
    }

    // 2. Dynamic Fog & Background
    const zone = getInterpolatedZone(s);
    const fogColor = new THREE.Color(zone.bg);
    state.scene.fog.color.copy(fogColor);
    state.scene.fog.near = THREE.MathUtils.lerp(5, 2, s);
    state.scene.fog.far = THREE.MathUtils.lerp(45, 25, s);
    state.scene.background.copy(fogColor);

    // Camera descends from y=12 (above surface) to y=-12 (seabed) as user scrolls
    // Adjusted path to ensure sun and monitors are visible
    const targetY = 12 - (s * 24); 
    const targetZ = 12 + (s * 8); // Pull back slightly as we descend for wider view of panels
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    
    // Tilt: Start looking at horizon/sky, then tilt down into water, then look at panels
    const targetPitch = -Math.PI / 4 + (s * Math.PI / 3); 
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetPitch, 0.05);

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
  }, 1);

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
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#010b14', 5, 45]} />
      
      <Lights />
      <VolumetricLighting />
      
      <group name="SceneGraph" ref={sceneGraphRef}>
        <OceanBackground />
        <CausticsLayer />
        <MarineSnow count={profile.marineSnowCount} />
        <CurrentStreams />
        <BubbleVents />
        <FoodSystem foodRef={foodRef} />
        <group position={[0, -3, 0]}>
          <JellyfishGroup />
        </group>
        <SonarPulse />
        <SeaFloor />
        <HydrothermalVents />
        <AbyssalRuins />
        <LeviathanSilhouette />
        <CoralSystem />
        <KelpForest />
        <SeabedDetails />
        <Starfish />
        <Crab />
        <Octopus />
        <FishSystem />
        <MantaRay />
        <ProjectPanels />
        <PlanktonTrails />


        
        {/* Layered Marine Life - Distributed along the descent path */}
        <group ref={bgRef} position={[0, -9, -3]}>
          <MarineLayer depth="bg" foodRef={foodRef} counts={profile.boidCounts} />
        </group>

        <group ref={midRef} position={[0, -5, 0]}>
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
