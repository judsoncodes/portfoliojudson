import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

const NODES = [
  { type: "ATMOSPHERE", title: "LUMEN CONTROL", label: "TOGGLE AMBIENCE", desc: "ADJUSTS BIOLUMINESCENCE", color: "#00ffcc" },
  { type: "ARCHIVE", title: "DATA REPOSITORY", label: "LOAD PROJECTS", desc: "ENCRYPTED ARCHIVE LOGS", color: "#00ccff" },
  { type: "ECOSYSTEM", title: "BIOME MANAGER", label: "EMIT SONAR", desc: "REGULATES MARINE LIFE", color: "#ccff00" }
];

// Main screen texture
const createDisplayTexture = (node, isActive) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 320;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000810'; ctx.fillRect(0, 0, 512, 320);
  ctx.strokeStyle = node.color; ctx.lineWidth = 10; ctx.strokeRect(0, 0, 512, 320);
  ctx.fillStyle = node.color; ctx.font = 'bold 40px monospace'; ctx.textAlign = 'center'; ctx.fillText(node.title, 256, 80);
  ctx.fillStyle = '#88ccdd'; ctx.font = '24px monospace'; ctx.fillText(node.desc, 256, 150);
  ctx.fillStyle = isActive ? node.color : '#334455'; ctx.font = 'bold 28px monospace'; ctx.fillText(isActive ? "STATUS: ACTIVE" : "STATUS: STANDBY", 256, 210);
  ctx.fillStyle = node.color; ctx.fillRect(50, 240, 412, 50);
  ctx.fillStyle = '#000'; ctx.font = 'bold 22px monospace'; ctx.fillText(`CLICK: ${node.label}`, 256, 272);
  return new THREE.CanvasTexture(canvas);
};

// Hologram popup texture
const createHologramLabelTexture = (node) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 128); // Transparent background
  
  // Glowing border
  ctx.strokeStyle = node.color;
  ctx.lineWidth = 4;
  ctx.strokeRect(5, 5, 502, 118);
  
  // Fill background slightly
  ctx.fillStyle = node.color;
  ctx.globalAlpha = 0.1;
  ctx.fillRect(5, 5, 502, 118);
  ctx.globalAlpha = 1.0;

  ctx.fillStyle = node.color;
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = node.color;
  ctx.shadowBlur = 10;
  ctx.fillText(`> ${node.label}`, 256, 75);
  
  return new THREE.CanvasTexture(canvas);
};

const ControlNode = ({ node, position }) => {
  const groupRef = useRef();
  const screenRef = useRef();
  const labelRef = useRef();
  const [isActive, setIsActive] = useState(false);
  const { scene } = useThree();

  const texture = useMemo(() => createDisplayTexture(node, isActive), [node, isActive]);
  const holoTexture = useMemo(() => createHologramLabelTexture(node), [node]);

  const onOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    gsap.to(screenRef.current.material, { emissiveIntensity: 3, duration: 0.3 });
    gsap.to(labelRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(1.7)' });
    gsap.to(labelRef.current.position, { y: 1.8, duration: 0.5 });
  };

  const onOut = () => {
    document.body.style.cursor = 'auto';
    gsap.to(screenRef.current.material, { emissiveIntensity: 0.6, duration: 0.3 });
    gsap.to(labelRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.3 });
    gsap.to(labelRef.current.position, { y: 1.4, duration: 0.3 });
  };

  const performAction = (e) => {
    if (e) e.stopPropagation();
    const newActive = !isActive;
    setIsActive(newActive);
    gsap.fromTo(groupRef.current.scale, { x: 0.9, y: 0.9, z: 0.9 }, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out(2)' });

    if (node.type === "ATMOSPHERE") {
      gsap.to(scene.fog, { density: newActive ? 0.05 : 0.02, duration: 1.5 });
      gsap.to(scene.background, { r: newActive ? 0.02 : 0.01, duration: 1.5 });
    }
    
    if (node.type === "ECOSYSTEM") {
      const geo = new THREE.TorusGeometry(0.5, 0.05, 16, 32);
      const mat = new THREE.MeshBasicMaterial({ color: node.color, transparent: true });
      const pulse = new THREE.Mesh(geo, mat);
      pulse.position.copy(groupRef.current.position);
      pulse.rotation.x = Math.PI/2;
      scene.add(pulse);
      gsap.to(pulse.scale, { x: 100, y: 100, z: 100, duration: 2.5, onComplete: () => {
        scene.remove(pulse);
        geo.dispose();
        mat.dispose();
      }});
      gsap.to(pulse.material, { opacity: 0, duration: 2.5 });
    }

    if (node.type === "ARCHIVE") {
      window.open("https://github.com/judsoncodes", "_blank");
    }
  };

  return (
    <group ref={groupRef} position={position} onPointerOver={onOver} onPointerOut={onOut} onClick={performAction}>
      {/* Sunken Housing */}
      <mesh>
        <boxGeometry args={[2.5, 1.6, 0.2]} />
        <meshStandardMaterial color="#050505" metalness={1} roughness={0.1} />
      </mesh>

      {/* Primary Display Screen */}
      <mesh ref={screenRef} position={[0, 0, 0.11]}>
        <planeGeometry args={[2.3, 1.4]} />
        <meshStandardMaterial map={texture} emissive={node.color} emissiveIntensity={0.6} />
      </mesh>

      {/* Floating Holographic Label (Appears on Hover) */}
      <group ref={labelRef} position={[0, 1.4, 0.5]} scale={[0, 0, 0]}>
        {/* Holographic Text Label */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[2.5, 0.6]} />
          <meshBasicMaterial map={holoTexture} transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
        {/* Glowing Aura */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.6, 0.7]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.15} />
        </mesh>
        <pointLight intensity={3} color={node.color} distance={4} />
      </group>

      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={node.color} />
        <pointLight intensity={isActive ? 8 : 1} color={node.color} distance={6} />
      </mesh>
    </group>
  );
};

const ProjectPanels = () => {
  return (
    <group>
      {NODES.map((node, i) => (
        <ControlNode key={i} node={node} position={[(i - 1) * 4.5, -11, 8]} />
      ))}
    </group>
  );
};

export default ProjectPanels;
