'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/translations';

export function RomanticAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const wasPlayingRef = useRef(false); // Track if music was playing before tab switch
  const t = useTranslation();

  // Handle first user interaction to start audio (Android requires direct tap/click, not scroll)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let hasStarted = false;

    const startAudio = async (event?: Event) => {
      if (hasStarted || !audioRef.current || isPlaying) return;
      
      try {
        const audio = audioRef.current;
        
        // Ensure src is set
        if (!audio.src || audio.src === '') {
          audio.src = '/romantic-piano.mp3';
        }
        
        // Load the audio explicitly for Android
        audio.load();
        
        // Wait for audio to be ready (Android needs this)
        await new Promise((resolve) => {
          if (audio.readyState >= 4) {
            resolve(undefined);
          } else {
            const onCanPlay = () => {
              audio.removeEventListener('canplaythrough', onCanPlay);
              resolve(undefined);
            };
            audio.addEventListener('canplaythrough', onCanPlay);
            // Timeout fallback for Android
            setTimeout(() => {
              audio.removeEventListener('canplaythrough', onCanPlay);
              resolve(undefined);
            }, 2000);
          }
        });
        
        audio.muted = false;
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          hasStarted = true;
        }
      } catch (err) {
        console.log('Audio play error:', err);
      }
    };

    // Android requires DIRECT user interaction (tap/click), NOT scroll
    // Listen to multiple interaction types for maximum compatibility
    const options = { once: true, passive: true, capture: true };
    
    // Touch events (Android primary)
    document.addEventListener('touchstart', startAudio, options);
    document.addEventListener('touchend', startAudio, options);
    
    // Click events (fallback)
    document.addEventListener('click', startAudio, options);
    
    // Mouse down (desktop)
    document.addEventListener('mousedown', startAudio, options);

    return () => {
      document.removeEventListener('touchstart', startAudio);
      document.removeEventListener('touchend', startAudio);
      document.removeEventListener('click', startAudio);
      document.removeEventListener('mousedown', startAudio);
    };
  }, [isPlaying]);

  // Initialize audio settings
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    // Set initial volume and mute state
    audio.volume = 0.25;
    audio.muted = isMuted;

    // Ensure src is present and set directly (Android needs this)
    if (!audio.src || audio.src === '') {
      audio.src = '/romantic-piano.mp3';
    }

    // Load the audio for Android compatibility
    audio.load();

    // Wait for audio to be ready before attempting to play
    const handleCanPlay = () => {
      // Try to play automatically (works on some browsers, not Android)
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            wasPlayingRef.current = true;
          })
          .catch(() => {
            // Autoplay prevented - this is expected on Android
            console.log('Autoplay prevented, will wait for user interaction');
          });
      }
    };

    // Use canplaythrough for better Android support
    audio.addEventListener('canplaythrough', handleCanPlay, { once: true });

    // If audio is already ready, trigger immediately
    if (audio.readyState >= 4) {
      handleCanPlay();
    }

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      if (audio && !audio.paused) {
        audio.pause();
      }
    };
  }, []);

  // Handle mute state changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
  }, [isMuted]);

  // Pause music when user leaves the browser/tab
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const pauseIfPlaying = () => {
      if (!audioRef.current) return;
      const a = audioRef.current;
      try {
        // Force stop and silence in background across browsers
        a.muted = true;
        a.pause();
        try { a.currentTime = 0; } catch {}
        try { a.removeAttribute('src'); } catch {}
        try { a.load(); } catch {}
        wasPlayingRef.current = false;
        setIsPlaying(false);
        // Best effort: clear media session playback indicator when supported
        try { (navigator as any)?.mediaSession && ((navigator as any).mediaSession.playbackState = 'none'); } catch {}
      } catch (error) {
        console.error('Error while pausing audio:', error);
      }
    };

    const isDocumentHidden = () => {
      const d = document as any;
      return d.hidden === true || d.visibilityState === 'hidden' || d.webkitHidden === true;
    };

    const handleVisibilityChange = () => {
      if (isDocumentHidden()) {
        pauseIfPlaying();
      }
    };

    const handlePageHide = () => {
      // iOS Safari reliably fires pagehide on app switch/back/close
      pauseIfPlaying();
    };

    const handleBeforeUnload = () => {
      pauseIfPlaying();
    };

    const handleBlur = () => {
      // Some browsers only fire blur when switching tabs
      pauseIfPlaying();
    };

    const handleFreeze = () => {
      // Chrome Page Lifecycle: tab is frozen
      pauseIfPlaying();
    };

    try {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      // Safari older versions
      (document as any).addEventListener?.('webkitvisibilitychange', handleVisibilityChange as EventListener);
      document.addEventListener('freeze', handleFreeze as EventListener);
      // pagehide on both window and document for broader coverage
      document.addEventListener('pagehide', handlePageHide as EventListener);
      window.addEventListener('pagehide', handlePageHide);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('blur', handleBlur);
    } catch (error) {
      console.error('Error adding pause listeners:', error);
    }

    return () => {
      try {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        (document as any).removeEventListener?.('webkitvisibilitychange', handleVisibilityChange as EventListener);
        document.removeEventListener('freeze', handleFreeze as EventListener);
        document.removeEventListener('pagehide', handlePageHide as EventListener);
        window.removeEventListener('pagehide', handlePageHide);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('blur', handleBlur);
      } catch (error) {
        console.error('Error removing pause listeners:', error);
      }
    };
  }, [isMuted]);

  const toggleMute = async () => {
    // Also try to start audio if user clicks mute button and audio hasn't started
    if (!isPlaying && audioRef.current) {
      try {
        const audio = audioRef.current;
        if (!audio.src || audio.src === '') {
          audio.src = '/romantic-piano.mp3';
        }
        audio.load();
        audio.muted = false;
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.log('Audio start on mute button click:', err);
      }
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="
          rounded-full w-12 h-12 
          bg-accent hover:bg-muted
          active:bg-muted/80
          transition-all duration-200 
          flex items-center justify-center
          shadow-md
          text-accent-foreground
        "
        aria-label={isMuted ? t('unmuteMusic') : t('muteMusic')}
        title={isMuted ? t('unmuteMusic') : t('muteMusic')}
      >
        {isMuted ? (
          <VolumeX className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Volume2 className="h-6 w-6" aria-hidden="true" />
        )}
      </Button>
      
      <audio
        ref={audioRef}
        src="/romantic-piano.mp3"
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        className="hidden"
      />
    </div>
  );
}