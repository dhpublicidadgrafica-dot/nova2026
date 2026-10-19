import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, ShieldCheck } from 'lucide-react';

interface ChameleonVideoPlayerProps {
  videoSrc?: string;
  posterSrc?: string;
  title?: string;
  subtitle?: string;
}

export default function ChameleonVideoPlayer({
  videoSrc = '/assets/chameleon_guardian_video.mp4',
  posterSrc = '/assets/chameleon_poster.png',
  title = 'El Guardián KAMALEON de DIGITAL HOME',
  subtitle = 'VIDEO INMERSIVO • GUARDIÁN BIOMIMÉTICO'
}: ChameleonVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10);
  const [hasEnded, setHasEnded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play when visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    const playVideo = () => {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            video.muted = true;
            video.play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          });
      }
    };

    playVideo();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playVideo();
          } else {
            if (!video.paused) {
              video.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [videoSrc]);

  // Video time tracking
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (video.duration && !isNaN(video.duration)) {
      setDuration(video.duration);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.duration && !isNaN(video.duration)) {
      setDuration(video.duration);
    }
  };

  const handleEnded = () => {
    setHasEnded(true);
    setIsPlaying(false);
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (hasEnded) {
      video.currentTime = 0;
      setHasEnded(false);
    }

    if (video.paused) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    const bar = progressBarRef.current;
    if (!video || !bar) return;

    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * (duration || 10);
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-black/60 p-2.5 sm:p-4 group shadow-[0_25px_60px_rgba(0,0,0,0.7)] transition-all duration-500 hover:border-brand-purple/40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Cybernetic Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/20 via-brand-blue/20 to-purple-600/20 rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />

      <div 
        onClick={() => togglePlay()}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center select-none cursor-pointer"
      >
        <video
          ref={videoRef}
          poster={posterSrc}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPlay={() => {
            setIsPlaying(true);
            setHasEnded(false);
          }}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-[1.01]"
        >
          <source src={videoSrc} type="video/mp4" />
          <source src="/assets/chameleon_guardian_video.mp4" type="video/mp4" />
          <source src="/assets/chameleon_video.mp4" type="video/mp4" />
        </video>

        {/* Center Big Play / Replay Button when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 backdrop-blur-[2px] transition-all duration-300">
            <button
              type="button"
              onClick={togglePlay}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-purple/90 hover:bg-brand-purple text-white flex items-center justify-center shadow-[0_0_35px_rgba(106,30,179,0.85)] border border-white/30 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group/btn"
              title={hasEnded ? 'Repetir Video' : 'Reproducir Video'}
              aria-label={hasEnded ? 'Repetir Video' : 'Reproducir Video'}
            >
              {hasEnded ? (
                <RotateCcw className="w-7 h-7 sm:w-8 sm:h-8" />
              ) : (
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white ml-1 group-hover/btn:scale-110 transition-transform" />
              )}
            </button>
          </div>
        )}

        {/* Top Floating Badge Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 border border-white/15 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
            <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase font-bold text-white">
              {subtitle}
            </span>
          </div>

          <button
            type="button"
            onClick={handleFullscreen}
            className="pointer-events-auto p-2 rounded-xl bg-black/60 hover:bg-black/90 border border-white/15 text-white backdrop-blur-md transition-all duration-200 cursor-pointer"
            title="Pantalla Completa"
            aria-label="Pantalla Completa"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Bottom Interactive Controls Overlay */}
        <div 
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 sm:p-5 z-20 transition-opacity duration-300 flex flex-col gap-2.5 ${
            isHovered || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 sm:opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress / Scrub Bar */}
          <div 
            ref={progressBarRef}
            onClick={handleSeek}
            className="w-full h-2 bg-white/20 hover:h-3 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 group/bar"
            title="Avanzar / Retroceder video"
          >
            <div 
              className="h-full bg-gradient-to-r from-brand-blue via-brand-purple to-brand-orange rounded-full relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control Buttons & Info */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 text-left">
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 sm:p-2.5 rounded-xl bg-brand-purple/90 hover:bg-brand-purple text-white border border-white/20 transition-all duration-200 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all duration-200 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                title={isMuted ? 'Activar Sonido' : 'Silenciar'}
                aria-label={isMuted ? 'Activar Sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-white/70" /> : <Volume2 className="w-4 h-4 text-brand-green" />}
              </button>

              <span className="text-[10px] sm:text-xs font-mono text-white/80">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-white block">
                {title}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
