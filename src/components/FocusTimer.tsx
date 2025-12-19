import { useState, useEffect, useRef, useCallback, memo } from 'react';

interface FocusTimerProps { onComplete?: () => void; }
type TreeState = 'idle' | 'growing' | 'complete' | 'dead';
interface Leaf { x: number; y: number; size: number; angle: number; hue: number; swayPhase: number; }
interface FallingLeaf { x: number; y: number; vx: number; vy: number; rotation: number; rotationSpeed: number; size: number; }

function FocusTimerComponent({ onComplete }: FocusTimerProps) {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [treeState, setTreeState] = useState<TreeState>('idle');
  const [growthProgress, setGrowthProgress] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [treesGrown, setTreesGrown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const leavesRef = useRef<Leaf[]>([]);
  const fallingLeavesRef = useRef<FallingLeaf[]>([]);

  useEffect(() => {
    const stats = localStorage.getItem('focusStats');
    if (stats) { const { totalTime, trees } = JSON.parse(stats); setTotalFocusTime(totalTime || 0); setTreesGrown(trees || 0); }
  }, []);

  const saveStats = useCallback((addedTime: number, completed: boolean) => {
    const newTotal = totalFocusTime + addedTime;
    const newTrees = completed ? treesGrown + 1 : treesGrown;
    setTotalFocusTime(newTotal); setTreesGrown(newTrees);
    localStorage.setItem('focusStats', JSON.stringify({ totalTime: newTotal, trees: newTrees }));
  }, [totalFocusTime, treesGrown]);

  const killTree = useCallback(() => {
    setTreeState('dead'); setIsRunning(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    fallingLeavesRef.current = leavesRef.current.map(l => ({ x: l.x, y: l.y, vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2 + 1, rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.2, size: l.size }));
    saveStats((duration * 60) - timeLeft, false);
  }, [duration, timeLeft, saveStats]);

  useEffect(() => {
    const hv = () => { if (document.hidden && isRunning && treeState === 'growing') killTree(); };
    const hb = () => { if (isRunning && treeState === 'growing') killTree(); };
    document.addEventListener('visibilitychange', hv); window.addEventListener('blur', hb);
    return () => { document.removeEventListener('visibilitychange', hv); window.removeEventListener('blur', hb); };
  }, [isRunning, treeState, killTree]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(p => { if (p <= 1) { setIsRunning(false); setTreeState('complete'); setGrowthProgress(100); saveStats(duration * 60, true); onComplete?.(); return 0; } return p - 1; });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, duration, saveStats, onComplete]);

  useEffect(() => {
    if (isRunning && treeState === 'growing') {
      const total = duration * 60;
      setGrowthProgress(((total - timeLeft) / total) * 100);
    }
  }, [timeLeft, duration, isRunning, treeState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 350; canvas.height = 400;
    const cx = canvas.width / 2, gy = canvas.height - 40;

    const animate = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (treeState === 'dead') { sky.addColorStop(0, '#1a1a2e'); sky.addColorStop(1, '#16213e'); }
      else { sky.addColorStop(0, '#0f172a'); sky.addColorStop(0.6, '#1e293b'); sky.addColorStop(1, '#0f4c3a'); }
      ctx.fillStyle = sky; ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(255,255,255,${(Math.sin(t * 2 + i) * 0.3 + 0.7) * 0.5})`;
        ctx.beginPath(); ctx.arc((i * 73) % canvas.width, (i * 47) % (canvas.height * 0.5), 1 + (i % 2), 0, Math.PI * 2); ctx.fill();
      }

      // Ground
      const grd = ctx.createLinearGradient(0, gy, 0, canvas.height);
      grd.addColorStop(0, treeState === 'dead' ? '#3d2914' : '#2d5a27');
      grd.addColorStop(1, treeState === 'dead' ? '#1a1a1a' : '#1a3d16');
      ctx.fillStyle = grd; ctx.fillRect(0, gy, canvas.width, 60);
      ctx.fillStyle = treeState === 'dead' ? '#4a3d2a' : '#3d7a35';
      for (let i = 0; i < 50; i++) {
        const gx = (i / 50) * canvas.width, gh = 5 + Math.sin(i * 0.5) * 3, sw = Math.sin(t * 2 + i * 0.3) * 2;
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.quadraticCurveTo(gx + sw, gy - gh / 2, gx, gy - gh); ctx.quadraticCurveTo(gx + sw, gy - gh / 2, gx + 2, gy); ctx.fill();
      }

      if (treeState === 'idle') {
        // Seed with glow
        const p = Math.sin(t * 3) * 0.3 + 0.7;
        const aura = ctx.createRadialGradient(cx, gy - 5, 0, cx, gy - 5, 25 * p);
        aura.addColorStop(0, 'rgba(139,69,19,0.4)'); aura.addColorStop(0.5, 'rgba(34,197,94,0.2)'); aura.addColorStop(1, 'transparent');
        ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(cx, gy - 5, 25 * p, 0, Math.PI * 2); ctx.fill();
        const sg = ctx.createRadialGradient(cx - 2, gy - 7, 0, cx, gy - 5, 10);
        sg.addColorStop(0, '#a0522d'); sg.addColorStop(1, '#5D3A1A');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(cx, gy - 5, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
        const sh = Math.sin(t * 2) * 2 + 3;
        ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(cx, gy - 12); ctx.quadraticCurveTo(cx + 2, gy - 12 - sh, cx, gy - 12 - sh * 1.5); ctx.stroke();
      } else if (treeState === 'dead') {
        // Dead tree
        const th = growthProgress * 1.3, tw = 10 + (growthProgress / 100) * 15;
        ctx.fillStyle = '#3a3a3a'; ctx.beginPath();
        ctx.moveTo(cx - tw / 2, gy); ctx.lineTo(cx - tw / 3, gy - th); ctx.lineTo(cx + tw / 3, gy - th); ctx.lineTo(cx + tw / 2, gy); ctx.fill();
        ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        [[-0.7, 0.4, 30], [0.6, 0.55, 35], [-0.5, 0.7, 25], [0.4, 0.85, 20]].forEach(([a, hp, l]) => {
          ctx.beginPath(); ctx.moveTo(cx, gy - th * (hp as number));
          ctx.lineTo(cx + Math.cos((a as number) - Math.PI / 2) * (l as number), gy - th * (hp as number) + Math.sin((a as number) - Math.PI / 2) * (l as number)); ctx.stroke();
        });
        // Falling leaves
        fallingLeavesRef.current = fallingLeavesRef.current.filter(lf => {
          lf.x += lf.vx + Math.sin(t * 3 + lf.rotation) * 0.5; lf.y += lf.vy; lf.vy += 0.08; lf.rotation += lf.rotationSpeed;
          if (lf.y > gy + 10) return false;
          ctx.save(); ctx.translate(lf.x, lf.y); ctx.rotate(lf.rotation);
          ctx.fillStyle = '#8B6914'; ctx.beginPath(); ctx.ellipse(0, 0, lf.size, lf.size * 0.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          return true;
        });
        // Sad face
        ctx.fillStyle = '#1a1a1a'; const fy = gy - th * 0.55;
        ctx.beginPath(); ctx.arc(cx - 7, fy - 4, 3, 0, Math.PI * 2); ctx.arc(cx + 7, fy - 4, 3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, fy + 10, 7, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
      } else {
        // Growing/complete tree
        const prog = growthProgress;
        const th = Math.min(prog * 1.4, 130), tw = 10 + (prog / 100) * 18;
        // Trunk
        const tg = ctx.createLinearGradient(cx - tw / 2, gy, cx + tw / 2, gy);
        tg.addColorStop(0, '#4a3728'); tg.addColorStop(0.5, '#6b4423'); tg.addColorStop(1, '#4a3728');
        ctx.fillStyle = tg; ctx.beginPath();
        ctx.moveTo(cx - tw / 2, gy);
        ctx.bezierCurveTo(cx - tw / 2.5, gy - th / 2, cx - tw / 3, gy - th, cx, gy - th);
        ctx.bezierCurveTo(cx + tw / 3, gy - th, cx + tw / 2.5, gy - th / 2, cx + tw / 2, gy); ctx.fill();
        // Bark
        ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1;
        for (let i = 10; i < th; i += 12) { ctx.beginPath(); ctx.moveTo(cx - tw / 3, gy - i); ctx.quadraticCurveTo(cx, gy - i - 3, cx + tw / 3, gy - i); ctx.stroke(); }
        // Roots
        ctx.strokeStyle = '#4a3728'; ctx.lineWidth = 4;
        [[-1, -25], [1, 30], [-1, -15]].forEach(([d, l]) => { ctx.beginPath(); ctx.moveTo(cx + (d as number) * 5, gy); ctx.quadraticCurveTo(cx + (d as number) * (Math.abs(l as number) / 2), gy + 8, cx + (d as number) * Math.abs(l as number), gy + 3); ctx.stroke(); });

        if (prog >= 25) {
          // Branches and leaves
          const leaves: Leaf[] = [];
          const drawBranch = (x: number, y: number, a: number, len: number, w: number, d: number) => {
            if (d > 4 || len < 10) return;
            const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
            ctx.strokeStyle = d === 0 ? '#5D4037' : '#6D4C41'; ctx.lineWidth = w; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a + 0.2) * len * 0.5, y + Math.sin(a + 0.2) * len * 0.5, ex, ey); ctx.stroke();
            if (d >= 1 && prog > 40) {
              for (let i = 0; i < 3 + d; i++) {
                const la = a + (Math.random() - 0.5) * 1.5, dist = Math.random() * 12;
                leaves.push({ x: ex + Math.cos(la) * dist, y: ey + Math.sin(la) * dist, size: 5 + Math.random() * 6, angle: la, hue: 85 + Math.random() * 45, swayPhase: Math.random() * Math.PI * 2 });
              }
            }
            if (d < 3) { drawBranch(ex, ey, a - 0.4 - Math.random() * 0.3, len * 0.7, w * 0.6, d + 1); drawBranch(ex, ey, a + 0.4 + Math.random() * 0.3, len * 0.7, w * 0.6, d + 1); }
          };
          const bp = Math.min(1, (prog - 25) / 50);
          [[0.35, -0.9, 45], [0.5, -0.6, 50], [0.5, 0.6, 50], [0.7, -0.7, 55], [0.7, 0.8, 55], [0.9, -0.5, 40], [0.9, 0.4, 40]].forEach(([hp, ao, bl]) => {
            drawBranch(cx, gy - th * (hp as number), -Math.PI / 2 + (ao as number), (bl as number) * bp, 6, 0);
          });
          leavesRef.current = leaves;
          // Draw leaves
          leaves.forEach(lf => {
            const sw = Math.sin(t * 2 + lf.swayPhase) * 4;
            ctx.save(); ctx.translate(lf.x + sw, lf.y); ctx.rotate(lf.angle + Math.sin(t + lf.swayPhase) * 0.1);
            const lg = ctx.createRadialGradient(0, 0, 0, 0, 0, lf.size);
            const h = treeState === 'complete' ? lf.hue + 15 : lf.hue;
            lg.addColorStop(0, `hsl(${h},75%,55%)`); lg.addColorStop(1, `hsl(${h - 15},70%,35%)`);
            ctx.fillStyle = lg; ctx.beginPath(); ctx.ellipse(0, 0, lf.size * 0.4, lf.size, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          });
          // Flowers when complete
          if (treeState === 'complete') {
            leaves.filter((_, i) => i % 5 === 0).forEach((lf, i) => {
              const fx = lf.x + Math.sin(t + i) * 2, fy = lf.y - 8;
              for (let p = 0; p < 5; p++) { const pa = (p / 5) * Math.PI * 2 + t * 0.3; ctx.fillStyle = p % 2 === 0 ? '#fce7f3' : '#f9a8d4'; ctx.beginPath(); ctx.ellipse(fx + Math.cos(pa) * 5, fy + Math.sin(pa) * 5, 4, 2.5, pa, 0, Math.PI * 2); ctx.fill(); }
              ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI * 2); ctx.fill();
            });
            // Sparkles
            for (let i = 0; i < 12; i++) { const sa = (i / 12) * Math.PI * 2 + t, sd = 50 + Math.sin(t * 3 + i) * 25; ctx.fillStyle = `rgba(255,255,200,${0.4 + Math.sin(t * 4 + i) * 0.3})`; ctx.beginPath(); ctx.arc(cx + Math.cos(sa) * sd, gy - th / 2 + Math.sin(sa) * sd * 0.5, 2, 0, Math.PI * 2); ctx.fill(); }
          }
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [treeState, growthProgress]);

  const startTimer = () => { setTimeLeft(duration * 60); setIsRunning(true); setTreeState('growing'); setGrowthProgress(0); leavesRef.current = []; fallingLeavesRef.current = []; };
  const resetTimer = () => { setIsRunning(false); setTimeLeft(0); setTreeState('idle'); setGrowthProgress(0); leavesRef.current = []; fallingLeavesRef.current = []; if (intervalRef.current) clearInterval(intervalRef.current); };
  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const fmtTotal = (s: number) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-green-900/30 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6 shadow-2xl">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <span>🌱</span> Focus Timer <span>🌳</span>
        </h3>
        <p className="text-sm text-gray-400 mt-1">Stay focused to grow your tree. Leave the tab and it dies!</p>
      </div>
      <div className="flex justify-center mb-4">
        <canvas ref={canvasRef} className="rounded-xl shadow-2xl" style={{ width: 350, height: 400 }} />
      </div>
      {treeState === 'complete' && <div className="text-center mb-4 p-3 bg-green-500/20 rounded-xl border border-green-400/50 animate-pulse"><span className="text-2xl">🎉</span><span className="text-green-300 font-bold ml-2">Beautiful Tree Grown!</span></div>}
      {treeState === 'dead' && <div className="text-center mb-4 p-3 bg-red-500/20 rounded-xl border border-red-400/50"><span className="text-2xl">😢</span><span className="text-red-300 font-bold ml-2">Your Tree Withered!</span></div>}
      {isRunning && (
        <div className="text-center mb-4">
          <div className="text-5xl font-mono font-bold text-white mb-2">{fmtTime(timeLeft)}</div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 transition-all duration-1000" style={{ width: `${growthProgress}%` }} />
          </div>
          <p className="text-sm text-gray-400 mt-2">Growth: {Math.round(growthProgress)}%</p>
        </div>
      )}
      {treeState === 'idle' && (
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2 text-center">Focus Duration</label>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setDuration(Math.max(5, duration - 5))} className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors">-</button>
            <div className="text-3xl font-bold text-white w-24 text-center">{duration}<span className="text-lg text-gray-400 ml-1">min</span></div>
            <button onClick={() => setDuration(Math.min(120, duration + 5))} className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors">+</button>
          </div>
          <div className="flex justify-center gap-2 mt-3">
            {[15, 25, 45, 60].map(m => <button key={m} onClick={() => setDuration(m)} className={`px-3 py-1 rounded-full text-sm transition-colors ${duration === m ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{m}m</button>)}
          </div>
        </div>
      )}
      <div className="flex justify-center gap-4">
        {treeState === 'idle' && <button onClick={startTimer} className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-white hover:scale-105 transition-transform shadow-lg shadow-green-500/30">🌱 Plant & Focus</button>}
        {isRunning && <button onClick={resetTimer} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium text-gray-300 transition-colors">Give Up</button>}
        {(treeState === 'complete' || treeState === 'dead') && <button onClick={resetTimer} className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-white hover:scale-105 transition-transform shadow-lg shadow-green-500/30">🌱 Plant New Tree</button>}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700/50 grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-gray-800/50 rounded-xl"><p className="text-2xl font-bold text-green-400">{treesGrown}</p><p className="text-xs text-gray-400">Trees Grown</p></div>
        <div className="p-3 bg-gray-800/50 rounded-xl"><p className="text-2xl font-bold text-emerald-400">{fmtTotal(totalFocusTime)}</p><p className="text-xs text-gray-400">Total Focus</p></div>
      </div>
      {isRunning && <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"><p className="text-xs text-yellow-300 text-center">⚠️ Stay on this tab to keep your tree alive!</p></div>}
    </div>
  );
}

const FocusTimer = memo(FocusTimerComponent);
export default FocusTimer;
