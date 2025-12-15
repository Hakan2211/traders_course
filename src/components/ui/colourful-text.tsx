import React from 'react';
import { motion } from 'framer-motion';

export default function ColourfulText({ text }: { text: string }) {
  const colors = [
    // 'rgb(176, 129, 28)',
    // 'rgb(255, 215, 0)',
    // 'rgb(192, 192, 192)',
    // 'rgb(205, 127, 50)',
    // 'rgb(218, 165, 32)',
    // 'rgb(255, 223, 0)',
    // 'rgb(255, 255, 240)',

    '#B29433',
  ];

  const [currentColors, setCurrentColors] = React.useState(colors);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const shuffled = [...colors].sort(() => Math.random() - 0.5);
      setCurrentColors(shuffled);
      setCount((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  let globalCharIndex = 0;

  return (
    <div className="flex flex-wrap justify-center gap-x-[0.2em] md:gap-x-[0.25em]">
      {text.split(' ').map((word, wordIndex) => {
        // Group characters into a word container to prevent mid-word breaking
        return (
          <span key={wordIndex} className="whitespace-nowrap inline-block">
            {word.split('').map((char, charIndex) => {
              const delay = globalCharIndex * 0.05;
              const colorIndex = globalCharIndex % currentColors.length;
              globalCharIndex++;

              return (
                <motion.span
                  key={`${char}-${count}-${wordIndex}-${charIndex}`}
                  initial={{
                    y: 0,
                  }}
                  animate={{
                    color: currentColors[colorIndex],
                    textShadow: [
                      `0 0 5px ${currentColors[colorIndex]}`,
                      `0 0 10px ${currentColors[colorIndex]}`,
                      `0 0 5px ${currentColors[colorIndex]}`,
                    ],
                    y: [0, -3, 0],
                    scale: [1, 1.01, 1],
                    filter: ['blur(0px)', `blur(2px)`, 'blur(0px)'],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    delay: delay,
                  }}
                  className="inline-block whitespace-pre font-sans tracking-tight font-bold"
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}
