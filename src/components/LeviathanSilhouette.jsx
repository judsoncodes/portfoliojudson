import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function LeviathanSilhouette() {
  const groupRef = useRef();

  // Create an elegant, simple silhouette of a massive whale
  const { bodyShape, finShape } = useMemo(() => {
    const body = new THREE.Shape();
    // Nose
    body.moveTo(-25, 0); 
    // Smooth back
    body.bezierCurveTo(-15, 6, 10, 4, 25, 0); 
    // Top of tail
    body.bezierCurveTo(35, -2, 45, 3, 50, 6); 
    // Tail notch
    body.lineTo(46, 0); 
    // Bottom of tail
    body.lineTo(50, -6); 
    // Bottom tail base
    body.bezierCurveTo(45, -3, 35, 1, 25, -2); 
    // Deep belly
    body.bezierCurveTo(5, -12, -15, -6, -25, 0); 

    const fin = new THREE.Shape();
    fin.moveTo(0, 0);
    fin.bezierCurveTo(-5, -6, -8, -15, -2, -18);
    fin.bezierCurveTo(2, -12, 5, -5, 0, 0);

    return { bodyShape: body, finShape: fin };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.1; // Extremely slow, peaceful movement
    
    if (groupRef.current) {
        // The whale swims slowly across the entire background
        const duration = 120; // 120 seconds to cross
        const progress = (t % duration) / duration;
        
        // Moves from far right to far left
        groupRef.current.position.x = 100 - (200 * progress);
        
        // Majestic, slow bobbing
        groupRef.current.position.y = 8 + Math.sin(t * 1.5) * 3;
        
        // Very subtle swimming undulation (pitch)
        groupRef.current.rotation.z = Math.sin(t * 3.0) * 0.05;
        
        // Slight tilt towards the camera to show the silhouette
        groupRef.current.rotation.x = 0.2;
    }
  });

  return (
    // Placed precisely at z = -35 so it emerges as a dark shadow inside the fog layer
    <group ref={groupRef} position={[0, 10, -35]} scale={[0.8, 0.8, 0.8]}>
       
       {/* Main Body */}
       <mesh>
         <shapeGeometry args={[bodyShape]} />
         <meshBasicMaterial 
            color="#000204" // Pitch black
            transparent
            opacity={0.9}
            fog={true} // Natural fog blending
            side={THREE.DoubleSide}
         />
       </mesh>

       {/* Front Pectoral Fin */}
       <mesh position={[-5, -4, 2]} rotation={[0, 0, 0.2]}>
         <shapeGeometry args={[finShape]} />
         <meshBasicMaterial color="#000204" transparent opacity={0.9} fog={true} side={THREE.DoubleSide} />
       </mesh>

       {/* Back Pectoral Fin (slightly darker/smaller to fake depth) */}
       <mesh position={[-3, -3, -2]} rotation={[0, 0, -0.2]} scale={0.8}>
         <shapeGeometry args={[finShape]} />
         <meshBasicMaterial color="#000102" transparent opacity={0.7} fog={true} side={THREE.DoubleSide} />
       </mesh>

    </group>
  );
}
