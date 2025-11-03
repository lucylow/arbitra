import { useState } from 'react'
import { Layout } from './components/ui/Layout'
import { Dashboard } from './components/dashboard/Dashboard'
import { CreateDispute } from './components/disputes/CreateDispute'
import { DisputeDetail } from './components/disputes/DisputeDetail'
import { useInternetIdentity } from './hooks/useInternetIdentity'
import { LandingPage } from './landing/pages/LandingPage'
import './App.css'

type AppPage = 'dashboard' | 'create' | 'dispute-detail'

function App() {
  const { isAuthenticated, login } = useInternetIdentity()
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard')
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null)
  
  // Show landing page when not authenticated
  if (!isAuthenticated) {
    return <LandingPage onEnterApp={login} />
  }

  const handleSelectDispute = (dispute: { id: string }) => {
    setSelectedDisputeId(dispute.id)
    setCurrentPage('dispute-detail')
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'create':
        return (
          <CreateDispute
            onSuccess={(disputeId) => {
              setSelectedDisputeId(disputeId)
              setCurrentPage('dispute-detail')
            }}
            onCancel={() => setCurrentPage('dashboard')}
          />
        )
      
      case 'dispute-detail':
        return selectedDisputeId ? (
          <DisputeDetail
            disputeId={selectedDisputeId}
            onBack={() => setCurrentPage('dashboard')}
          />
        ) : (
          <Dashboard onSelectDispute={handleSelectDispute} />
        )
      
      default:
        return <Dashboard onSelectDispute={handleSelectDispute} />
    }
  }

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={(page) => setCurrentPage(page as AppPage)}
    >
      {renderContent()}
    </Layout>
  )
}

export default App
