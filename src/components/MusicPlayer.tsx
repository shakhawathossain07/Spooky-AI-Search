import { useState, useEffect, useRef } from 'react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showNotification, setShowNotification] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Copyright-free meditation music URL (using a royalty-free ambient track)
  // You can replace this with your own copyright-free music URL
  const musicUrl = 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3'; // Peaceful ambient music

  useEffect(() => {
    // Create audio element
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Load saved preference - default to OFF to respect browser autoplay restrictions
    const savedPreference = localStorage.getItem('musicEnabled');
    const hasSeenNotification = localStorage.getItem('musicNotificationSeen');
    
    if (savedPreference === 'true') {
      // User previously enabled music
      setIsPlaying(true);
      audio.play().catch(err => {
        console.log('Autoplay prevented by browser:', err);
        // If autoplay fails, reset to off state
        setIsPlaying(false);
      });
    } else {
      // Default to OFF state
      setIsPlaying(false);
      
      // Show notification for first-time visitors (only once)
      if (!hasSeenNotification) {
        setTimeout(() => {
          setShowNotification(true);
          localStorage.setItem('musicNotificationSeen', 'true');
        }, 2000); // Show after 2 seconds
        
        setTimeout(() => setShowNotification(false), 8000); // Hide after 8 seconds total
      }
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem('musicEnabled', 'false');
    } else {
      audioRef.current.play().catch(err => {
        console.error('Failed to play audio:', err);
      });
      setIsPlaying(true);
      localStorage.setItem('musicEnabled', 'true');
    }
  };

  return (
    <>
      {/* First-time visitor notification */}
      {showNotification && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-purple-900/95 to-blue-900/95 backdrop-blur-xl rounded-lg border border-purple-400/50 p-4 shadow-2xl max-w-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎵</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  Ambient Music Available
                  <span className="px-2 py-0.5 bg-purple-500/30 rounded-full text-xs font-normal">New</span>
                </p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Click the music button above to enjoy peaceful meditation music while you search. 🎧
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-4 right-4 z-50">
        <div className="relative group">
        {/* Attention pulse for first-time visitors */}
        {showNotification && !isPlaying && (
          <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping"></div>
        )}
        
        {/* Music Toggle Button */}
        <button
          onClick={toggleMusic}
          className="relative flex items-center gap-2 px-4 py-2 bg-gray-900/80 backdrop-blur-xl rounded-full border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 shadow-2xl hover:shadow-purple-500/20"
          title={isPlaying ? 'Pause meditation music' : 'Play meditation music'}
        >
          {isPlaying ? (
            <>
              <svg className="w-5 h-5 text-purple-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              <span className="text-sm text-purple-400 font-medium">Music On</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-sm text-gray-400 font-medium">Music Off</span>
            </>
          )}
        </button>

        {/* Volume Control (shows on hover) */}
        {isPlaying && (
          <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-lg border border-purple-500/30 p-3 shadow-2xl">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-xs text-gray-400 w-8">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Music Info Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-900/90 backdrop-blur-xl rounded-lg border border-purple-500/30 px-3 py-2 shadow-2xl whitespace-nowrap">
            <p className="text-xs text-gray-300 flex items-center gap-2">
              <span className="text-purple-400">🎵</span>
              <span>Relaxing Meditation Music</span>
            </p>
          </div>
        </div>
      </div>

      {/* Animated Music Waves (when playing) */}
      {isPlaying && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex items-end gap-1">
          <div className="w-1 bg-purple-400 rounded-full animate-music-wave-1" style={{ height: '8px' }}></div>
          <div className="w-1 bg-purple-400 rounded-full animate-music-wave-2" style={{ height: '12px' }}></div>
          <div className="w-1 bg-purple-400 rounded-full animate-music-wave-3" style={{ height: '6px' }}></div>
          <div className="w-1 bg-purple-400 rounded-full animate-music-wave-1" style={{ height: '10px' }}></div>
        </div>
      )}
      </div>
    </>
  );
}
