interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 48, text: 'text-2xl' },
    lg: { icon: 64, text: 'text-4xl' },
    xl: { icon: 96, text: 'text-6xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Professional Ghost Logo */}
      <div className="relative" style={{ width: icon, height: icon }}>
        {/* Glow effect */}
        <div className="absolute inset-0 blur-lg opacity-60">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <path
              d="M50 5C25 5 10 25 10 50C10 75 10 95 10 95L25 85L40 95L50 85L60 95L75 85L90 95C90 95 90 75 90 50C90 25 75 5 50 5Z"
              fill="url(#glowGrad)"
            />
          </svg>
        </div>
        
        {/* Main logo */}
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
          <defs>
            {/* Main gradient */}
            <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            
            {/* Shine gradient */}
            <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.4" />
              <stop offset="50%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            
            {/* Eye glow */}
            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </radialGradient>
            
            {/* Drop shadow */}
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7c3aed" floodOpacity="0.5"/>
            </filter>
          </defs>
          
          {/* Ghost body */}
          <path
            d="M50 8C28 8 12 26 12 48C12 70 12 92 12 92L24 84L36 92L50 82L64 92L76 84L88 92C88 92 88 70 88 48C88 26 72 8 50 8Z"
            fill="url(#ghostGrad)"
            filter="url(#shadow)"
          />
          
          {/* Shine overlay */}
          <path
            d="M50 8C28 8 12 26 12 48C12 55 12 60 12 60C20 55 35 52 50 52C65 52 80 55 88 60C88 60 88 55 88 48C88 26 72 8 50 8Z"
            fill="url(#shineGrad)"
          />
          
          {/* Left eye */}
          <ellipse cx="35" cy="42" rx="10" ry="12" fill="#1e1b4b" />
          <ellipse cx="35" cy="42" rx="7" ry="9" fill="url(#eyeGlow)" />
          <ellipse cx="33" cy="40" rx="3" ry="4" fill="white" opacity="0.8" />
          
          {/* Right eye */}
          <ellipse cx="65" cy="42" rx="10" ry="12" fill="#1e1b4b" />
          <ellipse cx="65" cy="42" rx="7" ry="9" fill="url(#eyeGlow)" />
          <ellipse cx="63" cy="40" rx="3" ry="4" fill="white" opacity="0.8" />
          
          {/* Smile */}
          <path
            d="M38 58 Q50 68 62 58"
            stroke="#1e1b4b"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Sparkles */}
          <g fill="#fbbf24" opacity="0.9">
            <polygon points="20,20 22,25 27,25 23,28 25,33 20,30 15,33 17,28 13,25 18,25" />
            <polygon points="80,15 81,18 84,18 82,20 83,23 80,21 77,23 78,20 76,18 79,18" transform="scale(0.7) translate(30, 5)" />
          </g>
          
          {/* AI circuit pattern on body */}
          <g stroke="#a5b4fc" strokeWidth="1" opacity="0.3" fill="none">
            <path d="M30 65 L30 72 L40 72" />
            <path d="M70 65 L70 72 L60 72" />
            <circle cx="30" cy="65" r="2" fill="#a5b4fc" />
            <circle cx="70" cy="65" r="2" fill="#a5b4fc" />
            <circle cx="50" cy="72" r="2" fill="#a5b4fc" />
          </g>
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black ${text} bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-tight`}>
            Spooky AI
          </span>
          <span className="text-xs text-gray-500 tracking-widest uppercase">Search Engine</span>
        </div>
      )}
    </div>
  );
}

// Favicon component for generating favicon
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="favEye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0891b2" />
        </radialGradient>
      </defs>
      
      <path
        d="M50 5C25 5 10 25 10 50C10 75 10 95 10 95L25 85L40 95L50 85L60 95L75 85L90 95C90 95 90 75 90 50C90 25 75 5 50 5Z"
        fill="url(#favGrad)"
      />
      
      <ellipse cx="35" cy="42" rx="8" ry="10" fill="#1e1b4b" />
      <ellipse cx="35" cy="42" rx="5" ry="7" fill="url(#favEye)" />
      
      <ellipse cx="65" cy="42" rx="8" ry="10" fill="#1e1b4b" />
      <ellipse cx="65" cy="42" rx="5" ry="7" fill="url(#favEye)" />
      
      <path d="M38 58 Q50 66 62 58" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
