import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

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

interface ParticleDot {
  id: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  cyan: boolean;
}

const MOBILE_BREAKPOINT = 768;
const DESKTOP_SYMBOL_COUNT = 16;
const MOBILE_SYMBOL_COUNT = 8;
const DESKTOP_PARTICLE_COUNT = 18;
const MOBILE_PARTICLE_COUNT = 10;

const createFloatingSymbols = (count: number): FloatingSymbol[] => {
  const allSymbols = [...codeSymbols, ...techSymbols];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    symbol: allSymbols[Math.floor(Math.random() * allSymbols.length)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 12,
    duration: Math.random() * 10 + 14,
    delay: Math.random() * 4,
  }));
};

const createParticles = (count: number): ParticleDot[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 3 + Math.random() * 2,
    delay: Math.random() * 2,
    cyan: i % 2 === 0,
  }));

export const AnimatedBackground = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
      : true
  );
  const lowMotion = prefersReducedMotion || isMobile;

  const symbols = useMemo(
    () => createFloatingSymbols(lowMotion ? MOBILE_SYMBOL_COUNT : DESKTOP_SYMBOL_COUNT),
    [lowMotion]
  );

  const particles = useMemo(
    () => createParticles(lowMotion ? MOBILE_PARTICLE_COUNT : DESKTOP_PARTICLE_COUNT),
    [lowMotion]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const applyMatch = () => setIsMobile(mediaQuery.matches);
    applyMatch();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', applyMatch);
      return () => mediaQuery.removeEventListener('change', applyMatch);
    }

    mediaQuery.addListener(applyMatch);
    return () => mediaQuery.removeListener(applyMatch);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-night" />

      {/* Grid Pattern */}
      <div className={`absolute inset-0 grid-pattern ${lowMotion ? 'opacity-15' : 'opacity-30'}`} />

      {lowMotion ? (
        <>
          <div
            className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--glow-cyan) / 0.06) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute bottom-1/4 -right-1/4 w-[620px] h-[620px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--glow-purple) / 0.06) 0%, transparent 70%)',
            }}
          />

          {symbols.map((symbol) => (
            <div
              key={symbol.id}
              className="absolute font-mono select-none"
              style={{
                left: `${symbol.x}%`,
                top: `${symbol.y}%`,
                fontSize: `${symbol.size}px`,
                color: 'hsl(var(--foreground))',
                opacity: 0.025,
              }}
            >
              {symbol.symbol}
            </div>
          ))}

          {particles.map((particle) => (
            <div
              key={`particle-static-${particle.id}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                background: particle.cyan ? 'hsl(var(--glow-cyan))' : 'hsl(var(--glow-purple))',
                opacity: 0.18,
              }}
            />
          ))}
        </>
      ) : (
        <>
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
          {particles.map((particle) => (
            <motion.div
              key={`particle-${particle.id}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                background: particle.cyan ? 'hsl(var(--glow-cyan))' : 'hsl(var(--glow-purple))',
              }}
              animate={{
                opacity: [0.1, 0.4, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};
