import { useEffect, useRef } from 'react';

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.targetX = e.clientX;
      mousePos.current.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Particle system
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

    for (let i = 0; i < 65; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.2,
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
    const gridCols = 8;
    const gridRows = 5;

    for (let r = 0; r <= gridRows; r++) {
      for (let c = 0; c <= gridCols; c++) {
        circuitNodes.push({
          x: (c / gridCols) * window.innerWidth + (Math.random() - 0.5) * 40,
          y: (r / gridRows) * window.innerHeight + (Math.random() - 0.5) * 40,
          connections: [],
        });
      }
    }

    // Connect nearest nodes in circuit pattern
    circuitNodes.forEach((node, idx) => {
      circuitNodes.forEach((other, oIdx) => {
        if (idx !== oIdx) {
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 260 && Math.random() < 0.25) {
            node.connections.push(oIdx);
          }
        }
      });
    });

    // Moving pulse signals along circuit lines
    const circuitPulses: Array<{
      from: number;
      to: number;
      progress: number;
      speed: number;
      color: string;
    }> = [];

    for (let i = 0; i < 15; i++) {
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

    const animate = () => {
      // Smooth mouse position damping
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.08;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.08;

      // Base background color #0F172A with trailing opacity
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle background radial glow
      const bgGlow1 = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.3, 0,
        canvas.width * 0.2, canvas.height * 0.3, canvas.width * 0.5
      );
      bgGlow1.addColorStop(0, 'rgba(59, 130, 246, 0.12)');
      bgGlow1.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = bgGlow1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const bgGlow2 = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.7, 0,
        canvas.width * 0.8, canvas.height * 0.7, canvas.width * 0.4
      );
      bgGlow2.addColorStop(0, 'rgba(139, 92, 246, 0.12)');
      bgGlow2.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = bgGlow2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Cursor Glow Effect
      if (mousePos.current.x > 0) {
        const cursorGlow = ctx.createRadialGradient(
          mousePos.current.x, mousePos.current.y, 0,
          mousePos.current.x, mousePos.current.y, 280
        );
        cursorGlow.addColorStop(0, 'rgba(6, 182, 212, 0.18)');
        cursorGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.08)');
        cursorGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = cursorGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw digital circuit lines
      circuitNodes.forEach((node) => {
        node.connections.forEach((targetIdx) => {
          const target = circuitNodes[targetIdx];
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.06)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          // Draw orthogonal / bent line for circuit look
          const midX = (node.x + target.x) / 2;
          ctx.lineTo(midX, node.y);
          ctx.lineTo(midX, target.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();

          // Small circuit joint dot
          ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // Update & draw moving pulses along circuit lines
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
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        const pulseGlow = ctx.createRadialGradient(px, py, 0, px, py, 8);
        pulseGlow.addColorStop(0, `${pulse.color}0.6)`);
        pulseGlow.addColorStop(1, `${pulse.color}0)`);
        ctx.fillStyle = pulseGlow;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
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

        // Draw particle glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 4
        );
        gradient.addColorStop(0, `${particle.color}${particle.opacity})`);
        gradient.addColorStop(1, `${particle.color}0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.fillStyle = `${particle.color}${Math.min(1, particle.opacity + 0.2)})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw subtle connecting lines between nearby particles
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 130) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.12 * (1 - distance / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: '#0F172A' }}
    />
  );
}

