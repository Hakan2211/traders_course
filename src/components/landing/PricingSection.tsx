
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Shield,
  Zap,
  Users,
  Star,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SparklesCore } from '@/components/ui/sparkles'; // Assuming you have this from ModuleShowcase

const PricingSection: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section
      id="pricing"
      className="relative py-32 px-4 overflow-hidden bg-[#0E131B]"
    >
      {/* --- BACKGROUND FX (Matching ModuleShowcase) --- */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#1a2333] via-[#0E131B] to-[#0E131B] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Sparkles at top */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <SparklesCore
          id="pricing-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={50}
          className="w-full h-full"
          particleColor="#B0811C"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* --- HEADER --- */}
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
                <Shield className="w-4 h-4 text-amber-500" />
                SECURE YOUR ACCESS
              </span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6 font-serif text-white tracking-tight"
          >
            Choose Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B0811C] via-[#FCD34D] to-[#B0811C]">
              Weapon
            </span>
          </motion.h2>

          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Select the level of intelligence you require. Both tiers include
            lifetime access to the core curriculum and future module updates.
          </p>
        </div>

        {/* --- PRICING CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto items-start">
          {/* === OPTION 1: THE VAULT (Course Only) === */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            className="relative group"
          >
            {/* Hover Glow */}
            <div
              className={`absolute -inset-0.5 bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500 ${
                hoveredCard === 1 ? 'opacity-75' : ''
              }`}
            ></div>

            <div className="relative bg-[#0E131B] border border-white/10 rounded-2xl p-8 md:p-10 h-full flex flex-col backdrop-blur-xl">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-mono uppercase tracking-widest text-slate-300">
                    The Vault
                  </h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    $699
                  </span>
                  <span className="text-slate-500 line-through">$1799</span>
                </div>
                <p className="text-slate-500 text-sm mt-2 font-mono">
                  One-time payment • Lifetime Access
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                <p className="text-white font-medium border-b border-white/10 pb-4 mb-4">
                  Complete Curriculum Access:
                </p>
                <FeatureItem text="All 6 Fortress Modules (80+ Hours)" />
                <FeatureItem text="Interactive Risk Builders" />
                <FeatureItem text="Neural Network Visualizations" />
                <FeatureItem text="30-Day Fortress Challenge" />
                <FeatureItem text="Direct Support" />
              </div>

              {/* BUTTON 1 - THE VAULT */}
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#B0811C] to-yellow-600 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative p-[1px] overflow-hidden rounded-full">
                  <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#B0811C_50%,#000000_100%)]" />
                  <div className="relative z-10 bg-slate-950/90 rounded-full">
                    <button className="flex items-center gap-2 px-8 py-4 h-full w-full justify-center bg-black/50 hover:bg-[#B0811C]/10 transition-colors duration-300 rounded-full">
                      <span className="font-mono text-sm uppercase tracking-widest font-bold text-yellow-50 group-hover:text-yellow-300 transition-colors">
                        Enter The Vault
                      </span>
                      <motion.span
                        initial={{ width: 0, opacity: 0, x: -10 }}
                        whileHover={{ width: 'auto', opacity: 1, x: 0 }}
                        className="overflow-hidden flex items-center"
                      >
                        <ArrowRight className="w-4 h-4 ml-2 text-[#B0811C]" />
                      </motion.span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* === OPTION 2: THE SYNDICATE (Course + Bullbearz Chat) === */}
          {/* This card is elevated with Gold styling */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
            className="relative group md:-mt-8" // Lifted slightly on desktop
          >
            {/* Animated Gold Border Gradient */}
            <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-[#B0811C] via-[#FCD34D] to-[#B0811C] opacity-50 blur-sm group-hover:opacity-100 group-hover:blur-md transition duration-300"></div>

            {/* Inner Content */}
            <div className="relative bg-[#0E131B] rounded-2xl p-8 md:p-10 h-full flex flex-col overflow-hidden">
              {/* Background Shine */}
              <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-[#B0811C]/10 opacity-20 group-hover:animate-shine pointer-events-none" />

              {/* Badge */}
              <div className="absolute top-0 right-0 bg-[#B0811C] text-black font-bold font-mono text-[10px] uppercase tracking-widest px-4 py-1 rounded-bl-xl z-20">
                Most Popular
              </div>

              <div className="relative z-10 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#B0811C]/20 rounded-lg text-[#B0811C] border border-[#B0811C]/30">
                    <Star className="w-6 h-6 fill-[#B0811C]" />
                  </div>
                  <h3 className="text-xl font-mono uppercase tracking-widest text-[#B0811C] font-bold">
                    The Syndicate
                  </h3>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    $1,499
                  </span>
                  <span className="text-slate-500 line-through">$3999</span>
                </div>
                <p className="text-[#B0811C]/80 text-sm mt-2 font-mono">
                  One-time payment • Lifetime Access
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1 relative z-10">
                <p className="text-white font-medium border-b border-white/10 pb-4 mb-4 flex justify-between items-center">
                  <span>Everything in Vault, plus:</span>
                  <span className="text-[#B0811C] text-xs px-2 py-0.5 bg-[#B0811C]/10 rounded border border-[#B0811C]/20">
                    VIP
                  </span>
                </p>

                {/* Highlighted Feature: Bullbearz Chat */}
                <div className="p-3 -mx-3 rounded-lg bg-[#B0811C]/10 border border-[#B0811C]/20 mb-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 min-w-[16px] text-[#B0811C]">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-white font-bold block text-sm">
                        <a
                          href="https://bullbearz.com"
                          target="_blank"
                          className="text-[#B0811C] hover:text-[#FCD34D] transition-colors duration-300"
                        >
                          Bullbearz.com
                        </a>{' '}
                        Lifetime Access
                      </span>
                      <span className="text-xs text-slate-400">
                        Private trading chatroom, real-time alerts & community
                        analysis.
                      </span>
                    </div>
                  </div>
                </div>

                <FeatureItem text="Priority 1-on-1 Onboarding" highlight />
                <FeatureItem text="Weekly Strategy War Room" highlight />
                <FeatureItem text="Journal & Progress Tracker" highlight />
              </div>

              {/* BUTTON 2 - THE SYNDICATE */}
              <div className="relative group w-full z-10">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#B0811C] to-yellow-600 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative p-[1px] overflow-hidden rounded-full">
                  <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#B0811C_50%,#000000_100%)]" />
                  <div className="relative z-10 bg-slate-950/90 rounded-full">
                    <button className="flex items-center gap-2 px-8 py-4 h-full w-full justify-center bg-black/50 hover:bg-[#B0811C]/10 transition-colors duration-300 rounded-full">
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                      <span className="font-mono text-sm uppercase tracking-widest font-bold text-yellow-50 group-hover:text-yellow-300 transition-colors">
                        Join The Syndicate
                      </span>
                      <motion.span
                        initial={{ width: 0, opacity: 0, x: -10 }}
                        whileHover={{ width: 'auto', opacity: 1, x: 0 }}
                        className="overflow-hidden flex items-center"
                      >
                        <ArrowRight className="w-4 h-4 ml-2 text-[#B0811C]" />
                      </motion.span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- FOOTER TRUST BADGES --- */}
        <div className="mt-16 text-center border-t border-white/5 pt-8 max-w-2xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Replace with your trust icons or keep text */}
            {/* <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase">
              <Shield className="w-4 h-4" /> 256-Bit SSL Encrypted
            </div> */}
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase">
              <Zap className="w-4 h-4" /> Instant Access
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase">
              <Check className="w-4 h-4" /> 14-Day Money Back Guarantee
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper Component for List Items
const FeatureItem = ({
  text,
  highlight = false,
}: {
  text: string;
  highlight?: boolean;
}) => (
  <div className="flex items-start gap-3">
    <div
      className={`mt-1 p-0.5 rounded-full ${
        highlight ? 'bg-[#B0811C] text-black' : 'bg-slate-800 text-slate-400'
      }`}
    >
      <Check className="w-3 h-3" />
    </div>
    <span
      className={`text-sm ${
        highlight ? 'text-white font-medium' : 'text-slate-400'
      }`}
    >
      {text}
    </span>
  </div>
);

export default PricingSection;
