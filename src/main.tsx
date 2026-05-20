import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AuthCallback from './pages/AuthCallback'
import Leaderboards from './pages/Leaderboards'
import { AuthProvider } from './lib/auth'
import { ProfileProvider } from './lib/profile'
import UsernameModal from './components/UsernameModal'
import { Analytics } from '@vercel/analytics/react'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/:slug" element={<App />} />
          </Routes>
          <UsernameModal />
          <Analytics />
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
