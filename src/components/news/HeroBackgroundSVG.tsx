export default function HeroBackgroundSVG() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1200 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Grid pattern */}
      <defs>
        <pattern id="heroGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(220,38,38,0.06)" strokeWidth="0.5" />
        </pattern>
        <pattern id="heroGridLarge" x="0" y="0" width="240" height="240" patternUnits="userSpaceOnUse">
          <path d="M 240 0 L 0 0 0 240" fill="none" stroke="rgba(220,38,38,0.12)" strokeWidth="1" />
        </pattern>
        <linearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0a0a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="redLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(220,38,38,0)" />
          <stop offset="50%" stopColor="rgba(220,38,38,0.4)" />
          <stop offset="100%" stopColor="rgba(220,38,38,0)" />
        </linearGradient>
      </defs>

      <rect width="1200" height="600" fill="#0a0a0a" />
      <rect width="1200" height="600" fill="url(#heroGrid)" />
      <rect width="1200" height="600" fill="url(#heroGridLarge)" />

      {/* Diagonal strike lines */}
      <line x1="0" y1="200" x2="400" y2="0" stroke="rgba(220,38,38,0.08)" strokeWidth="1" />
      <line x1="200" y1="600" x2="800" y2="0" stroke="rgba(220,38,38,0.06)" strokeWidth="1" />
      <line x1="600" y1="600" x2="1200" y2="100" stroke="rgba(220,38,38,0.08)" strokeWidth="1" />
      <line x1="800" y1="600" x2="1200" y2="300" stroke="rgba(220,38,38,0.05)" strokeWidth="1" />

      {/* Node points — system architecture feel */}
      <circle cx="300" cy="150" r="3" fill="rgba(220,38,38,0.2)" />
      <circle cx="300" cy="150" r="8" fill="none" stroke="rgba(220,38,38,0.1)" strokeWidth="0.5" />
      <circle cx="600" cy="300" r="4" fill="rgba(220,38,38,0.3)" />
      <circle cx="600" cy="300" r="12" fill="none" stroke="rgba(220,38,38,0.1)" strokeWidth="0.5" />
      <circle cx="900" cy="200" r="3" fill="rgba(220,38,38,0.2)" />
      <circle cx="900" cy="200" r="8" fill="none" stroke="rgba(220,38,38,0.1)" strokeWidth="0.5" />
      <circle cx="450" cy="400" r="2" fill="rgba(212,160,23,0.2)" />
      <circle cx="1050" cy="450" r="2" fill="rgba(212,160,23,0.15)" />
      <circle cx="150" cy="350" r="2" fill="rgba(220,38,38,0.15)" />

      {/* Connection lines between nodes */}
      <line x1="300" y1="150" x2="600" y2="300" stroke="rgba(220,38,38,0.06)" strokeWidth="0.5" strokeDasharray="4 4" />
      <line x1="600" y1="300" x2="900" y2="200" stroke="rgba(220,38,38,0.06)" strokeWidth="0.5" strokeDasharray="4 4" />
      <line x1="300" y1="150" x2="150" y2="350" stroke="rgba(220,38,38,0.04)" strokeWidth="0.5" strokeDasharray="4 4" />
      <line x1="600" y1="300" x2="450" y2="400" stroke="rgba(220,38,38,0.04)" strokeWidth="0.5" strokeDasharray="4 4" />

      {/* Horizontal scan lines */}
      <rect x="0" y="120" width="1200" height="1" fill="url(#redLine)" opacity="0.3" />
      <rect x="0" y="360" width="1200" height="1" fill="url(#redLine)" opacity="0.2" />
      <rect x="0" y="480" width="1200" height="1" fill="url(#redLine)" opacity="0.15" />

      {/* Data blocks — tactical readout feel */}
      <rect x="80" y="80" width="120" height="2" fill="rgba(220,38,38,0.15)" />
      <rect x="80" y="88" width="80" height="2" fill="rgba(220,38,38,0.08)" />
      <rect x="1000" y="500" width="100" height="2" fill="rgba(220,38,38,0.12)" />
      <rect x="1000" y="508" width="60" height="2" fill="rgba(220,38,38,0.06)" />

      {/* Gradient overlay */}
      <rect width="1200" height="600" fill="url(#heroFade)" />
    </svg>
  );
}
