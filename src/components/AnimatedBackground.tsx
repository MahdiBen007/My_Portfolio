import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const codeSymbols = ['</', '/>', '{ }', '( )', '[ ]', '/*', '*/', '===', '=>', '&&', '||', '::'];
const techSymbols = ['JS', 'TS', 'CSS', 'API', 'SQL', '<>', '#', '$'];

interface FloatingSymbol {
  id: number;
  symbol: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const AnimatedBackground = () => {
  const [symbols, setSymbols] = useState<FloatingSymbol[]>([]);

  useEffect(() => {
    const allSymbols = [...codeSymbols, ...techSymbols];
    const generatedSymbols: FloatingSymbol[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      symbol: allSymbols[Math.floor(Math.random() * allSymbols.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 24 + 12,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
    }));
    setSymbols(generatedSymbols);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-night" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Radial Glow Effects */}
      <motion.div
        className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--glow-cyan) / 0.08) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--glow-purple) / 0.08) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Floating Code Symbols */}
      {symbols.map((symbol) => (
        <motion.div
          key={symbol.id}
          className="absolute font-mono select-none"
          style={{
            left: `${symbol.x}%`,
            top: `${symbol.y}%`,
            fontSize: `${symbol.size}px`,
            color: 'hsl(var(--foreground))',
            opacity: 0.04,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: symbol.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: symbol.delay,
          }}
        >
          {symbol.symbol}
        </motion.div>
      ))}
      
      {/* Animated Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--glow-cyan))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--glow-cyan))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--glow-cyan))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.line
          x1="0%"
          y1="30%"
          x2="100%"
          y2="30%"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.line
          x1="0%"
          y1="70%"
          x2="100%"
          y2="70%"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, delay: 1, repeat: Infinity, repeatType: 'reverse' }}
        />
      </svg>
      
      {/* Particle Dots */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 2 === 0 
              ? 'hsl(var(--glow-cyan))' 
              : 'hsl(var(--glow-purple))',
          }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};
