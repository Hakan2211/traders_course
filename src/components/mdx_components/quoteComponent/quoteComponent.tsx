
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const quoteVariants = {
  hidden: { opacity: 0, translateY: '40px' },
  visible: {
    opacity: 1,
    translateY: '0px',
    transition: { duration: 0.9, ease: [0.2, 0.85, 0.4, 1.01] },
  },
};

const borderVariants = {
  animate: {
    backgroundPosition: ['0% 0%', '300% 0%'],
    transition: {
      duration: 4.5,
      repeat: Infinity,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const cardVariants = {
  hover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
    transition: { duration: 0.4, ease: [0.17, 0.44, 0, 1.05] },
  },
};

export default function QuoteComponent({
  quote,
  author,
}: {
  quote: string;
  author: string;
}) {
  const [isViewAnimationComplete, setIsViewAnimationComplete] = useState(false);

  return (
    <motion.figure
      initial="hidden"
      whileInView="visible"
      // *** Conditionally apply whileHover ***
      whileHover={isViewAnimationComplete ? 'hover' : undefined}
      viewport={{ once: true, amount: 0.3 }}
      variants={{ ...quoteVariants, ...cardVariants }} // Pass all variants
      // *** Add callback to detect when 'visible' animation ends ***
      onAnimationComplete={(definition) => {
        // Check if the completed animation was the 'visible' one
        if (definition === 'visible') {
          setIsViewAnimationComplete(true);
        }
      }}
      className="relative max-w-2xl my-16 px-10 py-12 bg-gradient-to-br from-gray-900/90 to-zinc-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden"
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Border Div */}
      <motion.div
        className="absolute inset-0 rounded-3xl -z-10"
        variants={borderVariants}
        animate="animate"
        style={{
          border: '2px solid transparent',
          background:
            'linear-gradient(90deg, transparent, #ffffff, #d1d1d1, #ffffff, transparent) border-box',
          backgroundSize: '300% 100%',
          filter: 'blur(3px)',
          opacity: 0.9,
          mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />
      {/* Glossy Inner Glass Layer */}
      <div
        className="absolute inset-0 rounded-3xl z-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05) 30%, rgba(0, 0, 0, 0.2))',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      />

      {/* Quotation Mark */}
      <motion.span
        className="absolute top-4 left-6 text-7xl text-white/20 select-none"
        initial={{ opacity: 0, rotate: -10 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
        aria-hidden="true"
      >
        “
      </motion.span>

      {/* Content */}
      <blockquote className="relative z-10">
        <p className="font-sans text-2xl font-light italic text-gray-200 leading-snug tracking-tight text-balance">
          {quote}
        </p>
      </blockquote>
      <figcaption className="mt-6 text-right">
        <cite className="block font-sans  text-white/80 text-base not-italic font-medium tracking-normal drop-shadow-sm">
          — {author}
        </cite>
      </figcaption>
    </motion.figure>
  );
}
