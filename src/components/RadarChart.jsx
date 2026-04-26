import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RadarChart Component
 * Pure SVG + JS math to render a skill achievement radar.
 */
/**
 * SkillConnections Component
 * Draws quadratic Bezier curves between related skills when one is hovered.
 */
const SkillConnections = ({ hoveredIndex, skills, points, center }) => {
  // Define relationships between skills
  const connections = {
    'Fullstack': ['React.js', 'SQL'],
    'Python': ['SQL'],
    'C++': ['Java'],
    'React.js': ['Fullstack'],
    'SQL': ['Fullstack'],
    'Java': ['C++']
  };

  if (hoveredIndex === null) return null;

  const currentSkill = skills[hoveredIndex];
  const relatedSkills = connections[currentSkill.name] || [];
  const startPoint = points[hoveredIndex];

  return (
    <g style={{ pointerEvents: 'none' }}>
      {relatedSkills.map((relatedName) => {
        const targetIndex = skills.findIndex(s => s.name === relatedName);
        if (targetIndex === -1) return null;
        
        const endPoint = points[targetIndex];
        
        // Control point for quadratic bezier - pulled slightly toward center for curve
        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;
        
        // Pull the control point toward center to create an elegant curve
        const pull = 0.3;
        const cpX = midX + (center - midX) * pull;
        const cpY = midY + (center - midY) * pull;

        const pathData = `M ${startPoint.x} ${startPoint.y} Q ${cpX} ${cpY} ${endPoint.x} ${endPoint.y}`;

        return (
          <React.Fragment key={`${currentSkill.name}-${relatedName}`}>
            {/* Connection Line */}
            <motion.path
              d={pathData}
              fill="none"
              stroke="var(--depth-accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            
            {/* Traveling Pulse Particle */}
            <motion.path
              d={pathData}
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="0 1" // Small dot
              initial={{ pathOffset: 0, pathLength: 0.05, opacity: 0 }}
              animate={{ pathOffset: 1, opacity: [0, 1, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "linear",
                times: [0, 0.2, 1] 
              }}
            />
          </React.Fragment>
        );
      })}
    </g>
  );
};

const RadarChart = ({ skills = [], size = 320 }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const radius = size / 2.5;
  const center = size / 2;
  const angleStep = (Math.PI * 2) / skills.length;

  // Calculate points for the actual data polygon
  const points = useMemo(() => {
    return skills.map((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + Math.cos(angle) * (radius * (skill.value / 100));
      const y = center + Math.sin(angle) * (radius * (skill.value / 100));
      return { x, y, angle };
    });
  }, [skills, radius, center, angleStep]);

  // SVG points string for animation
  const dataPointsString = useMemo(() => {
    return points.map(p => `${p.x},${p.y}`).join(' ');
  }, [points]);

  const centerPointsString = useMemo(() => {
    return skills.map(() => `${center},${center}`).join(' ');
  }, [skills, center]);

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="relative flex flex-col items-center justify-center select-none group">
      <svg width={size} height={size} className="overflow-visible pointer-events-none">
        <defs>
          <radialGradient id="radar-glow">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.4)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
          </radialGradient>
        </defs>

        {/* Background Grids */}
        {gridLevels.map((level, idx) => {
          const gridPoints = skills.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + Math.cos(angle) * (radius * level);
            const y = center + Math.sin(angle) * (radius * level);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={`grid-${idx}`}
              points={gridPoints}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis Lines */}
        {skills.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              strokeDasharray={hoveredIndex === i ? "none" : "2 2"}
              className="transition-all duration-300"
            />
          );
        })}

        {/* Data Polygon */}
        <motion.polygon
          initial={{ points: centerPointsString, opacity: 0 }}
          animate={{ points: dataPointsString, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          fill="url(#radar-glow)"
          stroke="var(--depth-accent)"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 12px var(--depth-accent-glow))' }}
        />

        {/* Skill Connections Layer */}
        <AnimatePresence>
          <SkillConnections 
            hoveredIndex={hoveredIndex} 
            skills={skills} 
            points={points} 
            center={center} 
          />
        </AnimatePresence>

        {/* Interactive Axis Handles & Labels */}
        {skills.map((skill, i) => {
          const labelAngle = i * angleStep - Math.PI / 2;
          const labelDist = window.innerWidth < 768 ? radius + 55 : radius + 40;
          const lx = center + Math.cos(labelAngle) * labelDist;
          const ly = center + Math.sin(labelAngle) * labelDist;

          return (
            <g 
              key={`label-${i}`} 
              className="pointer-events-auto cursor-help"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <circle cx={lx} cy={ly} r="30" fill="transparent" />
              
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                cx={points[i].x}
                cy={points[i].y}
                r={hoveredIndex === i ? 5 : 3}
                fill={hoveredIndex === i ? "#fff" : "var(--depth-accent)"}
                className="transition-all duration-300"
              />

              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                className={`text-[10px] font-mono tracking-tighter uppercase transition-all duration-500 ${
                  hoveredIndex === i ? 'font-bold' : 'fill-white/40'
                }`}
                style={{ fill: hoveredIndex === i ? 'var(--depth-accent)' : 'rgba(255,255,255,0.4)' }}
              >
                <tspan x={lx} dy="0">{skill.name}</tspan>
                <tspan x={lx} dy="12" className="fill-white/20">{skill.value}%</tspan>
              </text>
            </g>
          );
        })}
      </svg>


      {/* Hover Tooltip Overlay */}
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -bottom-12 px-4 py-2 bg-cyan-950/80 backdrop-blur-md border border-cyan-500/30 rounded-xl text-[11px] font-mono text-cyan-300 z-50 shadow-2xl pointer-events-none"
          >
            {skills[hoveredIndex].name} : {skills[hoveredIndex].value}% Proficiency
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RadarChart;
