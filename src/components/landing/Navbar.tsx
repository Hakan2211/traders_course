import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles, LockOpen, LogOut } from 'lucide-react'
import { AnimatedLogo } from '@/components/ui/AnimatedLogo'
import { AudioControl } from '@/components/ui/AudioControl'
import { Link, useRouter, getRouteApi } from '@tanstack/react-router'
import { logoutFn } from '@/server/auth'
import { toast } from 'sonner'
import { PRICE_IDS } from '@/lib/constants'

const routeApi = getRouteApi('__root__')

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { session } = routeApi.useLoaderData()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutFn()
      toast.success('Logged out successfully')
      await router.invalidate()
      router.navigate({ to: '/' })
    } catch (err) {
      toast.error('Failed to logout')
    }
  }

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
          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-zinc-800 to-black border border-white/10 group-hover:border-[#B0811C]/50 transition-colors duration-500">
              <AnimatedLogo className="w-8 h-8 text-[#B0811C]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-serif font-base text-2xl tracking-tight leading-none group-hover:text-amber-100 transition-colors">
                Market
              </span>
              <span className="text-[#dab25b] font-mono font-semibold text-[12px] tracking-[0.2em] uppercase leading-none">
                Magic Box
              </span>
            </div>
          </Link>

          {/* --- MIDDLE: DESKTOP LINKS (Optional filler for balance) --- */}
          <div className="hidden md:flex items-center gap-8">
            {['Modules', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-300 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#B0811C] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* --- RIGHT: ACTIONS --- */}
          <div className="hidden md:flex items-center gap-6">
            <AudioControl />
            {session ? (
              <>
                <span className="text-sm font-medium text-zinc-300">
                  Welcome, {session.user.name || session.user.username}
                </span>
                {session.user.role === 'ADMIN' ||
                session.user.stripeSubscriptionStatus === 'active' ? (
                  <Link
                    to="/course"
                    className="group flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    <LockOpen className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#B0811C] transition-colors" />
                    <span>Go to Course</span>
                  </Link>
                ) : (
                  <a
                    href="/#pricing"
                    className="group flex items-center gap-2 text-sm font-medium text-[#B0811C] hover:text-yellow-400 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Complete Enrollment</span>
                  </a>
                )}
                <div className="h-4 w-px bg-zinc-800" />
                <button
                  onClick={handleLogout}
                  className="group flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#B0811C] transition-colors" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-[#B0811C] to-yellow-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative p-px overflow-hidden rounded-lg">
                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#B0811C_50%,#000000_100%)]" />
                    <div className="relative z-10 bg-zinc-950 rounded-lg">
                      <Link
                        to="/register"
                        search={{ priceId: PRICE_IDS.VAULT }}
                        className="block px-5 py-2 bg-black/50 hover:bg-[#B0811C]/20 text-white text-sm font-bold tracking-wide rounded-lg transition-colors duration-300"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* --- MOBILE HAMBURGER --- */}
          <div className="md:hidden flex items-center gap-4">
            <AudioControl className="scale-90" />
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
            {['Modules', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-serif text-zinc-300 hover:text-[#B0811C] transition-colors"
              >
                {item}
              </a>
            ))}

            {session ? (
              <>
                <span className="text-xl font-serif text-zinc-300">
                  Welcome, {session.user.name || session.user.username}
                </span>
                {session.user.role === 'ADMIN' ||
                session.user.stripeSubscriptionStatus === 'active' ? (
                  <Link
                    to="/course"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-serif text-zinc-300 hover:text-[#B0811C] transition-colors"
                  >
                    Go to Course
                  </Link>
                ) : (
                  <a
                    href="/#pricing"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-serif text-[#B0811C] hover:text-yellow-400 transition-colors font-bold"
                  >
                    Complete Enrollment
                  </a>
                )}
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="text-2xl font-serif text-zinc-300 hover:text-[#B0811C] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-serif text-zinc-300 hover:text-[#B0811C] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  search={{ priceId: PRICE_IDS.VAULT }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full max-w-xs py-4 bg-[#B0811C] text-black font-bold uppercase tracking-widest rounded-full text-center"
                >
                  Enroll Now
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
