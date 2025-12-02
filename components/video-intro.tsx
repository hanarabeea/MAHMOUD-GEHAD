"use client"

import { useEffect, useRef, useState } from "react"

interface VideoIntroProps {
  onComplete: () => void
  onSkip: () => void
}

export default function VideoIntro({ onComplete, onSkip }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

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

    // Also try on any user interaction - CRITICAL for Android
    const handleInteraction = () => {
      if (video.paused) {
        // Must call play() synchronously for Android
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
    };

    // Android needs touchstart, not just click
    document.addEventListener('touchstart', handleInteraction, { once: true, passive: true });
    document.addEventListener('click', handleInteraction, { once: true, passive: true });

    return () => {
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };
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
