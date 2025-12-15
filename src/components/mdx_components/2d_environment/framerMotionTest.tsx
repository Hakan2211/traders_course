
import { motion } from 'framer-motion';

const FramerMotionTest = () => {
  return (
    <motion.div
      className="w-16 h-16 bg-amber-300 rounded-full absolute"
      style={{ top: 'calc(50% - 32px)', left: 'calc(50% - 32px)' }} // Center the ball
      animate={{
        scale: [1, 1.5, 1.5, 1, 1],
        rotate: [0, 0, 270, 270, 0],
        borderRadius: ['50%', '50%', '20%', '20%', '50%'],
      }}
      transition={{
        duration: 2,
        ease: 'easeInOut',
        times: [0, 0.2, 0.5, 0.8, 1],
        repeat: Infinity,
        repeatDelay: 1,
      }}
    />
  );
};

export default FramerMotionTest;
