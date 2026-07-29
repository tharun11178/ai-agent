import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Brain, Bot, Sparkles, Zap, Network, Code, Globe } from 'lucide-react';

export function FuturisticRobotVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 520;
    canvas.width = size;
    canvas.height = size;

    let rotation = 0;
    let animationId: number;

    const particles: Array<{
      angle: number;
      dist: number;
      speed: number;
      radius: number;
      color: string;
    }> = [];

    const colors = ['#3B82F6', '#8B5CF6', '#06B6D4', '#22C55E'];

    for (let i = 0; i < 40; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: 120 + Math.random() * 110,
        speed: (Math.random() - 0.5) * 0.015,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      rotation += 0.008;

      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;

      // Draw outer revolving holographic HUD rings
      ctx.save();
      ctx.translate(cx, cy);

      // Ring 1 (Cyan dash)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([12, 8, 4, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 220, rotation, rotation + Math.PI * 2);
      ctx.stroke();

      // Ring 2 (Purple reverse rotation)
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 15, 5, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, 200, -rotation * 1.4, -rotation * 1.4 + Math.PI * 2);
      ctx.stroke();

      // Ring 3 (Blue inner ring)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(0, 0, 180, 0, Math.PI * 2);
      ctx.stroke();

      // Draw HUD crosshairs / ticks
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        const x1 = Math.cos(a + rotation * 0.5) * 210;
        const y1 = Math.sin(a + rotation * 0.5) * 210;
        const x2 = Math.cos(a + rotation * 0.5) * 225;
        const y2 = Math.sin(a + rotation * 0.5) * 225;

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.restore();

      // Draw rotating orbit particles
      particles.forEach((p) => {
        p.angle += p.speed;
        const px = cx + Math.cos(p.angle) * p.dist;
        const py = cy + Math.sin(p.angle) * p.dist;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        const grad = ctx.createRadialGradient(px, py, 0, px, py, p.radius * 3);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full max-w-[550px] aspect-square mx-auto select-none"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-purple-600/20 to-cyan-500/30 rounded-full blur-3xl animate-pulse -z-10" />

      {/* Holographic Canvas HUD rings */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Center AI Robot & Holographic Brain Image Frame */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotateZ: [-1, 1, -1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-0 w-[72%] h-[72%] rounded-3xl overflow-hidden border border-cyan-400/40 shadow-[0_0_50px_rgba(59,130,246,0.4)] backdrop-blur-md bg-[#0F172A]/60 group cursor-pointer"
      >
        <img
          src="/futuristic_ai_robot_brain.png"
          alt="AI Holographic Brain & Robot Mascot"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 filter drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
        />

        {/* Overlay gradient reflections */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-cyan-400/10 opacity-70 pointer-events-none" />

        {/* Status Badge inside image */}
        <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-[#0F172A]/80 border border-blue-400/30 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
              Autonomous Agent Active
            </span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
        </div>
      </motion.div>

      {/* Floating Tech Chips / Badges around the central visual */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-4 left-0 z-20 px-3.5 py-2 rounded-xl bg-[#0F172A]/85 border border-purple-500/40 shadow-[0_0_20px_rgba(139,92,246,0.3)] backdrop-blur-xl flex items-center gap-2.5"
      >
        <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
          <Brain className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-medium leading-none">Core Technology</p>
          <p className="text-xs font-bold text-white leading-tight">Neural Agents</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-12 right-0 z-20 px-3.5 py-2 rounded-xl bg-[#0F172A]/85 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-xl flex items-center gap-2.5"
      >
        <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-medium leading-none">Architecture</p>
          <p className="text-xs font-bold text-white leading-tight">LLM Orchestration</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-8 left-2 z-20 px-3.5 py-2 rounded-xl bg-[#0F172A]/85 border border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-xl flex items-center gap-2.5"
      >
        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-medium leading-none">Department</p>
          <p className="text-xs font-bold text-white leading-tight">AI & ML KEC</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute bottom-12 right-2 z-20 px-3.5 py-2 rounded-xl bg-[#0F172A]/85 border border-emerald-500/40 shadow-[0_0_20px_rgba(34,197,94,0.3)] backdrop-blur-xl flex items-center gap-2.5"
      >
        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-medium leading-none">Grand Challenge</p>
          <p className="text-xs font-bold text-emerald-400 leading-tight">2026 Edition</p>
        </div>
      </motion.div>

      {/* Floating Micro-Icons */}
      <div className="absolute top-1/4 -left-6 text-cyan-400/60 animate-bounce pointer-events-none">
        <Network className="w-5 h-5" />
      </div>
      <div className="absolute bottom-1/4 -right-4 text-purple-400/60 animate-pulse pointer-events-none">
        <Code className="w-5 h-5" />
      </div>
      <div className="absolute top-6 right-1/4 text-blue-400/60 pointer-events-none">
        <Globe className="w-4 h-4 animate-spin" />
      </div>
    </div>
  );
}
