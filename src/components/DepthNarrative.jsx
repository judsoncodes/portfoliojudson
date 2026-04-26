import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./DepthNarrative.css";

const waypoints = [
  { scroll: 0.00, text: "[SYSTEM]: INITIALIZING DESCENT SEQUENCE..." },
  { scroll: 0.14, text: "[SCAN]: PASSING SUNLIT ZONE. BIO-SIGNS NORMAL." },
  { scroll: 0.28, text: "[SYSTEM]: ENTERING TWILIGHT ZONE. LIGHT FADING." },
  { scroll: 0.42, text: "[WARNING]: EXTERNAL PRESSURE CRITICAL." },
  { scroll: 0.56, text: "[SYSTEM]: ABYSSAL ZONE REACHED. ZERO SUNLIGHT." },
  { scroll: 0.70, text: "[SCAN]: UNKNOWN MASSIVE ENERGY SIGNATURE DETECTED..." },
  { scroll: 0.85, text: "[SYSTEM]: APPROACHING ANOMALY. INITIATING OVERRIDE." },
  { scroll: 0.97, text: "[SCAN]: THE ABYSSAL HEART FOUND. TARGET LOCKED AT [X: 0, Y: -14, Z: -65]" },
];

// ✨ Typewriter
const TypewriterText = ({ text, onComplete }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;

    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 35); // slightly faster for cinematic feel

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      <span className="cursor">_</span>
    </span>
  );
};

export default function DepthNarrative({ scrollProgress = 0 }) {
  const [currentText, setCurrentText] = useState("");
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef(null);

  // 🎯 Waypoint detection
  useEffect(() => {
    const nearestWaypoint = waypoints.reduce(
      (nearest, wp) => {
        const dist = Math.abs(scrollProgress - wp.scroll);
        const nearestDist = Math.abs(scrollProgress - nearest.scroll);
        return dist < nearestDist && dist < 0.04 ? wp : nearest;
      },
      { scroll: -999, text: "" }
    );

    if (nearestWaypoint.text && nearestWaypoint.text !== currentText) {
      setCurrentText(nearestWaypoint.text);
      setVisible(true);

      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setCurrentText(""); // Reset text to prevent 'stuck' state
      }, 4000);
    }
  }, [scrollProgress, currentText]);

  // 🌊 Depth intensity (deeper = stronger glow)
  const depthIntensity = 0.6 + scrollProgress * 0.8;

  return (
    <div className="depth-container">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={currentText}
            className="depth-caption"
            style={{
              opacity: depthIntensity,
              textShadow: `
                0 0 ${8 + depthIntensity * 10}px rgba(0,180,255,0.6),
                0 0 ${20 + depthIntensity * 20}px rgba(0,255,200,0.3)
              `,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {/* ✨ layered glitch ghost */}
            <div className="ghost-layer">{currentText}</div>

            {/* main */}
            <TypewriterText text={currentText} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
