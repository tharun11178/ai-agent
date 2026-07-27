import { useEffect, useRef } from 'react';

export function HolographicSphere() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotation = 0;
    let animationId: number;

    const animate = () => {
      rotation += 0.005;

      // Clear canvas
      ctx.fillStyle = 'rgba(3, 7, 18, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 80;

      // Draw rotating rings
      for (let i = 0; i < 3; i++) {
        const angle = rotation + (i * Math.PI * 2) / 3;
        const ringRadius = radius + i * 20;

        // Draw ring
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 - i * 0.1})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw rotating points on ring
        for (let j = 0; j < 8; j++) {
          const pointAngle = angle + (j * Math.PI * 2) / 8;
          const x = centerX + Math.cos(pointAngle) * ringRadius;
          const y = centerY + Math.sin(pointAngle) * ringRadius;

          // Glow
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
          gradient.addColorStop(0, `rgba(0, 229, 255, ${0.6 - i * 0.15})`);
          gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');

          ctx.fillStyle = gradient;
          ctx.fillRect(x - 8, y - 8, 16, 16);

          // Core
          ctx.fillStyle = `rgba(0, 229, 255, ${0.8 - i * 0.2})`;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw central core
      const coreGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );
      coreGradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      coreGradient.addColorStop(0.5, 'rgba(0, 229, 255, 0.1)');
      coreGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw pulsing center
      const pulse = Math.sin(rotation * 2) * 0.5 + 0.5;
      const centerGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        15 + pulse * 5
      );
      centerGradient.addColorStop(0, `rgba(34, 197, 94, ${0.8 * pulse})`);
      centerGradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

      ctx.fillStyle = centerGradient;
      ctx.fillRect(centerX - 20, centerY - 20, 40, 40);

      // Draw center dot
      ctx.fillStyle = 'rgba(34, 197, 94, 1)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full"
      style={{
        filter: 'drop-shadow(0 0 40px rgba(139, 92, 246, 0.3))',
      }}
    />
  );
}
