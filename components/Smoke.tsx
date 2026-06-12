import React from 'react';

export default function Smoke({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* 3 separate translucent smoke wisps rising with staggered times and properties */}
      <div className="absolute bottom-[-100px] left-1/4 md:left-1/3 w-[150px] md:w-[250px] h-[400px] opacity-15 animate-smoke-1">
        <svg viewBox="0 0 100 200" fill="none" className="w-full h-full text-[#C8860A]">
          <path
            d="M50,180 Q35,140 60,110 T40,60 T55,10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="4 2"
            opacity="0.8"
          />
        </svg>
      </div>

      <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[180px] md:w-[300px] h-[450px] opacity-20 animate-smoke-2">
        <svg viewBox="0 0 100 200" fill="none" className="w-full h-full text-[#E8A820]">
          <path
            d="M50,180 Q65,130 35,90 T65,40 T50,10"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>

      <div className="absolute bottom-[-100px] right-1/4 md:right-1/3 w-[160px] md:w-[260px] h-[380px] opacity-15 animate-smoke-3">
        <svg viewBox="0 0 100 200" fill="none" className="w-full h-full text-[#8B1A1A]">
          <path
            d="M45,180 Q25,120 55,80 T35,30 T45,10"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="5 3"
            opacity="0.75"
          />
        </svg>
      </div>
    </div>
  );
}
