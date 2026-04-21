import React, { createContext, useContext } from 'react';
import useScrollDepth from '../hooks/useScrollDepth';

const ScrollContext = createContext(null);

export const ScrollProvider = ({ children }) => {
  const scrollProgress = useScrollDepth();

  return (
    <ScrollContext.Provider value={scrollProgress}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (context === null) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
};
