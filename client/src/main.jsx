import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAnalytics } from './analytics.js'

initAnalytics()

createRoot(document.getElementById('root')).render(
    <App />
)
