import { Routes, Route } from 'react-router-dom'
import { useInternetIdentity } from './hooks/useInternetIdentity'
import { LandingPage } from './landing/pages/LandingPage'
import { NavBar } from './components/NavBar'
import { HomePage } from './components/pages/HomePage'
import { DisputesPage } from './components/pages/DisputesPage'
import { NewDisputePage } from './components/pages/NewDisputePage'
import { DisputeDetailPage } from './components/pages/DisputeDetailPage'
import { ArbitratorDashboardPage } from './components/pages/ArbitratorDashboardPage'
import './App.css'

function App() {
  const { isAuthenticated, login } = useInternetIdentity()
  
  // Show landing page when not authenticated
  if (!isAuthenticated) {
    return <LandingPage onEnterApp={login} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/disputes" element={<DisputesPage />} />
          <Route path="/disputes/new" element={<NewDisputePage />} />
          <Route path="/disputes/:id" element={<DisputeDetailPage />} />
          <Route path="/arbitrator" element={<ArbitratorDashboardPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
