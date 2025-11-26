import { useState, useEffect, useRef } from 'react';

interface VoiceSearchProps {
  onTranscript: (text: string) => void;
  onSearch: () => void;
}

export default function VoiceSearch({ onTranscript, onSearch }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(Array(12).fill(5));
  const recognitionRef = useRef<any>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        onTranscript(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        setVisualizerBars(Array(12).fill(5));
        onSearch();
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [onTranscript, onSearch]);

  // Animate visualizer bars when listening
  useEffect(() => {
    if (isListening) {
      const animate = () => {
        setVisualizerBars(prev => prev.map(() => Math.random() * 25 + 5));
        animationRef.current = requestAnimationFrame(animate);
      };
      // Slow down animation
      const interval = setInterval(() => {
        setVisualizerBars(prev => prev.map(() => Math.random() * 25 + 5));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={toggleListening}
      className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
        isListening 
          ? 'bg-gradient-to-r from-red-500 to-pink-500 scale-110 shadow-lg shadow-red-500/50' 
          : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-purple-500/50'
      }`}
      title={isListening ? 'Stop listening' : 'Voice search'}
    >
      {isListening ? (
        <div className="flex items-end gap-0.5 h-6">
          {visualizerBars.map((height, i) => (
            <div
              key={i}
              className="w-1 bg-white rounded-full transition-all duration-100"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      ) : (
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
      
      {/* Pulse ring when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-xl bg-red-500/30 animate-ping" />
          <span className="absolute -inset-1 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 animate-pulse" />
        </>
      )}
    </button>
  );
}
