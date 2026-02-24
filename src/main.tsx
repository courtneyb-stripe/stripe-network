import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'
import App from './App'
import './index.css'

const root = document.getElementById('root')
if (!root) {
  document.body.innerHTML = '<div style="padding:24px;font-family:sans-serif;">Root #root not found. Check index.html.</div>'
} else {
createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
}
