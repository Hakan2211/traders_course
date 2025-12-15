
import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Zap, Layers, TrendingUp } from 'lucide-react';

const OpportunitySection: React.FC = () => {
  const insights = [
    {
      icon: Eye,
      label: 'Institutional Accumulation',
      description: 'Hidden in dark pools',
      color: 'from-[#B0811C] to-yellow-500',
    },
    {
      icon: Zap,
      label: 'Liquidity Hunts',
      description: 'At key structural levels',
      color: 'from-amber-600 to-yellow-400',
    },
    {
      icon: Layers,
      label: 'Order Flow Warfare',
      description: 'Behind every candle',
      color: 'from-yellow-600 to-amber-300',
    },
    {
      icon: TrendingUp,
      label: 'Volume Rotation',
      description: 'Capital flow patterns',
      color: 'from-[#B0811C] to-amber-400',
    },
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-black/0 via-black/40 to-black/0 backdrop-blur-sm border-y border-white/5 z-10 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="group relative inline-block cursor-pointer mb-6"
          >
            {/* The Gradient Border (Hidden initially, visible on hover) */}
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#B0811C] via-yellow-400 to-[#B0811C] opacity-30 blur transition duration-500 group-hover:opacity-100" />

            {/* The Main Container */}
            <div className="relative flex items-center justify-center rounded-full bg-black/80 backdrop-blur-xl px-6 py-2.5 ring-1 ring-white/10 transition duration-200 group-hover:ring-transparent">
              {/* Glowing Dot indicator */}
              <span className="mr-3 h-2 w-2 rounded-full bg-gradient-to-r from-[#B0811C] via-yellow-400 to-[#B0811C] shadow-[0_0_8px_rgba(176,129,28,0.8)] animate-pulse" />

              <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent text-sm font-mono tracking-[0.2em] uppercase font-bold">
                What You'll Discover
              </span>
            </div>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold font-serif text-[var(--text-color-primary-800)] mb-6">
            The Invisible Advantage
          </h2>

          <p className="text-lg text-[var(--text-color-primary-700)] max-w-3xl mx-auto">
            While most traders react to price, you'll learn to anticipate
            institutional intent. Here's what becomes visible when you know how
            to look:
          </p>
        </motion.div>

        {/* Insight Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group relative"
            >
              {/* Glow effect */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${insight.color} rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500`}
              />

              {/* Card */}
              <div className="relative bg-[#0E131B]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:border-white/20 transition-all duration-300">
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${insight.color} mb-4`}
                >
                  <insight.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {insight.label}
                </h3>

                <p className="text-slate-400">{insight.description}</p>

                {/* Animated underline */}
                <div
                  className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${insight.color} rounded-full transition-all duration-500 mt-4`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats - Reframed Positively */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#B0811C]/20 via-yellow-500/20 to-amber-600/20 blur-3xl rounded-full" />

          {/* Card */}
          <div className="relative bg-gradient-to-br from-[#0E131B] to-[#1a1f2e] border border-[#B0811C]/30 p-10 rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-[#B0811C] to-yellow-400 bg-clip-text text-transparent mb-2">
                  5%
                </div>
                <div className="text-slate-400 text-sm">
                  Trade with institutional awareness
                </div>
              </div>

              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent mb-2">
                  80+
                </div>
                <div className="text-slate-400 text-sm">
                  Hours of immersive training
                </div>
              </div>

              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent mb-2">
                  6
                </div>
                <div className="text-slate-400 text-sm">
                  Comprehensive modules
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-center text-lg text-slate-300 italic">
                "Most traders spend years without understanding what you'll
                master in weeks.
                <span className="text-[#B0811C] font-semibold">
                  {' '}
                  This is your edge.
                </span>
                "
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OpportunitySection;
