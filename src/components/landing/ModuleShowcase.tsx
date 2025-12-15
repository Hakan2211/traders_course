import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  ArrowDown,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { MODULES } from '@/lib/landing-data'
import { SparklesCore } from '@/components/ui/sparkles'

// Optional: Add this to your globals.css or tailwind config for the grid pattern
// .bg-grid-pattern { background-image: radial-gradient(rgba(176, 129, 28, 0.1) 1px, transparent 1px); background-size: 40px 40px; }

const FeatureList = ({ features }: { features: string[] }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const visibleFeatures = isExpanded ? features : features.slice(0, 6)
  const hasMore = features.length > 6

  return (
    <div className="bg-[#0E131B] rounded-xl overflow-hidden border border-white/10">
      <div className="bg-[#151c2a] px-6 py-3 border-b border-white/5 flex justify-between items-center">
        <h4 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-[#B0811C]"></span>
          Curriculum
        </h4>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500/20"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/20"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
        </div>
      </div>

      <ul className="p-2">
        <AnimatePresence initial={false}>
          {visibleFeatures.map((feature, i) => (
            <motion.li
              key={feature} // Use feature content as key or a unique ID if available. Using index can be tricky with animations but okay here since list only grows/shrinks at end
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="group/item flex items-center gap-4 p-4 rounded-lg hover:bg-white/[0.03] transition-colors cursor-default border border-transparent hover:border-white/5"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded bg-[#B0811C]/10 flex items-center justify-center text-[#B0811C] group-hover/item:bg-[#B0811C] group-hover/item:text-black transition-all font-mono text-sm">
                {features.indexOf(feature) + 1}
              </div>
              <span className="text-slate-400 group-hover/item:text-white transition-colors flex-1">
                {feature}
              </span>
              <ArrowRight className="w-4 h-4 text-[#B0811C] opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {hasMore && (
        <div className="p-2 border-t border-white/5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-3 flex items-center justify-center gap-2 text-sm text-[#B0811C] hover:bg-[#B0811C]/10 rounded-lg transition-all duration-300 font-medium tracking-wide uppercase"
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show All {features.length} Lessons{' '}
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

const ModuleShowcase: React.FC = () => {
  return (
    <section
      id="modules"
      className="relative py-32 px-4 overflow-hidden z-10 bg-[#0E131B]"
    >
      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2333] via-[#0E131B] to-[#0E131B] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* --- PART 1: OVERVIEW HEADER --- */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative inline-block cursor-pointer mb-6"
          >
            {/* The Gradient Border (Hidden initially, visible on hover) */}
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#B0811C] via-yellow-400 to-[#B0811C] opacity-30 blur transition duration-500 group-hover:opacity-100" />

            {/* The Main Container */}
            <div className="relative flex items-center justify-center rounded-full bg-black/80 backdrop-blur-xl px-6 py-2.5 ring-1 ring-white/10 transition duration-200 group-hover:ring-transparent">
              {/* Glowing Dot indicator */}
              <span className="mr-3 h-2 w-2 rounded-full bg-gradient-to-r from-[#B0811C] via-yellow-400 to-[#B0811C] shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />

              <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent text-sm font-mono tracking-[0.2em] uppercase font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                SYSTEM ARCHITECTURE
              </span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6 font-serif text-white tracking-tight"
          >
            The{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B0811C] via-[#FCD34D] to-[#B0811C]">
              Fortress
            </span>{' '}
            Modules
          </motion.h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            A vertically integrated ecosystem designed for complete trading
            mastery. Select a module to initiate a deep dive.
          </p>
        </div>

        {/* --- PART 1.5: NAVIGATION GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-40">
          {MODULES.map((module, index) => (
            <motion.a
              key={module.id}
              href={`#module-${module.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative block h-full"
            >
              {/* Card Background & Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-2xl blur-sm transition-all duration-500 group-hover:blur-md group-hover:from-[#B0811C]/20 group-hover:to-slate-900/80"></div>

              <div className="relative h-full bg-[#0E131B]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 overflow-hidden transition-all duration-300 group-hover:border-[#B0811C]/40 group-hover:-translate-y-2">
                {/* Shine Effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />

                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-xl bg-[#0E131B] border border-slate-700 group-hover:border-[#B0811C] group-hover:bg-[#B0811C]/10 transition-all duration-300 group-hover:scale-110">
                    <module.icon className="w-6 h-6 text-slate-300 group-hover:text-[#B0811C] transition-colors" />
                  </div>
                  <span className="text-xs font-mono text-slate-600 group-hover:text-[#B0811C] transition-colors border border-slate-800 px-2 py-1 rounded">
                    MOD_{module.id}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#B0811C] transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-slate-400 font-mono mb-6 line-clamp-2">
                  {module.subtitle}
                </p>

                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                  <span className="text-xs text-slate-500 font-mono">
                    Status: ACTIVE
                  </span>
                  <div className="flex items-center gap-2 text-[#B0811C] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Explore
                    </span>
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* --- PART 2: DETAILED BREAKDOWN --- */}
        <div className="space-y-32 md:space-y-48">
          {MODULES.map((module, index) => (
            <div
              key={module.id}
              id={`module-${module.id}`}
              className="scroll-mt-32 relative group/section"
            >
              {/* Animated Connecting Line */}
              {index !== MODULES.length - 1 && (
                <div className="absolute left-4 md:left-1/2 bottom-[-192px] h-48 w-px hidden md:flex justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="w-px bg-gradient-to-b from-[#B0811C] via-[#B0811C]/50 to-transparent"
                  />
                </div>
              )}

              <div
                className={`flex flex-col ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'
                } gap-12 md:gap-24 items-center`}
              >
                {/* Visual / Icon Side */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="w-full md:w-1/2 flex justify-center relative"
                >
                  {/* Rotating Rings */}
                  <div className="absolute inset-0 m-auto w-64 h-64 border border-[#B0811C]/20 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-0 m-auto w-80 h-80 border border-dashed border-[#B0811C]/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

                  {/* Central Glowing Orb */}
                  <div className="absolute inset-0 bg-[#B0811C]/20 blur-[100px] rounded-full"></div>

                  {/* Icon Container with Float Animation */}
                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-b from-[#0E131B] to-[#1a2333] border border-[#B0811C]/30 flex items-center justify-center shadow-[0_0_50px_-12px_rgba(176,129,28,0.3)]"
                  >
                    <module.icon
                      className="w-20 h-20 text-[#B0811C]"
                      strokeWidth={1}
                    />

                    {/* Orbiting Dot */}
                    <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
                      <div className="h-2 w-2 bg-white rounded-full absolute top-4 left-1/2 -translate-x-1/2 shadow-[0_0_10px_white]"></div>
                    </div>
                  </motion.div>

                  {/* Giant Background Number with Sparkles */}
                  <div className="absolute -top-48 md:-top-72 left-1/2 -translate-x-1/2 pointer-events-none select-none">
                    <span
                      className="text-[12rem] font-bold text-white/[0.03] font-serif leading-none relative z-10"
                      style={{ textShadow: '0 0 40px rgba(176,129,28,0.3)' }}
                    >
                      {module.id}
                    </span>
                    <div className="absolute inset-0 w-full h-full z-0">
                      <SparklesCore
                        id={`sparkles-${module.id}`}
                        background="transparent"
                        minSize={0.4}
                        maxSize={1.5}
                        particleDensity={150}
                        className="w-full h-full"
                        particleColor="#B0811C"
                        speed={0.5}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Content Side */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 1 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="w-full md:w-1/2"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span className="h-px w-12 bg-[#B0811C]"></span>
                    <span className="text-[#B0811C] font-mono tracking-widest text-sm font-bold">
                      MODULE {module.id}
                    </span>
                  </div>

                  <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
                    {module.title}
                  </h3>
                  <p className="text-xl text-[#B0811C]/80 font-serif italic mb-8">
                    {module.subtitle}
                  </p>

                  <p className="text-slate-300 leading-relaxed mb-10 text-lg border-l-2 border-white/10 pl-6">
                    {module.description}
                  </p>

                  {/* Feature HUD */}
                  <FeatureList features={module.features} />
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ModuleShowcase
