import { useEffect, useRef } from 'react';

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on touch devices / coarse pointer devices
    if (typeof window === 'undefined' || window.matchMedia('(hover: none) or (pointer: coarse)').matches) {
      return;
    }

    const glowEl = glowRef.current;
    if (!glowEl) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let currentScale = 1;
    let targetScale = 1;
    let currentOpacity = 0.25;
    let targetOpacity = 0.25;
    let isHovered = false;

    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      // Check interactive element hover to subtly boost glow size and opacity
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'button, a, input, textarea, select, [role="button"], .glass-card, .btn-primary, .btn-secondary, .glow-border'
        );
        if (interactive) {
          if (!isHovered) {
            isHovered = true;
            targetScale = 1.35;
            targetOpacity = 0.35;
          }
        } else {
          if (isHovered) {
            isHovered = false;
            targetScale = 1.0;
            targetOpacity = 0.25;
          }
        }
      }
    };

    const handleMouseLeave = () => {
      targetOpacity = 0;
    };

    const handleMouseEnter = () => {
      targetOpacity = isHovered ? 0.35 : 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });

    const animate = () => {
      // High-performance smooth LERP interpolation
      const ease = 0.12;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      currentScale += (targetScale - currentScale) * 0.1;
      currentOpacity += (targetOpacity - currentOpacity) * 0.1;

      if (glowEl) {
        glowEl.style.transform = `translate3d(${currentX - 225}px, ${currentY - 225}px, 0) scale(${currentScale})`;
        glowEl.style.opacity = `${currentOpacity}`;
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-[450px] h-[450px] pointer-events-none z-30 transition-opacity duration-300 transform-gpu hidden md:block"
      style={{
        willChange: 'transform, opacity',
        opacity: 0,
        background:
          'radial-gradient(circle, rgba(59,130,246,0.38) 0%, rgba(139,92,246,0.28) 35%, rgba(6,182,212,0.18) 60%, rgba(15,23,42,0) 80%)',
        filter: 'blur(50px)',
        borderRadius: '50%',
        mixBlendMode: 'screen',
      }}
    />
  );
}
