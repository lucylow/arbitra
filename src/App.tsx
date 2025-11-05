import { LandingPage } from './landing/pages/LandingPage'
import './App.css'

function App() {
  const handleEnterApp = () => {
    alert('Full dApp coming soon! Blockchain integration in progress.')
  }

  return <LandingPage onEnterApp={handleEnterApp} />
}

export default App
