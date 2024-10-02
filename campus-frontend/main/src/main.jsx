import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import MainApp from './App.jsx'

createRoot(document.getElementById('root')).render(
  //dev mode: StrictMode rseult in useEffect double rendering
  //<StrictMode>
    //<App />
    <MainApp />
  //</StrictMode>,
)
