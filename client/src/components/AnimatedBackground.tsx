import { useEffect, useRef } from 'react';

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.targetX = e.clientX;
      mousePos.current.targetY = e.clientY;
    };

    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // Particle system - Adaptive particle count based on screen size
    const particleCount = isMobile ? 30 : 65;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = [
      'rgba(59, 130, 246, ',  // Primary Blue
      'rgba(139, 92, 246, ',  // Secondary Purple
      'rgba(6, 182, 212, ',   // Accent Cyan
      'rgba(34, 197, 94, ',   // Success Emerald
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (isMobile ? 0.4 : 0.6),
        vy: (Math.random() - 0.5) * (isMobile ? 0.4 : 0.6),
        radius: Math.random() * (isMobile ? 1.5 : 2) + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Digital circuit lines system
    interface CircuitNode {
      x: number;
      y: number;
      connections: number[];
    }
    const circuitNodes: CircuitNode[] = [];
    const gridCols = isMobile ? 4 : 8;
    const gridRows = isMobile ? 3 : 5;

    for (let r = 0; r <= gridRows; r++) {
      for (let c = 0; c <= gridCols; c++) {
        circuitNodes.push({
          x: (c / gridCols) * window.innerWidth + (Math.random() - 0.5) * 30,
          y: (r / gridRows) * window.innerHeight + (Math.random() - 0.5) * 30,
          connections: [],
        });
      }
    }

    circuitNodes.forEach((node, idx) => {
      circuitNodes.forEach((other, oIdx) => {
        if (idx !== oIdx) {
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < (isMobile ? 180 : 250) && Math.random() < (isMobile ? 0.2 : 0.25)) {
            node.connections.push(oIdx);
          }
        }
      });
    });

    const pulseCount = isMobile ? 6 : 15;
    const circuitPulses: Array<{
      from: number;
      to: number;
      progress: number;
      speed: number;
      color: string;
    }> = [];

    for (let i = 0; i < pulseCount; i++) {
      const from = Math.floor(Math.random() * circuitNodes.length);
      const conn = circuitNodes[from].connections;
      if (conn.length > 0) {
        const to = conn[Math.floor(Math.random() * conn.length)];
        circuitPulses.push({
          from,
          to,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.005,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    let animationId: number;
    let isTabActive = true;

    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = () => {
      if (!isTabActive) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      if (!isMobile && mousePos.current.x > 0) {
        mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.08;
        mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.08;
      }

      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!isMobile && mousePos.current.x > 0) {
        const cursorGlow = ctx.createRadialGradient(
          mousePos.current.x, mousePos.current.y, 0,
          mousePos.current.x, mousePos.current.y, 240
        );
        cursorGlow.addColorStop(0, 'rgba(6, 182, 212, 0.14)');
        cursorGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = cursorGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw circuit lines
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.06)';
      ctx.lineWidth = 1;
      circuitNodes.forEach((node) => {
        node.connections.forEach((targetIdx) => {
          const target = circuitNodes[targetIdx];
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          const midX = (node.x + target.x) / 2;
          ctx.lineTo(midX, node.y);
          ctx.lineTo(midX, target.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        });
      });

      // Update circuit pulses
      circuitPulses.forEach((pulse) => {
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          pulse.progress = 0;
          pulse.from = pulse.to;
          const conn = circuitNodes[pulse.from].connections;
          if (conn.length > 0) {
            pulse.to = conn[Math.floor(Math.random() * conn.length)];
          }
        }

        const start = circuitNodes[pulse.from];
        const end = circuitNodes[pulse.to];
        const midX = (start.x + end.x) / 2;

        let px: number, py: number;
        if (pulse.progress < 0.5) {
          const t = pulse.progress * 2;
          px = start.x + (midX - start.x) * t;
          py = start.y;
        } else {
          const t = (pulse.progress - 0.5) * 2;
          px = midX + (end.x - midX) * t;
          py = start.y + (end.y - start.y) * t;
        }

        ctx.fillStyle = `${pulse.color}0.8)`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw floating particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        ctx.fillStyle = `${particle.color}${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw particle connections (desktop only)
      if (!isMobile) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 110) {
              ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - dist / 110)})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none transform-gpu"
      style={{ background: '#0F172A', willChange: 'transform' }}
    />
  );
}

