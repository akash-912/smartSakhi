import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx';
import { PlannerProvider } from './features/daily-planner/context/PlannerContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <PlannerProvider>
        <App />
      </PlannerProvider>
    </ThemeProvider>
  </StrictMode>,
)
