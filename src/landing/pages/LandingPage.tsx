import React from 'react'
import { Hero } from '../components/Hero'
import { Features } from '../components/Features'
import { HowItWorks } from '../components/HowItWorks'
import { Technology } from '../components/Technology'
import { UseCases } from '../components/UseCases'
import { Testimonials } from '../components/Testimonials'
import { CTASection } from '../components/CTASection'
import { Footer } from '../components/Footer'
import { DemoSimulator } from '../components/DemoSimulator'
import { InteractiveProcess } from '../components/InteractiveProcess'
import { EvidenceAnchorVisualizer } from '../components/EvidenceAnchorVisualizer'
import { TestimonialsCarousel } from '../components/TestimonialsCarousel'

export const LandingPage: React.FC<{ onEnterApp?: () => void }> = ({ onEnterApp }) => {
  const handleEnterApp = () => {
    if (onEnterApp) {
      onEnterApp()
    } else {
      window.location.href = '/app'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Hero onEnterApp={handleEnterApp} />
      <Features />
      <InteractiveProcess />
      <HowItWorks />
      <DemoSimulator />
      <EvidenceAnchorVisualizer />
      <Technology />
      <TestimonialsCarousel />
      <Testimonials />
      <UseCases />
      <CTASection onEnterApp={handleEnterApp} />
      <Footer />
    </div>
  )
}
