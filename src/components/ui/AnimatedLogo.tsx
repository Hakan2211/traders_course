import { motion } from 'framer-motion'

export const AnimatedLogo = ({ className }: { className?: string }) => {
  // Animation variants for the floating effect
  const floatTransition = {
    duration: 3,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut' as const,
  }

  // Colors
  const topColor = '#49DC84' // Pastel Green
  const bottomColor = '#FF5141' // Pastel Red

  return (
    <div className={className}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Bottom Layer */}
        <motion.path
          d="M50 100 L90 80 L90 65 L50 85 L10 65 L10 80 Z"
          fill={bottomColor}
          opacity="0.5"
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          transition={{ ...floatTransition, delay: 0 }}
        />

        {/* Middle Layer */}
        <motion.path
          d="M50 75 L90 55 L90 40 L50 60 L10 40 L10 55 Z"
          fill="currentColor"
          opacity="0.75"
          initial={{ y: 0 }}
          animate={{ y: -2 }}
          transition={{ ...floatTransition, delay: 0.5 }}
        />

        {/* Top Layer (The "Lid") */}
        <motion.path
          d="M50 50 L90 30 L50 10 L10 30 Z" // Top diamond
          fill={topColor}
          initial={{ y: 5 }}
          animate={{ y: 0 }}
          transition={{ ...floatTransition, delay: 1 }}
        />
        <motion.path
          d="M10 30 L50 50 L50 65 L10 45 Z" // Left face
          fill="url(#grad1)" // Using gradient to give 3D depth
          initial={{ y: 0 }}
          animate={{ y: -6 }}
          transition={{ ...floatTransition, delay: 1 }}
        />
        <motion.path
          d="M90 30 L50 50 L50 65 L90 45 Z" // Right face
          fill="url(#grad2)"
          initial={{ y: 0 }}
          animate={{ y: -6 }}
          transition={{ ...floatTransition, delay: 1 }}
        />

        {/* Gradients for the top cube to make it look 3D */}
        <defs>
          <linearGradient
            id="grad1"
            x1="10"
            y1="30"
            x2="50"
            y2="65"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={topColor} stopOpacity="0.9" />
            <stop offset="1" stopColor={topColor} stopOpacity="0.5" />
          </linearGradient>
          <linearGradient
            id="grad2"
            x1="90"
            y1="30"
            x2="50"
            y2="65"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={topColor} stopOpacity="0.8" />
            <stop offset="1" stopColor={topColor} stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
