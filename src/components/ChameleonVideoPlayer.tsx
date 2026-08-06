import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Maximize2 } from 'lucide-react';

interface ChameleonVideoPlayerProps {
  videoSrc?: string;
  posterSrc?: string;
  title?: string;
  subtitle?: string;
}

export default function ChameleonVideoPlayer({
  videoSrc = 'https://drive.google.com/file/d/1qjR_IlGr-zvkQtxrWqqKCDmxcT0qkLT_/view?usp=sharing',
  posterSrc,
  title = 'Video Inmersivo de DIGITAL HOME',
  subtitle = 'VIDEO 4K • GUARDIÁN BIOMIMÉTICO'
}: ChameleonVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  // Extract Drive ID if Google Drive link is provided
  const extractDriveId = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const driveId = extractDriveId(videoSrc);
  const directStreamUrl = driveId 
    ? `https://lh3.googleusercontent.com/d/${driveId}` 
    : videoSrc;
  const driveDownloadUrl = driveId 
    ? `https://drive.google.com/uc?export=download&id=${driveId}` 
    : videoSrc;
  const iframePreviewUrl = driveId 
    ? `https://drive.google.com/file/d/${driveId}/preview` 
    : null;
  const computedPoster = posterSrc || (driveId ? `https://lh3.googleusercontent.com/d/${driveId}` : undefined);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || useIframeFallback) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    // Force autoplay
    const playVideo = () => {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Autoplay prevented, retrying muted:', err);
            video.muted = true;
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
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
      { threshold: 0.15 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [videoSrc, useIframeFallback]);

  const handleVideoError = () => {
    if (driveId && !useIframeFallback) {
      console.warn('HTML5 Video tag failed to load Google Drive stream directly, switching to Google Drive player iframe.');
      setUseIframeFallback(true);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.muted = isMuted;
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Play interaction failed:', err);
        video.muted = true;
        setIsMuted(true);
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      });
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-black/60 p-3 sm:p-4 group shadow-[0_25px_60px_rgba(0,0,0,0.7)] transition-all duration-500 hover:border-brand-purple/40">
      {/* Background Cybernetic Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/20 via-brand-blue/20 to-purple-600/20 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />

      <div 
        onClick={!useIframeFallback ? togglePlay : undefined}
        className="relative w-full aspect-video sm:aspect-[16/9] rounded-2xl overflow-hidden bg-black flex items-center justify-center select-none"
      >
        {useIframeFallback && iframePreviewUrl ? (
          <iframe
            src={iframePreviewUrl}
            title={title}
            className="w-full h-full border-0 rounded-2xl"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            poster={computedPoster}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={handleVideoError}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-[1.01]"
          >
            {directStreamUrl && <source src={directStreamUrl} type="video/mp4" />}
            {driveDownloadUrl && <source src={driveDownloadUrl} type="video/mp4" />}
            {videoSrc && <source src={videoSrc} type="video/mp4" />}
            <source src="/assets/chameleon_guardian_video.mp4" type="video/mp4" />
          </video>
        )}


        {/* Center Big Play Button (Visible when video is paused and not iframe fallback) */}
        {!useIframeFallback && !isPlaying && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300">
            <button
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-brand-purple/90 hover:bg-brand-purple text-white flex items-center justify-center shadow-[0_0_30px_rgba(106,30,179,0.8)] border border-white/30 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group/btn"
              title="Reproducir Video"
            >
              <Play className="w-8 h-8 fill-white ml-1 group-hover/btn:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Video Controls Overlay */}
        {!useIframeFallback && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-6 z-20 pointer-events-none">
            <div className="flex justify-end pointer-events-auto">
              <button
                onClick={handleFullscreen}
                className="p-2 rounded-xl bg-black/50 hover:bg-black/80 border border-white/20 text-white backdrop-blur-md transition-all duration-200"
                title="Pantalla Completa"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-end justify-between gap-2 sm:gap-4 pointer-events-auto">
              <div className="flex flex-col gap-1 text-left max-w-[65%] sm:max-w-none">
                <span className="text-[9px] sm:text-[10px] font-mono text-brand-purple uppercase tracking-widest block truncate">
                  VISIÓN EN MOVIMIENTO
                </span>
                <h4 className="text-xs sm:text-lg font-bold text-white drop-shadow-md truncate sm:whitespace-normal">
                  {title}
                </h4>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={togglePlay}
                  className="p-2.5 sm:p-3 rounded-xl bg-brand-purple/80 hover:bg-brand-purple text-white border border-white/20 backdrop-blur-md transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                  title={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-2.5 sm:p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                  title={isMuted ? 'Silenciar' : 'Activar Sonido'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

