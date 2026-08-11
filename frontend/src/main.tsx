import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import { SavedBeachesProvider } from './saved/SavedBeachesContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SavedBeachesProvider>
          <App />
        </SavedBeachesProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
