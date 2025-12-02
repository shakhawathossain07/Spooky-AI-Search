import { useState, useEffect, useRef, useCallback, memo } from 'react';

interface FocusTimerProps {
  onComplete?: () => void;
}

type TreeState = 'idle' | 'growing' | 'complete' | 'dead';

function FocusTimerComponent({ onComplete }: FocusTimerProps) {
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [treeState, setTreeState] = useState<TreeState>('idle');
  const [growthProgress, setGrowthProgress] = useState(0); // 0-100
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [treesGrown, setTreesGrown] = useState(0);
  const [showDeathAnimation, setShowDeathAnimation] = useState(false);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Load stats from localStorage
  useEffect(() => {
    const stats = localStorage.getItem('focusStats');
    if (stats) {
      const { totalTime, trees } = JSON.parse(stats);
      setTotalFocusTime(totalTime || 0);
      setTreesGrown(trees || 0);
    }
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((addedTime: number, completed: boolean) => {
    const newTotal = totalFocusTime + addedTime;
    const newTrees = completed ? treesGrown + 1 : treesGrown;
    setTotalFocusTime(newTotal);
    setTreesGrown(newTrees);
    localStorage.setItem('focusStats', JSON.stringify({ totalTime: newTotal, trees: newTrees }));
  }, [totalFocusTime, treesGrown]);

  // Handle visibility change (tab switch detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && treeState === 'growing') {
        // User left the tab - kill the tree!
        killTree();
      }
    };

    const handleBlur = () => {
      if (isRunning && treeState === 'growing') {
        // Window lost focus - kill the tree!
        killTree();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isRunning, treeState]);

  const killTree = useCallback(() => {
    setTreeState('dead');
    setShowDeathAnimation(true);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Save partial progress
    const elapsedSeconds = (duration * 60) - timeLeft;
    saveStats(elapsedSeconds, false);
    
    setTimeout(() => setShowDeathAnimation(false), 2000);
  }, [duration, timeLeft, saveStats]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer complete!
            setIsRunning(false);
            setTreeState('complete');
            setGrowthProgress(100);
            saveStats(duration * 60, true);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, duration, saveStats, onComplete]);

  // Update growth progress
  useEffect(() => {
    if (isRunning && treeState === 'growing') {
      const totalSeconds = duration * 60;
      const elapsed = totalSeconds - timeLeft;
      const progress = (elapsed / totalSeconds) * 100;
      setGrowthProgress(progress);
    }
  }, [timeLeft, duration, isRunning, treeState]);

  // Canvas animation for tree
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 350;

    const drawTree = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const groundY = canvas.height - 30;

      // Draw ground
      ctx.fillStyle = '#3d2914';
      ctx.beginPath();
      ctx.ellipse(centerX, groundY + 10, 80, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw grass
      ctx.fillStyle = '#2d5a27';
      for (let i = 0; i < 20; i++) {
        const x = centerX - 60 + Math.random() * 120;
        const height = 5 + Math.random() * 10;
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x - 2, groundY - height);
        ctx.lineTo(x + 2, groundY - height);
        ctx.closePath();
        ctx.fill();
      }

      if (treeState === 'idle') {
        // Draw seed
        drawSeed(ctx, centerX, groundY - 5);
      } else if (treeState === 'dead') {
        // Draw dead tree
        drawDeadTree(ctx, centerX, groundY, growthProgress);
      } else {
        // Draw growing/complete tree
        drawGrowingTree(ctx, centerX, groundY, growthProgress, treeState === 'complete');
      }

      animationRef.current = requestAnimationFrame(drawTree);
    };

    drawTree();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [treeState, growthProgress]);

  const drawSeed = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Seed body
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(1, '#5D3A1A');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Seed highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x - 3, y - 2, 4, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawGrowingTree = (ctx: CanvasRenderingContext2D, x: number, groundY: number, progress: number, isComplete: boolean) => {
    const maxTrunkHeight = 120;
    const maxTrunkWidth = 25;
    const trunkHeight = (progress / 100) * maxTrunkHeight;
    const trunkWidth = 8 + (progress / 100) * (maxTrunkWidth - 8);

    // Trunk
    const trunkGradient = ctx.createLinearGradient(x - trunkWidth/2, groundY, x + trunkWidth/2, groundY);
    trunkGradient.addColorStop(0, '#4a3728');
    trunkGradient.addColorStop(0.5, '#6b4423');
    trunkGradient.addColorStop(1, '#4a3728');
    ctx.fillStyle = trunkGradient;
    
    ctx.beginPath();
    ctx.moveTo(x - trunkWidth/2, groundY);
    ctx.lineTo(x - trunkWidth/3, groundY - trunkHeight);
    ctx.lineTo(x + trunkWidth/3, groundY - trunkHeight);
    ctx.lineTo(x + trunkWidth/2, groundY);
    ctx.closePath();
    ctx.fill();

    // Branches and leaves (appear after 30% growth)
    if (progress > 30) {
      const leafProgress = (progress - 30) / 70; // 0-1 for leaf growth
      drawLeaves(ctx, x, groundY - trunkHeight, leafProgress, isComplete);
    }

    // Roots (subtle)
    if (progress > 10) {
      ctx.strokeStyle = '#4a3728';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 5, groundY);
      ctx.quadraticCurveTo(x - 20, groundY + 5, x - 30, groundY + 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 5, groundY);
      ctx.quadraticCurveTo(x + 20, groundY + 5, x + 30, groundY + 2);
      ctx.stroke();
    }
  };

  const drawLeaves = (ctx: CanvasRenderingContext2D, x: number, topY: number, progress: number, isComplete: boolean) => {
    const layers = 4;
    const maxRadius = 60;
    
    for (let i = 0; i < layers; i++) {
      const layerProgress = Math.min(1, progress * 1.5 - i * 0.2);
      if (layerProgress <= 0) continue;

      const radius = maxRadius * layerProgress * (1 - i * 0.15);
      const yOffset = i * 20 * layerProgress;
      
      // Leaf cluster gradient
      const gradient = ctx.createRadialGradient(
        x, topY - yOffset, 0,
        x, topY - yOffset, radius
      );
      
      if (isComplete) {
        // Full bloom - vibrant colors
        gradient.addColorStop(0, '#4ade80');
        gradient.addColorStop(0.5, '#22c55e');
        gradient.addColorStop(1, '#15803d');
      } else {
        // Growing - lighter green
        gradient.addColorStop(0, '#86efac');
        gradient.addColorStop(0.5, '#4ade80');
        gradient.addColorStop(1, '#22c55e');
      }
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, topY - yOffset - radius/2, radius, radius * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add flowers/fruits when complete
    if (isComplete) {
      const flowerPositions = [
        { dx: -30, dy: -40 }, { dx: 25, dy: -50 }, { dx: -15, dy: -70 },
        { dx: 35, dy: -30 }, { dx: -40, dy: -60 }, { dx: 10, dy: -80 }
      ];
      
      flowerPositions.forEach(pos => {
        // Pink flower
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(x + pos.dx, topY + pos.dy, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Yellow center
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(x + pos.dx, topY + pos.dy, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };

  const drawDeadTree = (ctx: CanvasRenderingContext2D, x: number, groundY: number, progress: number) => {
    const trunkHeight = (progress / 100) * 120;
    const trunkWidth = 8 + (progress / 100) * 17;

    // Dead trunk (gray/brown)
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.moveTo(x - trunkWidth/2, groundY);
    ctx.lineTo(x - trunkWidth/3, groundY - trunkHeight);
    ctx.lineTo(x + trunkWidth/3, groundY - trunkHeight);
    ctx.lineTo(x + trunkWidth/2, groundY);
    ctx.closePath();
    ctx.fill();

    // Dead branches
    if (progress > 30) {
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 3;
      
      // Left branch
      ctx.beginPath();
      ctx.moveTo(x - 5, groundY - trunkHeight * 0.7);
      ctx.lineTo(x - 40, groundY - trunkHeight * 0.5);
      ctx.stroke();
      
      // Right branch
      ctx.beginPath();
      ctx.moveTo(x + 5, groundY - trunkHeight * 0.8);
      ctx.lineTo(x + 35, groundY - trunkHeight * 0.6);
      ctx.stroke();
    }

    // Falling leaves animation
    if (showDeathAnimation) {
      for (let i = 0; i < 8; i++) {
        const leafX = x + (Math.random() - 0.5) * 100;
        const leafY = groundY - trunkHeight + Math.random() * trunkHeight;
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(leafX, leafY, 4, 2, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Skull emoji for dramatic effect
    ctx.font = '30px serif';
    ctx.fillText('💀', x - 15, groundY - trunkHeight - 20);
  };

  const startTimer = () => {
    setTimeLeft(duration * 60);
    setIsRunning(true);
    setTreeState('growing');
    setGrowthProgress(0);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setTreeState('idle');
    setGrowthProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-green-900/30 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <span>🌱</span> Focus Timer <span>🌳</span>
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Stay focused to grow your tree. Leave the tab and it dies!
        </p>
      </div>

      {/* Tree Canvas */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="rounded-xl bg-gradient-to-b from-sky-900/30 to-green-900/20"
            style={{ width: 300, height: 350 }}
          />
          
          {/* Status overlay */}
          {treeState === 'complete' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-green-500/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-green-400/50 animate-bounce">
                <span className="text-2xl">🎉</span>
                <span className="text-green-300 font-bold ml-2">Tree Complete!</span>
              </div>
            </div>
          )}
          
          {treeState === 'dead' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-red-500/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-red-400/50 animate-pulse">
                <span className="text-2xl">😢</span>
                <span className="text-red-300 font-bold ml-2">Tree Died!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timer Display */}
      {isRunning && (
        <div className="text-center mb-6">
          <div className="text-5xl font-mono font-bold text-white mb-2">
            {formatTime(timeLeft)}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000"
              style={{ width: `${growthProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Growth: {Math.round(growthProgress)}%
          </p>
        </div>
      )}

      {/* Duration Selector (when idle) */}
      {treeState === 'idle' && (
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2 text-center">
            Focus Duration
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setDuration(Math.max(5, duration - 5))}
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
            >
              -
            </button>
            <div className="text-3xl font-bold text-white w-24 text-center">
              {duration}<span className="text-lg text-gray-400 ml-1">min</span>
            </div>
            <button
              onClick={() => setDuration(Math.min(120, duration + 5))}
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
            >
              +
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-3">
            {[15, 25, 45, 60].map(mins => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  duration === mins
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        {treeState === 'idle' && (
          <button
            onClick={startTimer}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-white hover:scale-105 transition-transform shadow-lg shadow-green-500/30"
          >
            🌱 Plant & Focus
          </button>
        )}
        
        {isRunning && (
          <button
            onClick={resetTimer}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium text-gray-300 transition-colors"
          >
            Give Up
          </button>
        )}
        
        {(treeState === 'complete' || treeState === 'dead') && (
          <button
            onClick={resetTimer}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-white hover:scale-105 transition-transform shadow-lg shadow-green-500/30"
          >
            🌱 Plant New Tree
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-gray-800/50 rounded-xl">
            <p className="text-2xl font-bold text-green-400">{treesGrown}</p>
            <p className="text-xs text-gray-400">Trees Grown</p>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-xl">
            <p className="text-2xl font-bold text-emerald-400">{formatTotalTime(totalFocusTime)}</p>
            <p className="text-xs text-gray-400">Total Focus Time</p>
          </div>
        </div>
      </div>

      {/* Warning */}
      {isRunning && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-300 text-center flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>Don't leave this tab or your tree will die!</span>
          </p>
        </div>
      )}
    </div>
  );
}

const FocusTimer = memo(FocusTimerComponent);
export default FocusTimer;
