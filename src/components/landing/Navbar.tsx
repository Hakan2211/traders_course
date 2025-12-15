import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, Sparkles, Lock } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Detect scroll to toggle the glass effect intensity
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-6 md:px-12 py-8 ${
          isScrolled
            ? 'bg-black/40 backdrop-blur-xl border-b border-white/5 py-3'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* --- LEFT: LOGO --- */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 group-hover:border-[#B0811C]/50 transition-colors duration-500">
              <Sparkles className="w-5 h-5 text-[#B0811C] group-hover:animate-spin-slow transition-transform duration-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-serif font-bold text-lg tracking-tight leading-none group-hover:text-amber-100 transition-colors">
                Course
              </span>
              <span className="text-[#B0811C] font-mono text-[10px] tracking-[0.2em] uppercase leading-none">
                For Traders
              </span>
            </div>
          </div>

          {/* --- MIDDLE: DESKTOP LINKS (Optional filler for balance) --- */}
          <div className="hidden md:flex items-center gap-8">
            {['Modules', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-300 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#B0811C] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* --- RIGHT: ACTIONS --- */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/course"
              className="group flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#B0811C] transition-colors" />
              <span>Go to Course</span>
            </Link>
          </div>

          {/* --- MOBILE HAMBURGER --- */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-zinc-300 hover:text-white p-2"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl pt-24 px-6 md:hidden flex flex-col items-center gap-8"
          >
            {['Modules', 'Pricing', 'Sign In'].map((item) => (
              <a
                key={item}
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-serif text-zinc-300 hover:text-[#B0811C] transition-colors"
              >
                {item}
              </a>
            ))}
            <button className="w-full max-w-xs py-4 bg-[#B0811C] text-black font-bold uppercase tracking-widest rounded-full">
              Enroll Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
