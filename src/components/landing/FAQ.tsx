
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { FAQ_ITEMS } from '@/lib/landing-data';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 z-10 relative bg-black/30">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-serif font-bold text-[var(--text-color-primary-700)] mb-12 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="border border-slate-800 rounded-lg bg-[#0B1532]/20 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-medium text-slate-200">
                  {item.question}
                </span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-[#B0811C]" />
                ) : (
                  <Plus className="w-5 h-5 text-slate-500" />
                )}
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-slate-400 leading-relaxed border-t border-slate-800/50">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
