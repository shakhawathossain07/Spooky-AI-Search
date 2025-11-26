import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  twinklePhase: number;
  twinkleSpeed: number;
  brightness: number;
}

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  brightness: number;
  pulsePhase: number;
  pulseSpeed: number;
  size: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  active: boolean;
}

interface Owl {
  x: number;
  y: number;
  vx: number;
  vy: number;
  wingPhase: number;
  size: number;
  depth: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

export default function NightSkyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const owlsRef = useRef<Owl[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      init();
    };

    const init = () => {
      // Stars - multiple layers
      starsRef.current = Array.from({ length: 300 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        brightness: Math.random() * 0.5 + 0.5,
      }));

      // Fireflies
      firefliesRef.current = Array.from({ length: 45 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        brightness: Math.random(),
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.05 + 0.02,
        size: Math.random() * 2 + 2,
      }));

      // Shooting stars pool
      shootingStarsRef.current = Array.from({ length: 3 }, () => ({
        x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, active: false,
      }));

      // Owls
      owlsRef.current = Array.from({ length: 4 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.5,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 0.4,
        wingPhase: Math.random() * Math.PI * 2,
        size: Math.random() * 12 + 20,
        depth: Math.random() * 0.4 + 0.6,
      }));

      // Floating particles
      particlesRef.current = Array.from({ length: 60 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.2,
        hue: Math.random() * 60 + 240,
      }));
    };

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouse);

    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;

      // Background gradient with subtle animation
      const hueShift = Math.sin(time * 0.05) * 5;
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, `hsl(${240 + hueShift}, 25%, 6%)`);
      grad.addColorStop(0.4, `hsl(${250 + hueShift}, 30%, 10%)`);
      grad.addColorStop(0.7, `hsl(${260 + hueShift}, 35%, 12%)`);
      grad.addColorStop(1, `hsl(${270 + hueShift}, 30%, 14%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Aurora effect at top
      drawAurora(ctx, width, height, time);

      // Nebula clouds
      drawNebulae(ctx, width, height, time);

      // Stars with parallax
      drawStars(ctx, starsRef.current, time, mouseRef.current, width, height);

      // Shooting stars
      updateShootingStars(ctx, shootingStarsRef.current, width, height);

      // Moon
      drawMoon(ctx, width, height, time);

      // Floating particles
      drawParticles(ctx, particlesRef.current, width, height, time);

      // Fireflies
      drawFireflies(ctx, firefliesRef.current, width, height, time);

      // Owls
      drawOwls(ctx, owlsRef.current, width, height, time);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ display: 'block', zIndex: 0, pointerEvents: 'none' }}
    />
  );
}

function drawAurora(ctx: CanvasRenderingContext2D, width: number, _height: number, time: number) {
  const colors = [
    { color: 'rgba(0, 255, 150, 0.08)', speed: 0.3, amp: 25 },
    { color: 'rgba(100, 200, 255, 0.06)', speed: 0.25, amp: 30 },
    { color: 'rgba(180, 100, 255, 0.05)', speed: 0.35, amp: 20 },
  ];

  colors.forEach((aurora, i) => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    
    for (let x = 0; x <= width; x += 10) {
      const y = 80 + Math.sin((x * 0.005) + time * aurora.speed + i) * aurora.amp +
                Math.sin((x * 0.008) + time * aurora.speed * 1.3) * (aurora.amp * 0.5);
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(width, 0);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, aurora.color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fill();
  });
}

function drawNebulae(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const nebulae = [
    { x: width * 0.2, y: height * 0.35, r: 180, h: 280 },
    { x: width * 0.75, y: height * 0.25, r: 150, h: 200 },
    { x: width * 0.5, y: height * 0.7, r: 200, h: 320 },
  ];

  nebulae.forEach((n, i) => {
    const pulse = Math.sin(time * 0.3 + i) * 0.15 + 1;
    const radius = n.r * pulse;
    
    const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius);
    gradient.addColorStop(0, `hsla(${n.h}, 70%, 50%, 0.06)`);
    gradient.addColorStop(0.5, `hsla(${n.h}, 60%, 40%, 0.03)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  _time: number,
  mouse: { x: number; y: number },
  width: number,
  height: number
) {
  const cx = width / 2;
  const cy = height / 2;

  stars.forEach(star => {
    star.twinklePhase += star.twinkleSpeed;
    const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
    const alpha = star.brightness * twinkle;

    // Subtle parallax
    const parallax = star.size * 0.01;
    const px = star.x + (mouse.x - cx) * parallax;
    const py = star.y + (mouse.y - cy) * parallax;

    // Star glow
    if (star.size > 1.5) {
      const glow = ctx.createRadialGradient(px, py, 0, px, py, star.size * 4);
      glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.3})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, star.size * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Star core
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, star.size, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle for bright stars
    if (star.size > 2 && twinkle > 0.85) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
      ctx.lineWidth = 0.5;
      const len = star.size * 2;
      ctx.beginPath();
      ctx.moveTo(px - len, py);
      ctx.lineTo(px + len, py);
      ctx.moveTo(px, py - len);
      ctx.lineTo(px, py + len);
      ctx.stroke();
    }
  });
}

function updateShootingStars(ctx: CanvasRenderingContext2D, stars: ShootingStar[], width: number, height: number) {
  // Spawn new shooting star randomly
  if (Math.random() < 0.005) {
    const inactive = stars.find(s => !s.active);
    if (inactive) {
      inactive.x = Math.random() * width * 0.8;
      inactive.y = Math.random() * height * 0.3;
      inactive.vx = Math.random() * 10 + 8;
      inactive.vy = Math.random() * 5 + 3;
      inactive.life = 0;
      inactive.maxLife = Math.random() * 30 + 20;
      inactive.active = true;
    }
  }

  stars.forEach(star => {
    if (!star.active) return;

    star.x += star.vx;
    star.y += star.vy;
    star.life++;

    if (star.life >= star.maxLife) {
      star.active = false;
      return;
    }

    const progress = star.life / star.maxLife;
    const alpha = Math.sin(progress * Math.PI);

    // Trail
    const trailLen = 60;
    const gradient = ctx.createLinearGradient(
      star.x, star.y,
      star.x - star.vx * (trailLen / star.vx),
      star.y - star.vy * (trailLen / star.vx)
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    gradient.addColorStop(0.3, `rgba(200, 220, 255, ${alpha * 0.5})`);
    gradient.addColorStop(1, 'transparent');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(star.x - star.vx * (trailLen / star.vx), star.y - star.vy * (trailLen / star.vx));
    ctx.stroke();

    // Head glow
    const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 6);
    glow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(star.x, star.y, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawMoon(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const x = width * 0.85;
  const y = height * 0.12;
  const r = 50;

  // Outer glow
  const outerGlow = ctx.createRadialGradient(x, y, r, x, y, r * 3.5);
  outerGlow.addColorStop(0, 'rgba(255, 255, 220, 0.12)');
  outerGlow.addColorStop(0.4, 'rgba(200, 200, 255, 0.05)');
  outerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Inner glow with pulse
  const pulse = Math.sin(time * 0.5) * 0.1 + 0.9;
  const innerGlow = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 1.8);
  innerGlow.addColorStop(0, `rgba(255, 255, 230, ${0.3 * pulse})`);
  innerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = innerGlow;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Moon body
  const moonGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
  moonGrad.addColorStop(0, '#fffff5');
  moonGrad.addColorStop(0.7, '#f0f0e0');
  moonGrad.addColorStop(1, '#e0e0d0');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Craters
  const craters = [
    { dx: -12, dy: -10, cr: 8 },
    { dx: 10, dy: 6, cr: 12 },
    { dx: -5, dy: 15, cr: 6 },
    { dx: 18, dy: -8, cr: 5 },
  ];
  craters.forEach(c => {
    ctx.fillStyle = 'rgba(180, 180, 160, 0.35)';
    ctx.beginPath();
    ctx.arc(x + c.dx, y + c.dy, c.cr, 0, Math.PI * 2);
    ctx.fill();
  });
}


function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  width: number,
  height: number,
  time: number
) {
  particles.forEach(p => {
    p.x += p.vx + Math.sin(time * 2 + p.hue) * 0.2;
    p.y += p.vy;

    if (p.y < -10) {
      p.y = height + 10;
      p.x = Math.random() * width;
    }

    const pulse = Math.sin(time * 3 + p.hue * 0.1) * 0.3 + 0.7;
    const alpha = p.opacity * pulse;

    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
    glow.addColorStop(0, `hsla(${p.hue}, 70%, 70%, ${alpha})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `hsla(${p.hue}, 80%, 80%, ${alpha * 1.5})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawFireflies(
  ctx: CanvasRenderingContext2D,
  fireflies: Firefly[],
  width: number,
  height: number,
  time: number
) {
  fireflies.forEach(f => {
    f.x += f.vx + Math.sin(time * 2 + f.pulsePhase) * 0.3;
    f.y += f.vy + Math.cos(time * 1.5 + f.pulsePhase) * 0.25;

    if (f.x < -20) f.x = width + 20;
    if (f.x > width + 20) f.x = -20;
    if (f.y < -20) f.y = height + 20;
    if (f.y > height + 20) f.y = -20;

    f.pulsePhase += f.pulseSpeed;
    const pulse = Math.pow(Math.sin(f.pulsePhase) * 0.5 + 0.5, 1.5);
    const brightness = f.brightness * pulse;

    if (brightness < 0.15) return;

    const glowSize = f.size * (3 + pulse * 2);
    const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowSize);
    glow.addColorStop(0, `rgba(255, 255, 100, ${brightness * 0.8})`);
    glow.addColorStop(0.4, `rgba(255, 220, 50, ${brightness * 0.3})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(f.x, f.y, glowSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 200, ${brightness})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawOwls(
  ctx: CanvasRenderingContext2D,
  owls: Owl[],
  width: number,
  height: number,
  time: number
) {
  owls.forEach(owl => {
    owl.x += owl.vx * owl.depth;
    owl.y += owl.vy * owl.depth + Math.sin(time * 2 + owl.wingPhase) * 0.2;
    owl.wingPhase += 0.12;

    if (owl.x < -owl.size * 3) {
      owl.x = width + owl.size * 3;
      owl.y = Math.random() * height * 0.5;
    }
    if (owl.x > width + owl.size * 3) {
      owl.x = -owl.size * 3;
      owl.y = Math.random() * height * 0.5;
    }

    const { x, y, size, wingPhase, depth } = owl;
    const alpha = 0.5 + depth * 0.5;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(depth, depth);
    ctx.globalAlpha = alpha;

    const wingAngle = Math.sin(wingPhase) * 0.35;

    // Wings
    ctx.fillStyle = '#3a3a4a';
    ctx.save();
    ctx.rotate(wingAngle);
    ctx.beginPath();
    ctx.ellipse(-size * 0.6, 0, size * 0.85, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(-wingAngle);
    ctx.beginPath();
    ctx.ellipse(size * 0.6, 0, size * 0.85, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Body
    ctx.fillStyle = '#4a4a5a';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.35, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#5a5a6a';
    ctx.beginPath();
    ctx.arc(0, -size * 0.4, size * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Ear tufts
    ctx.fillStyle = '#4a4a5a';
    ctx.beginPath();
    ctx.moveTo(-size * 0.18, -size * 0.62);
    ctx.lineTo(-size * 0.12, -size * 0.48);
    ctx.lineTo(-size * 0.24, -size * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size * 0.18, -size * 0.62);
    ctx.lineTo(size * 0.12, -size * 0.48);
    ctx.lineTo(size * 0.24, -size * 0.48);
    ctx.closePath();
    ctx.fill();

    // Eyes with glow
    const eyeGlow = Math.sin(time * 2.5 + wingPhase) * 0.2 + 0.8;
    [-1, 1].forEach(side => {
      const ex = side * size * 0.11;
      const ey = -size * 0.4;

      const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, size * 0.12);
      glow.addColorStop(0, `rgba(255, 200, 0, ${eyeGlow * 0.5})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ex, ey, size * 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(ex, ey, size * 0.07, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(ex, ey, size * 0.035, 0, Math.PI * 2);
      ctx.fill();
    });

    // Beak
    ctx.fillStyle = '#7a7a5a';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.32);
    ctx.lineTo(-size * 0.04, -size * 0.24);
    ctx.lineTo(size * 0.04, -size * 0.24);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  });
}
