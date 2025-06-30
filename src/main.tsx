import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeMonitoring } from './lib/monitoring';
import { securityManager } from './lib/security';

// Initialize security and monitoring for production
const initializeApp = async () => {
  try {
    // Initialize security measures
    securityManager.init();
    
    // Initialize monitoring and analytics
    await initializeMonitoring();
    
    console.log('🚀 Echofy.ai initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

// Initialize app
initializeApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);