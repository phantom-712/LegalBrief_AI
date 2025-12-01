/**
 * Application Entry Point
 * 
 * This is the main entry point for the React application.
 * It mounts the root component (App) to the DOM and enables Strict Mode for development checks.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mount the React application to the 'root' DOM element
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
