
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TERMINAL_DATA } from '@/lib/landing-data';

const TerminalSection: React.FC = () => {
  const [lines, setLines] = useState<typeof TERMINAL_DATA>([]);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < TERMINAL_DATA.length) {
        const nextData = TERMINAL_DATA[currentIndex];
        if (nextData) {
          setLines((prev) => [...prev, nextData]);
        }
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 relative z-10 bg-[#0E131B]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Results Protocol
          </h2>
          <p className="text-slate-400">Real-time data from the ecosystem.</p>
        </div>

        <div className="bg-[#0c0c0c] border border-slate-800 rounded-lg overflow-hidden shadow-2xl font-mono text-sm md:text-base">
          {/* Terminal Header */}
          <div className="bg-[#1a1a1a] px-4 py-2 border-b border-slate-800 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-4 text-slate-500 text-xs">
              user@market-magic-box:~
            </span>
          </div>

          {/* Terminal Body */}
          <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar flex flex-col justify-end">
            <div className="text-slate-500 mb-4">
              Initializing connection to student database...
              <br />
              Connection established. Encrypted.
              <br />
              Streaming recent success metrics...
            </div>

            {lines.map((line, idx) => {
              if (!line) return null;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-2"
                >
                  <span className="text-green-500">➜</span>
                  <span className="text-blue-400 mx-2">[{line.user}]</span>
                  <span className="text-slate-300">{line.action}</span>
                  <span className="mx-2 text-slate-600">&gt;&gt;</span>
                  <span
                    className={
                      line.type === 'success'
                        ? 'text-green-400'
                        : line.type === 'warning'
                        ? 'text-yellow-400'
                        : 'text-blue-400'
                    }
                  >
                    {line.result}
                  </span>
                </motion.div>
              );
            })}
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-green-500 inline-block mt-2"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 border-t border-white/10 pt-12">
          {[
            { label: 'Students', value: '8,247' },
            { label: 'Verified Profit', value: '$2.4M+' },
            { label: 'Rating', value: '4.9/5' },
            { label: 'Completion', value: '94%' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TerminalSection;
