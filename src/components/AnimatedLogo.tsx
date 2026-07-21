import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Particle {
  id: number;
  x: number;
  y: number;
  char: string;
}

export function AnimatedLogo() {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Burst cute emojis of puppies, coins, trend lines and sparkles on click
  const handleLogoClick = (e: React.MouseEvent) => {
    const symbols = ["🐶", "🐕", "🪙", "📈", "✨", "💰", "🐾"];
    const count = 10;
    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
      const distance = 30 + Math.random() * 30;
      return {
        id: Date.now() + i + Math.random(),
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        char: symbols[Math.floor(Math.random() * symbols.length)],
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 950);
  };

  return (
    <motion.div
      className="flex items-center gap-3 cursor-pointer select-none py-2 px-3.5 rounded-2xl hover:bg-slate-500/5 dark:hover:bg-neutral-800/25 transition-all relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleLogoClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      {/* Particle explosion feedback */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute pointer-events-none text-xl select-none z-50 left-[62px] top-[25px]"
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1, rotate: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              scale: [0.4, 1.2, 0.8],
              opacity: [1, 1, 0],
              rotate: Math.random() * 360 - 180,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {p.char}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* The Exquisite Dual-Puppy Logo illustration (Reduced to 50px height!) */}
      <div className="relative w-[125px] h-[50px] flex items-center justify-center overflow-visible">
        {/* Subtle glow halo in back */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/10 via-amber-400/5 to-emerald-400/10 blur-xl pointer-events-none transition-opacity duration-300 ${
            isHovered ? "opacity-70" : "opacity-30"
          }`}
        />

        {/* Vector SVG containing the Rottie, Corgi, trend arrow, and gold coins stack */}
        <svg
          className="w-[125px] h-[50px] overflow-visible"
          viewBox="0 0 130 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINITIONS for gradient colors and shadows for sleek and distinct outlines */}
          <defs>
            {/* Rottweiler gradients */}
            <linearGradient id="rottieCoat" x1="26" y1="11" x2="26" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2e3234" />
              <stop offset="100%" stopColor="#141617" />
            </linearGradient>
            <linearGradient id="rottieCoatBody" x1="12" y1="24" x2="32" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#282c2e" />
              <stop offset="100%" stopColor="#0d0e10" />
            </linearGradient>
            <linearGradient id="rottieTan" x1="26" y1="18" x2="26" y2="31" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e29852" />
              <stop offset="100%" stopColor="#b56728" />
            </linearGradient>
            
            {/* Corgi gradients */}
            <linearGradient id="corgiCoat" x1="84" y1="11" x2="84" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f39c12" />
              <stop offset="100%" stopColor="#d35400" />
            </linearGradient>
            <linearGradient id="corgiCoatBody" x1="84" y1="32" x2="95" y2="45" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e67e22" />
              <stop offset="100%" stopColor="#c0392b" />
            </linearGradient>
            <linearGradient id="corgiWhite" x1="84" y1="11" x2="84" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f2f6" />
            </linearGradient>
            <linearGradient id="corgiPink" x1="75" y1="8" x2="75" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffb8b8" />
              <stop offset="100%" stopColor="#e17055" />
            </linearGradient>

            {/* Gold Coins gradients */}
            <linearGradient id="coinGold" x1="55" y1="33" x2="55" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffeaa7" />
              <stop offset="50%" stopColor="#fdcb6e" />
              <stop offset="100%" stopColor="#e17055" />
            </linearGradient>
            
            {/* Realistic soft ambient shadows */}
            <radialGradient id="ambientShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Under-dog & under-coin ambient shadows */}
          <ellipse cx="53" cy="46" rx="42" ry="4" fill="url(#ambientShadow)" opacity="0.8" />
          <ellipse cx="22" cy="45" rx="16" ry="3" fill="url(#ambientShadow)" opacity="0.6" />
          <ellipse cx="88" cy="45" rx="16" ry="3" fill="url(#ambientShadow)" opacity="0.6" />

          {/* Background trend line arrow exactly matching the image */}
          <path
            d="M 36 34 L 52 24 L 60 28 L 74 14"
            stroke="#1f5f6e"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          {/* Trend line arrowhead */}
          <path
            d="M 68 14 L 74 14 L 74 20"
            stroke="#1f5f6e"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />

          {/* LEFT PUPPY: Rottweiler */}
          <g>
            {/* Body with crisp outline */}
            <path
              d="M 12 44 Q 8 40 10 32 Q 13 24 22 24 L 32 38 L 24 44"
              fill="url(#rottieCoatBody)"
              stroke="#141617"
              strokeWidth="0.8"
            />
            {/* Back foot */}
            <path
              d="M 14 42 Q 13 46 17 46 Q 21 46 19 40"
              fill="url(#rottieTan)"
              stroke="#80471b"
              strokeWidth="0.5"
            />
            
            {/* Head with crisp outline */}
            <circle
              cx="26"
              cy="22"
              r="11"
              fill="url(#rottieCoat)"
              stroke="#141617"
              strokeWidth="0.8"
            />

            {/* Floppy Left Ear with crisp outline */}
            <path
              d="M 16 14 Q 10 15 13 23 Q 17 25 19 19 Z"
              fill="url(#rottieCoat)"
              stroke="#141617"
              strokeWidth="0.8"
            />

            {/* Floppy Right Ear with crisp outline */}
            <path
              d="M 36 14 Q 42 15 39 23 Q 35 25 33 19 Z"
              fill="url(#rottieCoat)"
              stroke="#141617"
              strokeWidth="0.8"
            />

            {/* Tan Eyebrow dots */}
            <circle cx="22" cy="18" r="1.3" fill="url(#rottieTan)" />
            <circle cx="30" cy="18" r="1.3" fill="url(#rottieTan)" />

            {/* Eyes */}
            <g>
              <circle cx="21.5" cy="21.5" r="2" fill="#1e272e" />
              <circle cx="20.7" cy="20.7" r="0.6" fill="#ffffff" />
              <circle cx="30.5" cy="21.5" r="2" fill="#1e272e" />
              <circle cx="29.7" cy="20.7" r="0.6" fill="#ffffff" />
            </g>

            {/* Tan Muzzle with sharp outline */}
            <ellipse
              cx="26"
              cy="26.5"
              rx="5.5"
              ry="3.8"
              fill="url(#rottieTan)"
              stroke="#b56728"
              strokeWidth="0.5"
            />
            
            {/* Cute Nose */}
            <path d="M 24.5 25.5 C 24.5 24.5 27.5 24.5 27.5 25.5 C 27.5 26.3 26.5 27.2 26 27.2 C 25.5 27.2 24.5 26.3 24.5 25.5 Z" fill="#1e272e" />

            {/* Tongue & Mouth smile */}
            <path d="M 23 27 C 24.5 28.5 27.5 28.5 29 27" stroke="#1e272e" strokeWidth="1" strokeLinecap="round" />
            <path d="M 25 28.2 C 25 28.2 25 32 26 32 C 27 32 27 28.2 27 28.2" fill="#ff7675" />

            {/* Chest Tan patch */}
            <path d="M 21 31 Q 26 36 31 31 L 28 42 L 24 42 Z" fill="url(#rottieTan)" opacity="0.95" />
            {/* Front paws */}
            <path d="M 19 36 Q 17 44 21 44 Q 23 44 23 37" fill="url(#rottieTan)" stroke="#80471b" strokeWidth="0.5" />
            <path d="M 31 36 Q 33 44 29 44 Q 27 44 27 37" fill="url(#rottieTan)" stroke="#80471b" strokeWidth="0.5" />
          </g>

          {/* RIGHT PUPPY: Orange Corgi */}
          <g>
            {/* Body with crisp outline */}
            <path
              d="M 86 32 Q 97 34 95 44 L 84 45"
              fill="url(#corgiCoatBody)"
              stroke="#d35400"
              strokeWidth="0.8"
            />
            {/* White chest with crisp outline */}
            <path
              d="M 77 34 Q 83 45 89 34"
              fill="url(#corgiWhite)"
              stroke="#e8ecef"
              strokeWidth="0.5"
            />

            {/* Head with crisp outline */}
            <circle
              cx="84"
              cy="22"
              r="11"
              fill="url(#corgiCoat)"
              stroke="#d35400"
              strokeWidth="0.8"
            />

            {/* Pointy Left Ear with crisp outline */}
            <g>
              <path d="M 75 18 Q 67 4 76 9 Z" fill="url(#corgiCoat)" stroke="#d35400" strokeWidth="0.8" />
              <path d="M 75 16 Q 69 7 75 11 Z" fill="url(#corgiPink)" />
            </g>

            {/* Pointy Right Ear with crisp outline */}
            <g>
              <path d="M 93 18 Q 101 4 92 9 Z" fill="url(#corgiCoat)" stroke="#d35400" strokeWidth="0.8" />
              <path d="M 93 16 Q 97 7 93 11 Z" fill="url(#corgiPink)" />
            </g>

            {/* White Face stripe */}
            <path d="M 82.5 11 L 85.5 11 L 85 22 L 83 22 Z" fill="url(#corgiWhite)" />

            {/* Eyes */}
            <g>
              <circle cx="79.5" cy="21.5" r="2" fill="#1e272e" />
              <circle cx="78.7" cy="20.7" r="0.6" fill="#ffffff" />
              <circle cx="88.5" cy="21.5" r="2" fill="#1e272e" />
              <circle cx="87.7" cy="20.7" r="0.6" fill="#ffffff" />
            </g>

            {/* White Muzzle with crisp outline */}
            <ellipse
              cx="84"
              cy="26"
              rx="5.5"
              ry="3.8"
              fill="url(#corgiWhite)"
              stroke="#e8ecef"
              strokeWidth="0.5"
            />
            {/* Cute Nose */}
            <circle cx="84" cy="24.5" r="1.3" fill="#1e272e" />
            <path d="M 81.5 25.5 C 82.5 27 85.5 27 86.5 25.5" stroke="#1e272e" strokeWidth="1" strokeLinecap="round" />

            {/* Back Foot (sitting) */}
            <path d="M 93 42 Q 95 45 91 45 Q 89 45 89 41" fill="url(#corgiWhite)" stroke="#e8ecef" strokeWidth="0.5" />

            {/* Left Corgi Paw: Reaching down to gently touch/rest on the golden coin stack */}
            <path d="M 76 32 Q 67 36 63 37 Q 61 39 63 41 Q 68 39 75 35" fill="url(#corgiWhite)" stroke="#e67e22" strokeWidth="0.5" />
          </g>

          {/* CENTRAL GOLD COINS STACK */}
          <g>
            {/* Bottom coin shadow & body */}
            <ellipse cx="55" cy="45" rx="8" ry="2.8" fill="#b45309" stroke="#78350f" strokeWidth="0.5" />
            <ellipse cx="55" cy="43.5" rx="8" ry="2.8" fill="url(#coinGold)" stroke="#d97706" strokeWidth="0.5" />

            {/* Middle coin shadow & body */}
            <ellipse cx="55" cy="41" rx="8" ry="2.8" fill="#b45309" stroke="#78350f" strokeWidth="0.5" />
            <ellipse cx="55" cy="39.5" rx="8" ry="2.8" fill="url(#coinGold)" stroke="#d97706" strokeWidth="0.5" />

            {/* Top coin shadow & body */}
            <ellipse cx="55" cy="37" rx="8" ry="2.8" fill="#b45309" stroke="#78350f" strokeWidth="0.5" />
            <ellipse cx="55" cy="35.5" rx="8" ry="2.8" fill="url(#coinGold)" stroke="#d97706" strokeWidth="0.5" />

            {/* Detail lines on top coin */}
            <ellipse cx="55" cy="35.5" rx="5.5" ry="1.8" fill="none" stroke="#d97706" strokeWidth="0.6" />
          </g>
        </svg>
      </div>

      {/* Balanced 32px Typography next to the logo */}
      <div className="flex items-center font-bold text-[32px] tracking-tight text-[#1f5f6e] dark:text-[#38a5be] font-sans">
        Tally
      </div>
    </motion.div>
  );
}

