"use client"

import { useEffect, useRef, useState } from "react"

interface VideoIntroProps {
  onComplete: () => void
  onSkip: () => void
}

export default function VideoIntro({ onComplete, onSkip }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Aggressively try to autoplay on all devices
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptAutoplay = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
      } catch (error) {
        // If autoplay fails, try again after user interaction
        console.log("Autoplay attempt failed, will retry");
      }
    };

    // Try immediately
    attemptAutoplay();

    // Also try on any user interaction
    const handleInteraction = () => {
      attemptAutoplay();
    };

    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('click', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };
  }, []);

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  return (
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center z-[9999]"
      onClick={onSkip}
    >
      <video 
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline={true}
        muted={true}
        autoPlay={true}
        onEnded={onComplete}
        onLoadedData={handleVideoLoaded}
        preload="auto"
        disablePictureInPicture
        loop={false}
      >
        <source src="/engagement-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Skip Button - Always visible */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
        className="absolute top-4 right-4 md:top-8 md:right-8 z-50 px-4 py-2 bg-black/60 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-black/80 transition-all"
      >
        Skip
      </button>

      {/* Loading indicator */}
      {!videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p className="text-white text-sm">Loading video...</p>
          </div>
        </div>
      )}
    </div>
  );
}
