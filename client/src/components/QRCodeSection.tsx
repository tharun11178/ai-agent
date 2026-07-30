import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ExternalLink, Copy, Check, Download, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

interface QRCodeSectionProps {
  customUrl?: string;
  title?: string;
  description?: string;
}

export function QRCodeSection({
  customUrl,
  title = '📱 Scan to View Problem Statement',
  description = 'Scan this QR code to access the official AI Agent Challenge Problem Statement.',
}: QRCodeSectionProps) {
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);

  const problemUrl = customUrl || (typeof window !== 'undefined' ? `${window.location.origin}/problem-statement` : '/problem-statement');

  const handleCopy = () => {
    navigator.clipboard.writeText(problemUrl);
    setCopied(true);
    toast.success('Problem statement URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById('problem-statement-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 20, 20, 360, 360);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'AI_Agent_Challenge_Problem_Statement_QR.png';
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('QR Code downloaded successfully!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="py-20 border-t border-primary/10 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container space-y-12"
      >
        <motion.div variants={itemVariants} className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5" /> Instant Problem Access
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            {title}
          </h2>
          <p className="text-lg text-foreground/80 leading-relaxed">
            {description}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="max-w-md mx-auto">
          <div className="glass-card p-8 sm:p-10 text-center space-y-6 border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative group hover:border-cyan-400 transition-all duration-300">
            {/* Ambient Top Glow Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

            <div className="space-y-1">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Official Access QR</span>
              <h3 className="text-xl font-extrabold text-white">AI AGENT CHALLENGE 2026</h3>
            </div>

            {/* QR Container */}
            <div className="p-4 rounded-2xl bg-white/90 shadow-2xl inline-block border-4 border-cyan-400/50 group-hover:scale-105 transition-transform duration-300">
              <QRCodeSVG
                id="problem-statement-qr-svg"
                value={problemUrl}
                size={200}
                bgColor="#FFFFFF"
                fgColor="#0F172A"
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="text-xs text-foreground/70 leading-relaxed max-w-xs mx-auto">
              Scan using any mobile camera or QR reader to view official challenge objectives and deliverables.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/problem-statement')}
                className="btn-primary py-2.5 px-4 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <span>View Problem Statement</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </motion.button>

              <button
                onClick={handleCopy}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400 text-xs font-semibold text-foreground/80 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                onClick={handleDownloadQR}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400 text-xs font-semibold text-foreground/80 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                title="Download QR Image"
              >
                <Download className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
