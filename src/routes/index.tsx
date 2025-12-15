import { createFileRoute } from '@tanstack/react-router'
import Navbar from '@/components/landing/Navbar'
import ParticleBackground from '@/components/landing/ParticleBackground'
import Hero from '@/components/landing/Hero'
import OpportunitySection from '@/components/landing/OpportunitySection'
import ModuleShowcase from '@/components/landing/ModuleShowcase'
// import TerminalSection from '@/components/landing/TerminalSection';
import PricingSection from '@/components/landing/PricingSection'
import FAQ from '@/components/landing/FAQ'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0E131B] text-slate-200 selection:bg-[#B0811C] selection:text-white">
      <Navbar />
      <ParticleBackground />
      <Hero />
      <OpportunitySection />
      <ModuleShowcase />
      {/* <TerminalSection /> */}
      <PricingSection />
      <FAQ />

      {/* Footer */}
      <footer className="py-8 text-center text-slate-600 text-sm relative z-10 border-t border-white/5 bg-[#0E131B]">
        <p>
          © {new Date().getFullYear()} The Market Magic Box. All rights
          reserved.
        </p>
      </footer>
    </main>
  )
}
