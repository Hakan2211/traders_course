import React from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Sparkles, ArrowRight } from 'lucide-react'
import ColourfulText from '@/components/ui/colourful-text'

const Hero: React.FC = () => {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 z-10 overflow-hidden pt-32 pb-20">
      {/* Central Content */}
      <div className="max-w-7xl mx-auto text-center relative z-20 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="group relative inline-block cursor-pointer mb-12"
        >
          {/* The Gradient Border (Hidden initially, visible on hover) */}
          <div className="absolute -inset-0.5 rounded-full bg-linear-to-r from-[#B0811C] via-yellow-400 to-[#B0811C] opacity-30 blur transition duration-500 group-hover:opacity-100" />

          {/* The Main Container */}
          <div className="relative flex items-center justify-center rounded-full bg-black/80 backdrop-blur-xl px-6 py-2.5 ring-1 ring-white/10 transition duration-200 group-hover:ring-transparent">
            {/* Glowing Dot indicator */}
            <span className="mr-3 h-2 w-2 rounded-full bg-linear-to-r from-[#B0811C] via-yellow-400 to-[#B0811C] shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />

            <span className="bg-linear-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent text-sm font-mono tracking-[0.2em] uppercase font-bold">
              Immersive Trading Mastery
            </span>
          </div>
        </motion.div>

        <div className="mb-16 font-bold text-(--text-color-primary-800) tracking-tight font-serif leading-tight w-full">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl mb-8 font-bold relative z-10"
          >
            See Markets as{' '}
            <span className="relative inline-block group cursor-default">
              {/* The Text */}
              <motion.span
                // A "Breathing" animation on the text color intensity
                animate={{ color: ['#B45309', '#FCD34D', '#B45309'] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative z-10"
              >
                Living Systems.
              </motion.span>

              {/* The SVG Heartbeat / Chart Line */}
              <div className="absolute -bottom-18 md:-bottom-20 -left-10 w-full h-16 pointer-events-none">
                <svg
                  viewBox="0 0 500 50"
                  className="w-full h-full overflow-visible"
                >
                  {/* Background Track (Darker/Faint) */}
                  <path
                    d="M0 25 L30 25 L40 10 L50 40 L60 20 L70 25 L120 25 L130 5 L140 45 L150 15 L160 30 L210 25 L220 10 L230 40 L240 20 L250 30 L500 25"
                    fill="transparent"
                    stroke="#451a03"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="opacity-40"
                  />

                  {/* Foreground Pulse 1 (Bright Amber) */}
                  <motion.path
                    d="M0 25 L30 25 L40 10 L50 40 L60 20 L70 25 L120 25 L130 5 L140 45 L150 15 L160 30 L210 25 L220 10 L230 40 L240 20 L250 30 L500 25"
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 1 }}
                    animate={{
                      pathLength: [0, 1, 1],
                      opacity: [1, 1, 0],
                    }}
                    transition={{
                      duration: 4,
                      times: [0, 0.9, 1],
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                    style={{ filter: 'drop-shadow(0px 0px 8px #F59E0B)' }}
                  />

                  {/* Foreground Pulse 2 (Bright Cyan/Blue for contrast, trailing slightly) */}
                  <motion.path
                    d="M0 25 L30 25 L40 10 L50 40 L60 20 L70 25 L120 25 L130 5 L140 45 L150 15 L160 30 L210 25 L220 10 L230 40 L240 20 L250 30 L500 25"
                    fill="transparent"
                    stroke="#FFFDB8" // Cyan-500
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 1 }}
                    animate={{
                      pathLength: [0, 1, 1],
                      opacity: [1, 1, 0],
                    }}
                    transition={{
                      duration: 4,
                      delay: 2, // Starts halfway through the first pulse's cycle
                      times: [0, 0.9, 1],
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                    style={{ filter: 'drop-shadow(0px 0px 8px #06b6d4)' }}
                  />
                </svg>
              </div>

              {/* Micro-animation: Particles on Hover */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-amber-500/10 blur-xl rounded-full" />
            </span>
          </motion.h1>

          <div className="flex items-center justify-center w-full max-w-4xl mx-auto text-2xl md:text-3xl lg:text-4xl mt-20 md:mt-32 md:mb-2">
            <ColourfulText text="BUILD SKILLS THROUGH IMMERSIVE GAMEPLAY" />
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-lg text-(--text-color-primary-700) max-w-2xl mx-auto mb-16 leading-relaxed"
        >
          Six comprehensive modules featuring 3D particle physics, interactive
          risk management builders, neural network visualizations, and gamified
          setup training.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col md:flex-row gap-8 justify-center items-center"
        >
          {/* --- PRIMARY BUTTON: Enter The Market Magic Box --- */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-[#B0811C] to-yellow-600 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative p-px overflow-hidden rounded-full">
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#B0811C_50%,#000000_100%)]" />
              <div className="relative z-10 bg-slate-950/90 rounded-full">
                <a
                  href="#pricing"
                  className="flex items-center gap-2 px-8 py-4 h-full w-full justify-center bg-black/50 hover:bg-[#B0811C]/10 transition-colors duration-300 rounded-full"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span className="font-mono text-sm uppercase tracking-widest font-bold text-yellow-50 group-hover:text-yellow-300 transition-colors">
                    Enter The Experience
                  </span>
                  <motion.span
                    initial={{ width: 0, opacity: 0, x: -10 }}
                    whileHover={{ width: 'auto', opacity: 1, x: 0 }}
                    className="overflow-hidden flex items-center"
                  >
                    <ArrowRight className="w-4 h-4 ml-2 text-[#B0811C]" />
                  </motion.span>
                </a>
              </div>
            </div>
          </div>

          {/* --- SECONDARY BUTTON: Explore Curriculum --- */}
          <motion.a
            href="#modules"
            onClick={(e) => {
              e.preventDefault()
              document
                .getElementById('modules')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
            initial="initial"
            whileHover="hover"
            className="relative group overflow-hidden rounded-full px-6 py-3.5 bg-transparent border border-white/10 hover:border-[#B0811C]/50 transition-colors duration-300 flex items-center gap-3"
          >
            <motion.div
              variants={{
                initial: { x: '-100%' },
                hover: { x: '0%' },
              }}
              transition={{ type: 'tween', ease: 'circOut', duration: 0.4 }}
              className="absolute inset-0 bg-[#B0811C]/10 w-full h-full"
            />
            <span className="text-zinc-400 text-sm font-medium tracking-wide group-hover:text-[#B0811C] transition-colors duration-300">
              Explore The Six Modules
            </span>
            <div className="flex items-center overflow-hidden w-4 h-4 relative">
              <motion.div
                variants={{
                  initial: { x: 0 },
                  hover: { x: 20 },
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4 text-zinc-500" />
              </motion.div>

              <motion.div
                variants={{
                  initial: { x: -20 },
                  hover: { x: 0 },
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4 text-[#B0811C]" />
              </motion.div>
            </div>
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-slate-500"
      >
        <span className="text-xs font-mono uppercase tracking-widest">
          Scroll Down
        </span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </motion.div>
    </section>
  )
}

export default Hero
