"use client"

import { useEffect, useRef } from "react"

interface VideoIntroProps {
  onComplete: () => void
  onSkip: () => void
}

export default function VideoIntro({ onComplete, onSkip }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Simple autoplay attempt - let the browser handle it
    const playVideo = () => {
      video.play().catch(() => {
        // Autoplay blocked - browser will handle it
      });
    };

    // Try when video can play
    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, { once: true });
    }
  }, []);

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
        preload="auto"
        disablePictureInPicture
        loop={false}
        poster="/invitation-design.png"
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

    </div>
  );
}
