import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sparkles, MeshDistortMaterial, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const SKILLS = [
  { name: 'React', level: 90, color: '#00f2ff', details: 'CORE_ENGINE', logs: ['INIT_REDUX', 'DOM_RECONCILE', 'VIRTUAL_SYNC'] },
  { name: 'Python', level: 85, color: '#ff007b', details: 'LOGIC_CORE', logs: ['NUMPY_COMPUTE', 'PANDAS_FLUX', 'ASYNC_IO'] },
  { name: 'CSS', level: 80, color: '#ffea00', details: 'STYLING_MATRIX', logs: ['FLEX_ALIGN', 'GRID_RENDER', 'GPU_ACCEL'] },
  { name: 'ML/AI', level: 75, color: '#9d00ff', details: 'NEURAL_UNIT', logs: ['TENSOR_TRAIN', 'WEIGHT_UPDATE', 'GRADIENT_DESC'] },
  { name: 'C++', level: 70, color: '#ff4d00', details: 'SYSTEM_KERNEL', logs: ['PTR_ALLOC', 'MEM_MGMT', 'ASM_OPT'] },
  { name: 'Java', level: 72, color: '#00ff44', details: 'LEGACY_BRIDGE', logs: ['JVM_START', 'GC_COLLECT', 'THREADS_SYNC'] },
  { name: 'SQL', level: 78, color: '#0066ff', details: 'DATA_VAULT', logs: ['QUERY_EXEC', 'JOIN_INDEX', 'TX_COMMIT'] },
  { name: 'ThreeJS', level: 65, color: '#ffffff', details: 'VISUAL_ENGINE', logs: ['SHADER_COMP', 'RENDER_PASS', 'GPU_PUSH'] },
];

/**
 * Creates a scrolling data-stream texture for the vertical beams.
 * Optimized to prevent repeated creation.
 */
const createDataStreamTexture = (color) => {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 128, 1024);
  ctx.fillStyle = color;
  ctx.font = 'bold 20px monospace';
  for (let i = 0; i < 40; i++) {
    const text = Math.random() > 0.5 ? '1010101' : '0101110';
    ctx.fillText(text, 10, i * 26);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// Shared geometries for all nodes to save memory
const SHARED_GEO = {
  core: new THREE.IcosahedronGeometry(0.5, 1),
  shell: new THREE.DodecahedronGeometry(0.8, 0),
  beam: new THREE.CylinderGeometry(0.2, 0.2, 40, 8),
  pulse: new THREE.SphereGeometry(0.1, 8, 8)
};

const HyperNode = ({ skill, index, onHover }) => {
  const groupRef = useRef();
  const innerCoreRef = useRef();
  const shellRef = useRef();
  const beamRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const scale = (skill.level / 100) * 0.8 + 0.5;
  const dataTexture = useMemo(() => createDataStreamTexture(skill.color), [skill.color]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime(); // Fix deprecation warning
    
    if (groupRef.current) {
      groupRef.current.position.y += Math.sin(t * 0.5 + index) * 0.005;
      groupRef.current.position.x += Math.cos(t * 0.3 + index) * 0.003;
      groupRef.current.rotation.y += 0.01;
    }

    if (innerCoreRef.current) {
      innerCoreRef.current.scale.setScalar(scale + Math.sin(t * 4) * 0.1);
      innerCoreRef.current.rotation.x += 0.05;
    }
    
    if (shellRef.current) {
      shellRef.current.rotation.z += 0.02;
      shellRef.current.scale.setScalar(1.2 + Math.cos(t * 2) * 0.05);
    }

    if (beamRef.current) {
      beamRef.current.material.map.offset.y -= 0.02;
      beamRef.current.material.opacity = hovered ? 0.8 : 0.2;
    }
  });

  useEffect(() => {
    return () => dataTexture.dispose();
  }, [dataTexture]);

  return (
    <group ref={groupRef} position={skill.initialPos}>
      <Float speed={5} rotationIntensity={2} floatIntensity={2}>
        <mesh 
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(skill); }}
          onPointerOut={() => { setHovered(false); onHover(null); }}
          onClick={(e) => { e.stopPropagation(); onHover(skill); }}
        >
          <mesh ref={innerCoreRef} geometry={SHARED_GEO.core}>
            <MeshDistortMaterial 
              color={skill.color} 
              speed={5} 
              distort={0.4} 
              emissive={skill.color} 
              emissiveIntensity={hovered ? 20 : 5}
              toneMapped={false}
            />
          </mesh>

          <mesh ref={shellRef} geometry={SHARED_GEO.shell}>
            <meshBasicMaterial color={skill.color} wireframe transparent opacity={0.4} />
          </mesh>
          
          <Sparkles count={20} scale={2} size={2} color={skill.color} />
        </mesh>
      </Float>

      <mesh ref={beamRef} position={[0, 0, 0]} geometry={SHARED_GEO.beam}>
        <meshBasicMaterial map={dataTexture} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

const NeuralPulses = ({ nodes }) => {
  const [pulses, setPulses] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const startIdx = Math.floor(Math.random() * nodes.length);
      const endIdx = Math.floor(Math.random() * nodes.length);
      if (startIdx !== endIdx) {
        setPulses(prev => [...prev.slice(-10), { 
          start: nodes[startIdx].initialPos, 
          end: nodes[endIdx].initialPos, 
          color: nodes[startIdx].color, 
          id: Math.random() 
        }]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nodes]);

  return (
    <group>
      {pulses.map(pulse => <Pulse key={pulse.id} {...pulse} />)}
    </group>
  );
};

const Pulse = ({ start, end, color }) => {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      const t = (state.clock.getElapsedTime() % 2) / 2;
      ref.current.position.lerpVectors(new THREE.Vector3(...start), new THREE.Vector3(...end), t);
      ref.current.scale.setScalar(Math.sin(t * Math.PI) * 2);
    }
  });
  return (
    <mesh ref={ref} geometry={SHARED_GEO.pulse}>
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
};

const SkillCreatures = () => {
  const [hoveredSkill, setHoveredSkill] = useState(null);
  
  const nodeData = useMemo(() => SKILLS.map((skill, i) => {
    const angle = (i / SKILLS.length) * Math.PI * 2;
    const layer = (i % 3) - 1; 
    return { 
      ...skill, 
      initialPos: [Math.cos(angle) * 7, (Math.random() - 0.5) * 6, Math.sin(angle) * 7 + layer * 3] 
    };
  }), []);

  return (
    <div className="w-full h-full relative rounded-[3rem] overflow-hidden bg-[#000205] border border-white/5 shadow-2xl group cursor-crosshair">
      <Canvas 
        dpr={[1, 2]} 
        camera={{ position: [0, 0, 20], fov: 45 }}
        onPointerDown={() => setHoveredSkill(null)}
      >
        <fog attach="fog" args={['#000205', 10, 40]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f2ff" />
        
        <NeuralPulses nodes={nodeData} />
        
        {nodeData.map((node, i) => (
          <HyperNode key={node.name} index={i} skill={node} onHover={setHoveredSkill} />
        ))}

        <OrbitControls 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={0.2}
          rotateSpeed={0.5}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Adaptive Holographic Glyphs */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${hoveredSkill ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center p-4 md:p-8 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] w-[90%] max-w-sm">
          <div className="text-[8px] md:text-[10px] font-mono tracking-[0.5em] mb-2" style={{ color: hoveredSkill?.color }}>DIMENSIONAL_SCAN_ACTIVE</div>
          <h2 className="text-3xl md:text-6xl font-black italic tracking-tighter mb-4" style={{ color: hoveredSkill?.color }}>{hoveredSkill?.name.toUpperCase()}</h2>
          <div className="flex flex-col gap-2 font-mono text-[9px] text-white/40 uppercase tracking-widest text-left max-w-xs mx-auto border-t border-white/10 pt-4">
            {hoveredSkill?.logs.map((log, i) => (
              <div key={i} className="flex justify-between gap-8">
                <span className="text-white/20">SIGNAL_{i}</span>
                <span>{log}</span>
                <span className="text-cyan-500">[OK]</span>
              </div>
            ))}
          </div>
          <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full animate-pulse" style={{ width: `${hoveredSkill?.level}%`, backgroundColor: hoveredSkill?.color }} />
          </div>
          <div className="mt-4 md:hidden text-[8px] font-mono text-white/20 tracking-widest uppercase">
            [ Tap background to close ]
          </div>
        </div>
      </div>

      {/* System Status Frame - Hidden on mobile to clear space */}
      <div className="hidden md:flex absolute bottom-8 left-8 right-8 justify-between items-end pointer-events-none opacity-40">
        <div className="flex flex-col gap-1">
          <div className="text-[9px] font-black tracking-[0.3em] text-cyan-400">HYPERDIMENSIONAL_V3.1</div>
          <div className="text-[8px] font-mono text-white/30 tracking-[0.1em]">SYSTEMS: STABLE // CORE: VIBRANT</div>
        </div>
        <div className="text-[8px] font-mono text-white/20 text-right">
          LATENCY: 0.4ms<br/>
          FLUX: NOMINAL
        </div>
      </div>
    </div>
  );
};

export default SkillCreatures;
