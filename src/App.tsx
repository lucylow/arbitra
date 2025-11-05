import { useState } from 'react'
import { LandingPage } from './landing/pages/LandingPage'
import { LoginPage } from './components/pages/LoginPage'
import './App.css'

function App() {
  const [showLogin, setShowLogin] = useState(false)

  if (showLogin) {
    return <LoginPage />
  }

  return <LandingPage onEnterApp={() => setShowLogin(true)} />
}

export default App
