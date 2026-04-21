import { useState, useEffect, useMemo } from 'react';

/**
 * useDeviceProfile Hook
 * Detects mobile status and provides optimized parameters for different devices.
 */
const useDeviceProfile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const mobileWidth = window.innerWidth < 768;
      // navigator.userAgentData is a modern alternative but not fully supported everywhere yet
      const mobileUserAgentData = navigator.userAgentData?.mobile;
      
      setIsMobile(mobileUserAgentData || mobileUA || mobileWidth);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const profile = useMemo(() => {
    if (isMobile) {
      return {
        isMobile: true,
        boidCounts: { fg: 4, mid: 8, bg: 12 },
        marineSnowCount: 800,
        parallaxMultiplier: 0.4, // 60% reduction
        dpr: Math.min(window.devicePixelRatio, 2),
        sonarTrigger: 'two-finger-long-press'
      };
    }
    return {
      isMobile: false,
      boidCounts: { fg: 12, mid: 35, bg: 60 },
      marineSnowCount: 3000,
      parallaxMultiplier: 1.0,
      dpr: Math.min(window.devicePixelRatio, 2), // Still good practice to cap at 2 for performance
      sonarTrigger: 'contextmenu'
    };
  }, [isMobile]);

  return profile;
};

export default useDeviceProfile;
