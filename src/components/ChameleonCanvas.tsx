import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { ServiceId } from '../types';

interface ChameleonCanvasProps {
  activeService: ServiceId | 'inicio' | 'nosotros' | 'contacto' | 'blog' | 'portafolio';
  hoveredService: ServiceId | null;
  isFooter?: boolean;
}

// Service-specific color palettes & holographic themes
const SERVICE_THEMES: Record<string, {
  name: string;
  primary: string;
  secondary: string;
  glow: string;
  eyeColor: string;
  auraBg: string;
  hudText: string;
  filter: string;
}> = {
  branding: {
    name: 'Branding de Marca',
    primary: '#60AB26',
    secondary: '#437E17',
    glow: 'rgba(96, 171, 38, 0.45)',
    eyeColor: '#81D041',
    auraBg: 'from-[#60AB26]/30 via-emerald-600/20 to-transparent',
    hudText: 'IDENTIDAD BIOMIMÉTICA',
    filter: 'hue-rotate(95deg) saturate(1.3) contrast(1.08)'
  },
  web: {
    name: 'Páginas Web',
    primary: '#F7AA03',
    secondary: '#C48400',
    glow: 'rgba(247, 170, 3, 0.45)',
    eyeColor: '#FFC533',
    auraBg: 'from-[#F7AA03]/30 via-amber-500/20 to-transparent',
    hudText: 'ARQUITECTURA WEB ULTRA-RÁPIDA',
    filter: 'hue-rotate(35deg) saturate(1.4) contrast(1.08)'
  },
  ecommerce: {
    name: 'Tiendas Online',
    primary: '#DE4C00',
    secondary: '#A03400',
    glow: 'rgba(222, 76, 0, 0.45)',
    eyeColor: '#FF6F26',
    auraBg: 'from-[#DE4C00]/30 via-orange-600/20 to-transparent',
    hudText: 'CONVERSIÓN DE ALTO IMPACTO',
    filter: 'hue-rotate(15deg) saturate(1.45) contrast(1.08)'
  },
  ai: {
    name: 'Agentes IA',
    primary: '#044FCD',
    secondary: '#02348A',
    glow: 'rgba(4, 79, 205, 0.45)',
    eyeColor: '#3B82F6',
    auraBg: 'from-[#044FCD]/30 via-blue-600/20 to-transparent',
    hudText: 'AGENTES COGNITIVOS IA',
    filter: 'hue-rotate(195deg) saturate(1.35) contrast(1.1)'
  },
  software: {
    name: 'Software a Medida',
    primary: '#6A1EB3',
    secondary: '#48127E',
    glow: 'rgba(106, 30, 179, 0.45)',
    eyeColor: '#9B4BE5',
    auraBg: 'from-[#6A1EB3]/30 via-purple-600/20 to-transparent',
    hudText: 'SISTEMAS ENTERPRISE ESCALABLES',
    filter: 'hue-rotate(255deg) saturate(1.4) contrast(1.1)'
  },
  merch: {
    name: 'Merchandising',
    primary: '#FF1D1D',
    secondary: '#B80000',
    glow: 'rgba(255, 29, 29, 0.45)',
    eyeColor: '#FF5E5E',
    auraBg: 'from-[#FF1D1D]/30 via-red-600/20 to-transparent',
    hudText: 'EXPERIENCIA DE MARCA FÍSICA',
    filter: 'hue-rotate(330deg) saturate(1.45) contrast(1.1)'
  },
  default: {
    name: 'Ecosistema Integral',
    primary: '#0D6EFD',
    secondary: '#6366F1',
    glow: 'rgba(13, 110, 253, 0.4)',
    eyeColor: '#60A5FA',
    auraBg: 'from-blue-600/25 via-purple-600/15 to-transparent',
    hudText: 'GUARDIÁN BIOMIMÉTICO 3D',
    filter: 'saturate(1.1) contrast(1.05)'
  }
};

export default function ChameleonCanvas({
  activeService,
  hoveredService,
  isFooter = false
}: ChameleonCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Interactive mouse tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [pulseScan, setPulseScan] = useState(0);

  // Active theme determination
  const currentKey = hoveredService || (activeService in SERVICE_THEMES ? activeService : 'default');
  const palette = SERVICE_THEMES[currentKey] || SERVICE_THEMES.default;

  // 1. Mouse movement listener for smooth 3D tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const offsetX = e.clientX - centerX;
      const offsetY = e.clientY - centerY;

      // Limit tilt angles (-10deg to +10deg)
      const tiltX = Math.max(-10, Math.min(10, (offsetY / (window.innerHeight / 2)) * -12));
      const tiltY = Math.max(-10, Math.min(10, (offsetX / (window.innerWidth / 2)) * 12));

      setTilt({ x: tiltX, y: tiltY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 2. Holographic HUD scanning loop
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setPulseScan((prev) => (prev + 1) % 100);
    }, 45);
    return () => clearInterval(scanInterval);
  }, []);

  // 3. Autoplay and loop video reliably
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    const tryPlay = () => {
      const promise = video.play();
      if (promise !== undefined) {
        promise
          .then(() => setIsVideoPlaying(true))
          .catch(() => {
            video.muted = true;
            video.play()
              .then(() => setIsVideoPlaying(true))
              .catch(() => setIsVideoPlaying(false));
          });
      }
    };

    tryPlay();

    const handleVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else {
        tryPlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // 4. Toggle audio
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full flex items-center justify-center select-none ${
        isFooter ? 'h-48 sm:h-64' : 'h-[360px] sm:h-[480px] lg:h-[530px]'
      }`}
    >
      {/* 1. OUTER HOLOGRAPHIC CYBERNETIC AURA */}
      <div 
        className={`absolute inset-0 rounded-full bg-gradient-to-tr ${palette.auraBg} blur-3xl opacity-75 transition-all duration-700 animate-pulse`}
        style={{
          boxShadow: `0 0 100px ${palette.glow}`,
        }}
      />

      {/* 2. TECH HUD ORBITAL SPINS */}
      <div className="absolute inset-2 sm:inset-6 rounded-full animate-[spin_40s_linear_infinite] pointer-events-none opacity-60">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-colors duration-700 shadow-lg"
          style={{ backgroundColor: palette.primary, boxShadow: `0 0 15px ${palette.primary}` }}
        />
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-70 transition-colors duration-700"
          style={{ backgroundColor: palette.secondary }}
        />
      </div>

      <div className="absolute inset-10 sm:inset-16 rounded-full animate-[spin_25s_linear_infinite_reverse] pointer-events-none opacity-40">
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full transition-colors duration-700"
          style={{ backgroundColor: palette.primary }}
        />
      </div>

      {/* 3. RADIAL SCANNING BEAM */}
      <div 
        className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none transition-all duration-300"
        style={{
          top: `${pulseScan}%`,
          boxShadow: `0 0 15px ${palette.primary}`,
        }}
      />

      {/* 4. MAIN 3D TILT CONTAINER FOR THE CHAMELEON ANIMATION */}
      <div 
        className="relative w-full max-w-[340px] sm:max-w-[460px] lg:max-w-[500px] aspect-[16/10] sm:aspect-video flex items-center justify-center transition-transform duration-200 ease-out z-10"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* Sleek Glassmorphism Cyber-Shield Frame */}
        <div 
          className="relative w-full h-full rounded-3xl overflow-hidden border border-white/20 bg-[#060B16]/80 p-2 sm:p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-700 group hover:border-white/35"
          style={{
            boxShadow: `0 20px 50px -10px ${palette.glow}, 0 0 30px rgba(0,0,0,0.9)`,
          }}
        >
          {/* Inner Video Container with Chromatic Shift Filter */}
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center">
            
            {/* 3D Chameleon Video Render */}
            <video
              ref={videoRef}
              src="/assets/chameleon_guardian_video.mp4"
              poster="/assets/chameleon_poster.png"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              onPlay={() => setIsVideoPlaying(true)}
              className="w-full h-full object-cover transition-all duration-700"
              style={{
                filter: palette.filter,
              }}
            />

            {/* Subtle Futuristic Radial Vignette to blend edges */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60 pointer-events-none" />

            {/* Corner Tech Reticle Lines */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 pointer-events-none transition-colors duration-500" style={{ borderColor: palette.primary }} />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 pointer-events-none transition-colors duration-500" style={{ borderColor: palette.primary }} />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 pointer-events-none transition-colors duration-500" style={{ borderColor: palette.primary }} />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 pointer-events-none transition-colors duration-500" style={{ borderColor: palette.primary }} />

            {/* Top Status Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-white/15 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: palette.primary }} />
                <span className="text-[9px] sm:text-[10px] font-mono tracking-wider font-bold text-white uppercase">
                  KAMALEON 3D • ONLINE
                </span>
              </div>

              {/* Mute / Unmute Interactive Audio Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md hover:scale-110 active:scale-95"
                title={isMuted ? 'Activar Sonido del Guardián' : 'Silenciar'}
                aria-label={isMuted ? 'Activar Sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white/70" /> : <Volume2 className="w-3.5 h-3.5 text-brand-green" />}
              </button>
            </div>

            {/* Dynamic Interactive HUD Badge */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
              <div className="px-3 py-1 rounded-xl bg-black/75 border border-white/15 backdrop-blur-md flex items-center gap-2">
                <Activity className="w-3 h-3 text-white/70" />
                <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-white font-semibold uppercase">
                  {palette.hudText}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/75 border border-white/15 backdrop-blur-md">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] font-mono text-[#D9D9D9]/80 uppercase">
                  BIOMIMÉTICO
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Subtle Bottom Ambient Platform Glow */}
      <div 
        className="absolute bottom-2 w-2/3 h-5 rounded-full blur-2xl opacity-60 transition-colors duration-700 pointer-events-none"
        style={{ backgroundColor: palette.primary }}
      />
    </div>
  );
}
