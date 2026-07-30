import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { useState, useRef, useEffect } from 'react';
import { Download, Copy, Check, QrCode, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

interface QRCodeSectionProps {
  className?: string;
  teamToken?: string;
  customUrl?: string;
  title?: string;
  description?: string;
}

export function QRCodeSection({
  className = '',
  teamToken,
  customUrl,
  title = 'Scan to View Problem Statement',
  description = 'Scan this QR code to access the official problem statement for the AI Agent Challenge.',
}: QRCodeSectionProps) {
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Determine problem statement target URL dynamically
    if (customUrl) {
      setTargetUrl(customUrl);
      return;
    }

    const envUrl = import.meta.env.VITE_APP_URL;
    let origin = '';

    if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
      origin = envUrl.replace(/\/$/, '');
    } else if (typeof window !== 'undefined') {
      origin = window.location.origin;
    }

    const baseOrigin = origin || window.location.origin;
    const problemPath = teamToken
      ? `${baseOrigin}/problem-statement?token=${encodeURIComponent(teamToken)}`
      : `${baseOrigin}/problem-statement`;

    setTargetUrl(problemPath);
  }, [teamToken, customUrl]);

  const handleCopyLink = async () => {
    if (!targetUrl) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      toast.success('Problem Statement link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) {
      toast.error('Could not generate QR code image');
      return;
    }

    // Create crisp canvas export with dark futuristic styling and title
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    const padding = 40;
    const headerHeight = 70;
    const qrSize = canvas.width;
    const totalWidth = qrSize + padding * 2;
    const totalHeight = qrSize + padding * 2 + headerHeight;

    exportCanvas.width = totalWidth;
    exportCanvas.height = totalHeight;

    if (ctx) {
      // Draw background
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Draw header title
      ctx.fillStyle = '#06B6D4';
      ctx.font = 'bold 18px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AI AGENT CHALLENGE 2026', totalWidth / 2, 35);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px "Space Grotesk", sans-serif';
      ctx.fillText('Problem Statement Access Pass', totalWidth / 2, 55);

      // Draw white background card for QR Code
      const cardX = padding - 15;
      const cardY = headerHeight + padding - 15;
      const cardWidth = qrSize + 30;
      const cardHeight = qrSize + 30;
      const radius = 16;

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, radius);
      ctx.fill();

      // Draw QR code canvas
      ctx.drawImage(canvas, padding, headerHeight + padding);

      // Trigger download
      const link = document.createElement('a');
      link.download = 'problem-statement-qr.png';
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
      toast.success('Problem Statement QR Code downloaded!');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className={`py-16 border-t border-primary/10 ${className}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container max-w-4xl"
      >
        <div className="glass-card p-8 md:p-12 glow-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Information Column */}
            <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <QrCode className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Problem Statement QR</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Scan to View <span className="gradient-text">Problem Statement</span>
              </h2>

              <p className="text-lg text-foreground/80 leading-relaxed">
                {description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/problem-statement')}
                  className="btn-primary inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold shadow-lg"
                >
                  <span>Open Scanner</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownload}
                  className="btn-secondary inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download QR Code</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCopyLink}
                  className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-primary/20 text-xs font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-primary" />
                      <span>Copy Direct Link</span>
                    </>
                  )}
                </motion.button>
              </div>

              {targetUrl && (
                <p className="text-xs text-foreground/50 truncate max-w-md pt-1">
                  Destination URL:{' '}
                  <span className="text-cyan-400/90 font-mono">{targetUrl}</span>
                </p>
              )}
            </motion.div>

            {/* Right QR Display Column */}
            <motion.div variants={itemVariants} className="lg:col-span-5 flex justify-center">
              <div
                ref={qrRef}
                className="relative p-6 rounded-2xl bg-white shadow-2xl border-4 border-cyan-500/30 transition-transform hover:scale-105 duration-300 text-center"
              >
                {targetUrl ? (
                  <>
                    <QRCodeCanvas
                      value={targetUrl}
                      size={220}
                      level="H"
                      includeMargin={false}
                      className="w-full h-auto max-w-[220px] aspect-square"
                    />
                    <p className="text-[10px] font-mono text-slate-600 font-bold mt-2">
                      PROBLEM STATEMENT ACCESS
                    </p>
                  </>
                ) : (
                  <div className="w-[220px] h-[220px] bg-slate-100 animate-pulse rounded flex items-center justify-center">
                    <span className="text-xs text-slate-400">Loading QR...</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
