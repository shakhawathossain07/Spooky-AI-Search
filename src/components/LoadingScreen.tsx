import { useEffect, useRef } from 'react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    let rotation = 0;
    let pulsePhase = 0;

    const animate = () => {
      if (!ctx) return;

      rotation += 0.02;
      pulsePhase += 0.05;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw rotating rings
      for (let i = 0; i < 3; i++) {
        const radius = 60 + i * 30;
        const pulse = Math.sin(pulsePhase + i * 0.5) * 0.3 + 0.7;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation * (i % 2 === 0 ? 1 : -1));

        const segments = 6;
        for (let j = 0; j < segments; j++) {
          const angle = (j / segments) * Math.PI * 2;
          const nextAngle = ((j + 1) / segments) * Math.PI * 2;
          
          const gradient = ctx.createLinearGradient(
            Math.cos(angle) * radius, Math.sin(angle) * radius,
            Math.cos(nextAngle) * radius, Math.sin(nextAngle) * radius
          );
          gradient.addColorStop(0, `hsla(${200 + i * 20}, 70%, 60%, ${0.8 * pulse})`);
          gradient.addColorStop(1, `hsla(${220 + i * 20}, 70%, 60%, ${0.2 * pulse})`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(0, 0, radius, angle, nextAngle - 0.2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw center core
      const corePulse = Math.sin(pulsePhase * 2) * 0.4 + 0.6;
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0, centerX, centerY, 30 * corePulse
      );
      coreGradient.addColorStop(0, 'hsla(200, 80%, 70%, 0.9)');
      coreGradient.addColorStop(0.5, 'hsla(210, 70%, 60%, 0.5)');
      coreGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30 * corePulse, 0, Math.PI * 2);
      ctx.fill();

      // Draw orbiting particles
      for (let i = 0; i < 8; i++) {
        const orbitRadius = 100;
        const angle = (i / 8) * Math.PI * 2 + rotation * 2;
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius;

        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
        particleGradient.addColorStop(0, 'hsla(190, 80%, 70%, 0.9)');
        particleGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <div className="text-center">
        <canvas
          ref={canvasRef}
          className="mx-auto mb-8"
          style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))' }}
        />
        <div className="space-y-4">
          <p className="text-2xl font-semibold text-white animate-pulse">{message}</p>
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
