import React, { useState, useEffect, useRef } from 'react';
import { ServiceId } from '../types';

interface ChameleonCanvasProps {
  activeService: ServiceId | 'inicio' | 'nosotros' | 'contacto' | 'blog' | 'portafolio';
  hoveredService: ServiceId | null;
  isFooter?: boolean;
}

// Service-specific color palettes & holographic themes
const SERVICE_THEMES: Record<string, {
  primary: string;
  secondary: string;
  glow: string;
  eyeColor: string;
  skinTint: string;
  auraBg: string;
  hudText: string;
}> = {
  branding: {
    primary: '#60AB26', // Custom smooth green
    secondary: '#437E17',
    glow: 'rgba(96, 171, 38, 0.45)',
    eyeColor: '#81D041',
    skinTint: 'green',
    auraBg: 'from-[#60AB26]/30 via-emerald-600/15 to-transparent',
    hudText: 'IDENTIDAD BIOMIMÉTICA'
  },
  web: {
    primary: '#F7AA03', // Custom smooth yellow
    secondary: '#C48400',
    glow: 'rgba(247, 170, 3, 0.45)',
    eyeColor: '#FFC533',
    skinTint: 'yellow',
    auraBg: 'from-[#F7AA03]/30 via-amber-500/15 to-transparent',
    hudText: 'ARQUITECTURA WEB ULTRA-RÁPIDA'
  },
  ecommerce: {
    primary: '#DE4C00', // Custom smooth orange
    secondary: '#A03400',
    glow: 'rgba(222, 76, 0, 0.45)',
    eyeColor: '#FF6F26',
    skinTint: 'orange',
    auraBg: 'from-[#DE4C00]/30 via-orange-600/15 to-transparent',
    hudText: 'CONVERSIÓN DE ALTO IMPACTO'
  },
  ai: {
    primary: '#044FCD', // Custom smooth royal electric blue
    secondary: '#02348A',
    glow: 'rgba(4, 79, 205, 0.45)',
    eyeColor: '#3B82F6',
    skinTint: 'blue',
    auraBg: 'from-[#044FCD]/30 via-blue-600/15 to-transparent',
    hudText: 'AGENTES COGNITIVOS IA'
  },
  software: {
    primary: '#6A1EB3', // Custom smooth purple
    secondary: '#48127E',
    glow: 'rgba(106, 30, 179, 0.45)',
    eyeColor: '#9B4BE5',
    skinTint: 'purple',
    auraBg: 'from-[#6A1EB3]/30 via-purple-600/15 to-transparent',
    hudText: 'SISTEMAS ENTERPRISE ESCALABLES'
  },
  merch: {
    primary: '#FF1D1D', // Custom smooth red
    secondary: '#B80000',
    glow: 'rgba(255, 29, 29, 0.45)',
    eyeColor: '#FF5E5E',
    skinTint: 'red',
    auraBg: 'from-[#FF1D1D]/30 via-red-600/15 to-transparent',
    hudText: 'MERCHANDISING Y EXPERIENCIA FÍSICA'
  },
  default: {
    primary: '#0D6EFD',
    secondary: '#6366F1',
    glow: 'rgba(13, 110, 253, 0.35)',
    eyeColor: '#60A5FA',
    skinTint: 'default',
    auraBg: 'from-blue-600/15 via-purple-600/10 to-transparent',
    hudText: 'SISTEMA ADAPTATIVO EN LINEA'
  }
};

export default function ChameleonCanvas({
  activeService,
  hoveredService,
  isFooter = false
}: ChameleonCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for interactive mouse rotation/tilt
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [pulseScan, setPulseScan] = useState(0);

  // Active theme determination
  const currentKey = hoveredService || (activeService in SERVICE_THEMES ? activeService : 'default');
  const palette = SERVICE_THEMES[currentKey] || SERVICE_THEMES.default;

  // 1. Mouse movement listener for 3D tilt & eye tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const offsetX = e.clientX - centerX;
      const offsetY = e.clientY - centerY;

      // Limit tilt angles (-15deg to +15deg)
      const tiltX = Math.max(-12, Math.min(12, (offsetY / (window.innerHeight / 2)) * -15));
      const tiltY = Math.max(-12, Math.min(12, (offsetX / (window.innerWidth / 2)) * 15));

      setTilt({ x: tiltX, y: tiltY });

      // Eye pupil tracking offset (-8px to +8px)
      const eyeX = Math.max(-8, Math.min(8, (offsetX / (rect.width / 2)) * 8));
      const eyeY = Math.max(-8, Math.min(8, (offsetY / (rect.height / 2)) * 8));
      setMousePos({ x: eyeX, y: eyeY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 2. Random eye blink simulation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 180);
      }
    }, 3500);

    return () => clearInterval(blinkInterval);
  }, []);

  // 3. Holographic HUD scanning loop
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setPulseScan((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(scanInterval);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full flex items-center justify-center select-none ${
        isFooter ? 'h-48 sm:h-64' : 'h-[360px] sm:h-[480px] lg:h-[540px]'
      }`}
    >
      {/* SVG Color Filters for Monotone / Dynamic Skin Tinting */}
      <svg className="hidden">
        <defs>
          <filter id="green-monotone">
            <feColorMatrix
              type="matrix"
              values="0.09 0.27 0.02 0 0
                      0.16 0.52 0.04 0 0
                      0.03 0.11 0.01 0 0
                      0    0    0    1 0"
            />
          </filter>
          <filter id="yellow-monotone">
            <feColorMatrix
              type="matrix"
              values="0.21 0.69 0.07 0 0
                      0.14 0.48 0.05 0 0
                      0.01 0.01 0.00 0 0
                      0    0    0    1 0"
            />
          </filter>
          <filter id="orange-monotone">
            <feColorMatrix
              type="matrix"
              values="0.19 0.62 0.06 0 0
                      0.06 0.22 0.02 0 0
                      0.00 0.00 0.00 0 0
                      0    0    0    1 0"
            />
          </filter>
          <filter id="blue-monotone">
            <feColorMatrix
              type="matrix"
              values="0.01 0.02 0.00 0 0
                      0.06 0.22 0.02 0 0
                      0.16 0.57 0.06 0 0
                      0    0    0    1 0"
            />
          </filter>
          <filter id="purple-monotone">
            <feColorMatrix
              type="matrix"
              values="0.09 0.30 0.03 0 0
                      0.02 0.08 0.01 0 0
                      0.15 0.50 0.05 0 0
                      0    0    0    1 0"
            />
          </filter>
          <filter id="red-monotone">
            <feColorMatrix
              type="matrix"
              values="0.21 0.72 0.07 0 0
                      0.02 0.08 0.01 0 0
                      0.02 0.08 0.01 0 0
                      0    0    0    1 0"
            />
          </filter>
        </defs>
      </svg>

      {/* 1. OUTER HOLOGRAPHIC CYBERNETIC AURA */}
      <div 
        className={`absolute inset-0 rounded-full bg-gradient-to-tr ${palette.auraBg} blur-3xl opacity-70 transition-all duration-1000 animate-pulse`}
        style={{
          boxShadow: `0 0 80px ${palette.glow}`,
        }}
      />

      {/* 2. TECH HUD ORBITAL SPINS (Movement dots without border frame lines) */}
      <div className="absolute inset-4 sm:inset-10 rounded-full animate-[spin_40s_linear_infinite] pointer-events-none">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full transition-colors duration-700"
          style={{ backgroundColor: palette.primary, boxShadow: `0 0 12px ${palette.primary}` }}
        />
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full opacity-60 transition-colors duration-700"
          style={{ backgroundColor: palette.secondary }}
        />
      </div>

      <div className="absolute inset-12 sm:inset-20 rounded-full animate-[spin_25s_linear_infinite_reverse] pointer-events-none" />

      {/* 3. RADIAL SCANNING BEAM */}
      <div 
        className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none transition-all duration-300"
        style={{
          top: `${pulseScan}%`,
          boxShadow: `0 0 15px ${palette.primary}`,
        }}
      />

      {/* 4. MAIN 3D TILT CONTAINER FOR THE MASCOT */}
      <div 
        className="relative w-full max-w-[320px] sm:max-w-[420px] aspect-square flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* 5. MASKED IMAGE CONTAINER WITH DYNAMIC CHROMATIC SHIFT */}
        <div 
          className="relative w-full h-full p-6 sm:p-8 flex items-center justify-center transition-all duration-700"
          style={{
            filter: `drop-shadow(0 15px 35px ${palette.glow})`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Main Chameleon Logo Image Render */}
          <img
            src="https://lh3.googleusercontent.com/d/1-BBeRZDeDNsbeNKI2Hdo5LaYEGW9ncZk"
            alt="El Camaleón - DIGITAL HOME"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain transition-all duration-1000 filter"
            style={{
              // Give a single-tone high-end filter based on active service
              filter: (currentKey === 'branding' 
                ? 'url(#green-monotone) contrast(1.1) brightness(1.12)'
                : currentKey === 'web'
                ? 'url(#yellow-monotone) contrast(1.15) brightness(1.12)'
                : currentKey === 'ecommerce'
                ? 'url(#orange-monotone) contrast(1.12) brightness(1.12)'
                : currentKey === 'ai'
                ? 'url(#blue-monotone) contrast(1.15) brightness(1.1)'
                : currentKey === 'software'
                ? 'url(#purple-monotone) contrast(1.15) brightness(1.1)'
                : currentKey === 'merch'
                ? 'url(#red-monotone) contrast(1.15) brightness(1.12)'
                : 'contrast(1.1) saturate(1.25)') + ` drop-shadow(0 20px 45px ${palette.glow || 'rgba(13,110,253,0.3)'})`,
              transform: 'translateZ(30px)',
            }}
          />

          {/* 6. HYPER-DETAILED CYBERNETIC EYE (Physically tracks cursor & blinks) */}
          <div 
            className="absolute z-10 pointer-events-none transition-all duration-300"
            style={{
              // Position calculated specifically for the eye position of this chameleon mascot render
              top: '38.5%',
              left: '42.8%',
              width: '11.5%',
              height: '11.5%',
              transform: 'translateZ(50px)',
            }}
          >
            {/* Outer Cyber Iris Frame */}
            <div 
              className={`relative w-full h-full rounded-full border-2 border-white/60 bg-black/90 flex items-center justify-center overflow-hidden transition-all duration-300 ${
                isBlinking ? 'scale-y-[0.05]' : 'scale-y-100'
              }`}
              style={{
                boxShadow: `0 0 15px ${palette.eyeColor}`,
                borderColor: palette.eyeColor,
              }}
            >
              {/* Inner Glowing Pupil (Tracks Mouse Position) */}
              <div 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-transform duration-100 ease-out"
                style={{
                  backgroundColor: palette.eyeColor,
                  transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
                  boxShadow: `0 0 10px ${palette.eyeColor}, inset 0 0 4px #000`,
                }}
              >
                {/* Central High-Tech Slit Pupil */}
                <div className="w-1 h-2.5 sm:h-3 bg-black rounded-full" />
              </div>

              {/* Holographic Eye Glint Reflection */}
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
            </div>
          </div>

          {/* 7. ENERGY CIRCUIT OVERLAY NODES */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Pulsing Target Reticle Node 1 (Head) */}
            <div 
              className="absolute w-3 h-3 rounded-full border border-white/40 flex items-center justify-center animate-ping"
              style={{ top: '30%', left: '48%', animationDuration: '3s' }}
            >
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: palette.primary }} />
            </div>

            {/* Pulsing Target Reticle Node 2 (Spine) */}
            <div 
              className="absolute w-2.5 h-2.5 rounded-full border border-white/30 flex items-center justify-center animate-pulse"
              style={{ top: '52%', left: '60%' }}
            >
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: palette.secondary }} />
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Ambient Platform Glow */}
      <div 
        className="absolute bottom-2 w-1/2 h-4 rounded-full blur-xl opacity-50 transition-colors duration-700"
        style={{ backgroundColor: palette.primary }}
      />
    </div>
  );
}
