import React from 'react';

export default function Mandala({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Back glow */}
      <div className="absolute w-[280px] h-[280px] md:w-[450px] md:h-[450px] bg-radial from-[rgba(200,134,10,0.15)] via-[rgba(139,26,26,0.1)] to-transparent blur-2xl" />
      
      {/* High detail golden SVG Mandala */}
      <svg
        id="arabic-mandala"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        className="w-[280px] h-[280px] md:w-[420px] md:h-[420px] text-[#C8860A] opacity-35 animate-spin-slow select-none pointer-events-none"
      >
        <g stroke="currentColor" fill="none" strokeWidth="1.5">
          {/* Outermost Ring */}
          <circle cx="200" cy="200" r="190" strokeDasharray="3 3" />
          <circle cx="200" cy="200" r="185" />
          
          {/* Outermost triangles loop (72 segments) */}
          {Array.from({ length: 36 }).map((_, i) => (
            <path
              key={`tri-${i}`}
              d="M 200 10 L 204 15 L 196 15 Z"
              transform={`rotate(${i * 10} 200 200)`}
            />
          ))}

          {/* Star Geometry ring 1 */}
          <circle cx="200" cy="200" r="160" strokeWidth="1" strokeDasharray="6 4" />
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={`ray1-${i}`}
              x1="200"
              y1="40"
              x2="200"
              y2="360"
              transform={`rotate(${i * 11.25} 200 200)`}
              strokeWidth="0.5"
              opacity="0.5"
            />
          ))}

          {/* Detailed Arabesque Petals (Outer Loop) */}
          {Array.from({ length: 12 }).map((_, i) => (
            <path
              key={`petal-out-${i}`}
              d="M 200 200 C 230 110, 260 110, 200 50 C 140 110, 170 110, 200 200"
              transform={`rotate(${i * 30} 200 200)`}
              strokeWidth="1.2"
            />
          ))}

          {/* Middle Ring */}
          <circle cx="200" cy="200" r="110" />
          <circle cx="200" cy="200" r="105" strokeDasharray="2 2" />

          {/* Inner Geometrics / Diamond Star (2 overlapping octagons) */}
          <polygon points="200,92 276,124 308,200 276,276 200,308 124,276 92,200 124,124" strokeWidth="1" />
          <polygon
            points="200,92 276,124 308,200 276,276 200,308 124,276 92,200 124,124"
            transform="rotate(22.5 200 200)"
            strokeWidth="1"
          />

          {/* Inner Arabesque Petals (Inner Loop) */}
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={`petal-in-${i}`}
              d="M 200 200 C 215 140, 230 140, 200 100 C 170 140, 185 140, 200 200"
              transform={`rotate(${i * 45} 200 200)`}
              strokeWidth="1.5"
            />
          ))}

          {/* Center Rings */}
          <circle cx="200" cy="200" r="45" fill="rgba(200, 134, 10, 0.05)" />
          <circle cx="200" cy="200" r="35" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="20" />
          
          {/* Core Star */}
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={`core-${i}`}
              d="M 200 185 L 205 195 L 215 200 L 205 205 L 200 215 L 195 205 L 185 200 L 195 195 Z"
              transform={`rotate(${i * 45} 200 200)`}
              fill="currentColor"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
