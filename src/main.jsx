import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Silence Three.js deprecation warnings caused by third-party React Three Fiber libraries
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string') {
    if (args[0].includes('THREE.Clock') || args[0].includes('PCFSoftShadowMap')) {
      return; // Suppress these specific warnings
    }
  }
  originalWarn(...args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
