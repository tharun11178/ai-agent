import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { useState, useRef, useEffect } from 'react';
import { Download, Copy, Check, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeSectionProps {
  className?: string;
}

export function QRCodeSection({ className = '' }: QRCodeSectionProps) {
  const [copied, setCopied] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Determine target URL dynamically
    // Use VITE_APP_URL if defined, otherwise fallback to current window.location.origin
    const envUrl = import.meta.env.VITE_APP_URL;
    let origin = '';

    if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
      origin = envUrl.replace(/\/$/, '');
    } else if (typeof window !== 'undefined') {
      origin = window.location.origin;
    }

    const fullUrl = `${origin}/register`;
    setTargetUrl(fullUrl);
  }, []);

  const handleCopyLink = async () => {
    if (!targetUrl) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      toast.success('Registration link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) {
      toast.error('Could not generate QR code image');
      return;
    }

    // Create canvas export with crisp background, styling, and title
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    const padding = 40;
    const headerHeight = 60;
    const qrSize = canvas.width;
    const totalWidth = qrSize + padding * 2;
    const totalHeight = qrSize + padding * 2 + headerHeight;

    exportCanvas.width = totalWidth;
    exportCanvas.height = totalHeight;

    if (ctx) {
      // Draw background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Draw header title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AI Agent Challenge', totalWidth / 2, 40);

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
      link.download = 'ai-agent-challenge-qr.png';
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
      toast.success('QR Code downloaded successfully!');
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
        whileInView="visible"
        viewport={{ once: true }}
        className="container max-w-4xl"
      >
        <div className="glass-card p-8 md:p-12 glow-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Information Column */}
            <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider">
                <QrCode className="w-4 h-4 text-secondary" />
                <span>Quick Access</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Scan to <span className="gradient-text">Register</span>
              </h2>

              <p className="text-lg text-foreground/80 leading-relaxed">
                Scan this QR code to access the AI Agent Challenge registration portal.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownload}
                  className="btn-primary inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>Download QR Code</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCopyLink}
                  className="btn-secondary inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-accent">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </motion.button>
              </div>

              {targetUrl && (
                <p className="text-xs text-foreground/50 truncate max-w-md pt-1">
                  Target URL: <span className="text-secondary/80 font-mono">{targetUrl}</span>
                </p>
              )}
            </motion.div>

            {/* Right QR Display Column */}
            <motion.div variants={itemVariants} className="lg:col-span-5 flex justify-center">
              <div
                ref={qrRef}
                className="relative p-6 rounded-2xl bg-white shadow-2xl border-4 border-primary/30 transition-transform hover:scale-105 duration-300"
              >
                {targetUrl ? (
                  <QRCodeCanvas
                    value={targetUrl}
                    size={220}
                    level="H"
                    includeMargin={false}
                    className="w-full h-auto max-w-[220px] aspect-square"
                  />
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
