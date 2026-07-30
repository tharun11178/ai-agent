import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export function CursorGlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    // Disable on touch devices / coarse pointer devices
    if (typeof window === 'undefined' || window.matchMedia('(hover: none) or (pointer: coarse)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let lastX = targetX;
    let lastY = targetY;

    let targetScale = 1;
    let currentScale = 1;
    let targetOpacity = 0.32;
    let currentOpacity = 0.32;
    let hoverState = false;

    let hue = 200;
    let animId: number;
    const particles: Particle[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      // Spawn stardust particles when moving quickly
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist > 8 && Math.random() < 0.6) {
        const particleColors = ['#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#38BDF8'];
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 16,
          y: e.clientY + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.5,
          size: Math.random() * 2.5 + 1,
          alpha: 0.8,
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
        });
      }

      // Check hover on interactive items
      const target = e.target as HTMLElement | null;
      if (target) {
        const isHoverable = Boolean(
          target.closest(
            'button, a, input, textarea, select, [role="button"], .glass-card, .btn-primary, .btn-secondary, .glow-border, h1, h2'
          )
        );
        if (isHoverable !== hoverState) {
          hoverState = isHoverable;
          setIsInteractive(isHoverable);
          targetScale = isHoverable ? 1.45 : 1.0;
          targetOpacity = isHoverable ? 0.48 : 0.32;
        }
      }
    };

    const handleMouseLeave = () => {
      targetOpacity = 0;
    };

    const handleMouseEnter = () => {
      targetOpacity = hoverState ? 0.48 : 0.32;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });

    const animate = () => {
      // Smooth LERP
      const lerp = 0.14;
      currentX += (targetX - currentX) * lerp;
      currentY += (targetY - currentY) * lerp;

      // Calculate velocity vector for dynamic fluid stretching
      const vx = currentX - lastX;
      const vy = currentY - lastY;
      const velocity = Math.hypot(vx, vy);
      const angle = Math.atan2(vy, vx) * (180 / Math.PI);

      lastX = currentX;
      lastY = currentY;

      currentScale += (targetScale - currentScale) * 0.1;
      currentOpacity += (targetOpacity - currentOpacity) * 0.1;

      // Shift hue continuously for unique chromatic vibe
      hue = (hue + 0.3) % 360;

      // Stretch along direction of motion (Aero-Comet Tail Effect)
      const stretch = Math.min(velocity * 0.015, 0.45);
      const scaleX = currentScale + stretch;
      const scaleY = Math.max(0.6, currentScale - stretch * 0.5);

      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${currentX - 250}px, ${currentY - 250}px, 0) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
        auraRef.current.style.opacity = `${currentOpacity}`;
        auraRef.current.style.background = `radial-gradient(circle, 
          hsla(${hue}, 90%, 65%, 0.45) 0%, 
          hsla(${(hue + 50) % 360}, 85%, 55%, 0.28) 35%, 
          hsla(${(hue + 110) % 360}, 80%, 45%, 0.14) 65%, 
          transparent 85%)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${targetX - 24}px, ${targetY - 24}px, 0) scale(${currentScale})`;
      }

      // Draw particle trail on Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return (
    <div ref={containerRef} className="hidden md:block">
      {/* Dynamic Stardust Trail Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-20 transform-gpu"
      />

      {/* Main Chromatic Deformable Aero-Tail Aura Light */}
      <div
        ref={auraRef}
        className="fixed top-0 left-0 w-[500px] h-[500px] pointer-events-none z-30 transition-opacity duration-300 transform-gpu"
        style={{
          willChange: 'transform, opacity, background',
          opacity: 0,
          filter: 'blur(55px)',
          borderRadius: '50%',
          mixBlendMode: 'screen',
        }}
      />

      {/* Interactive Sci-Fi Targeting HUD Reticle */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-12 h-12 pointer-events-none z-40 rounded-full border transition-all duration-200 transform-gpu flex items-center justify-center ${
          isInteractive
            ? 'border-cyan-400/80 bg-cyan-500/10 shadow-[0_0_18px_rgba(6,182,212,0.8)] scale-125 rotate-45'
            : 'border-white/20 bg-white/5 shadow-[0_0_10px_rgba(255,255,255,0.15)]'
        }`}
        style={{ willChange: 'transform' }}
      >
        {/* Core Center Pulse Dot */}
        <div
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
            isInteractive ? 'bg-cyan-300 shadow-[0_0_8px_#38BDF8]' : 'bg-blue-400'
          }`}
        />
        {/* Sci-Fi Target Tick Marks when Interactive */}
        {isInteractive && (
          <>
            <span className="absolute -top-1 w-2 h-0.5 bg-cyan-400" />
            <span className="absolute -bottom-1 w-2 h-0.5 bg-cyan-400" />
            <span className="absolute -left-1 w-0.5 h-2 bg-cyan-400" />
            <span className="absolute -right-1 w-0.5 h-2 bg-cyan-400" />
          </>
        )}
      </div>
    </div>
  );
}
