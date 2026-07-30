import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Camera,
  Upload,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Smartphone,
  RotateCw,
  FileText,
  Building2,
  UserCheck,
  XCircle,
  HelpCircle,
  ScanLine,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

interface ProblemStatement {
  id: string;
  title: string;
  track: string;
  description: string;
  fileUrl?: string;
  fileType?: string;
}

interface TeamInfo {
  id: string;
  teamName: string;
  leaderName: string;
  college: string;
  member2?: string;
}

export default function ProblemStatementPage() {
  const [, navigate] = useLocation();

  // Scanning & Input states
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [manualToken, setManualToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Authentication & Validation states
  const [validating, setValidating] = useState(false);
  const [validatedData, setValidatedData] = useState<{
    valid: boolean;
    token: string;
    teamIdHint?: string;
    teamName?: string;
    message?: string;
  } | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [teamIdentifierInput, setTeamIdentifierInput] = useState('');
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Verified Result
  const [accessResult, setAccessResult] = useState<{
    scannedAt: string;
    scanCount: number;
    team: TeamInfo;
    problem: ProblemStatement;
  } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Html5Qrcode scanner reference
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check URL parameters for direct QR token access (e.g. scanning QR with standard phone camera app)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      handleTokenScanned(urlToken);
    }
  }, []);

  // Initialize Camera Scanner when 'camera' tab is active
  useEffect(() => {
    let html5QrCode: any = null;

    if (activeTab === 'camera' && !accessResult && !authModalOpen) {
      const initScanner = async () => {
        try {
          setCameraError(null);
          setIsScanning(true);

          // Dynamically import html5-qrcode library safely
          const { Html5Qrcode } = await import('html5-qrcode');

          // Clean up existing scanner instance if present
          if (scannerRef.current) {
            try {
              await scannerRef.current.stop();
            } catch {}
          }

          html5QrCode = new Html5Qrcode('qr-reader-viewport');
          scannerRef.current = html5QrCode;

          const config = { fps: 10, qrbox: { width: 250, height: 250 } };

          await html5QrCode.start(
            { facingMode },
            config,
            (decodedText: string) => {
              // Successfully detected QR code!
              toast.success('QR Code detected successfully!');
              handleTokenScanned(decodedText);
              if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(() => {});
              }
            },
            () => {} // silent scan frame callback
          );
        } catch (err: any) {
          console.warn('Camera Scanner start notice:', err);
          setCameraError(
            'Camera access unavailable or blocked by browser permission. You can toggle camera, upload a QR code image, or enter your token below.'
          );
          setIsScanning(false);
        }
      };

      initScanner();
    }

    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch {}
      }
    };
  }, [activeTab, facingMode, accessResult, authModalOpen]);

  // Handle Scanned / Entered Token Validation
  const handleTokenScanned = async (rawToken: string) => {
    if (!rawToken || validating) return;

    setValidating(true);
    setAuthError(null);

    try {
      const res = await apiFetch('/api/problem-statement/validate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: rawToken }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setValidatedData(data);
        if (data.teamName) {
          setTeamIdentifierInput(data.teamName);
        }
        setAuthModalOpen(true);
        toast.success(`QR Verified for Team "${data.teamName}". Please authenticate team identity.`);
      } else {
        toast.error(data.error || 'Invalid or locked QR Code.');
        setValidatedData(null);
      }
    } catch {
      toast.error('Failed to validate QR token with server.');
    } finally {
      setValidating(false);
    }
  };

  // Upload QR Image File handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidating(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('qr-reader-file-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      toast.success('QR Code read from image file!');
      handleTokenScanned(decodedText);
    } catch (err) {
      toast.error('Could not detect a valid QR Code in the uploaded image file.');
      setValidating(false);
    }
  };

  // Authenticate Team & Access Problem Statement
  const handleVerifyTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatedData?.token) return;

    if (!teamIdentifierInput && !secretCodeInput) {
      setAuthError('Please enter your Team ID, Team Name, or Secret Code.');
      return;
    }

    setVerifying(true);
    setAuthError(null);

    try {
      const res = await apiFetch('/api/problem-statement/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken: validatedData.token,
          teamIdentifier: teamIdentifierInput,
          secretCode: secretCodeInput,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.problem) {
        setAccessResult({
          scannedAt: data.scannedAt,
          scanCount: data.scanCount,
          team: data.team,
          problem: data.problem,
        });
        setAuthModalOpen(false);
        toast.success(`🎉 Authenticated successfully! Problem Statement unlocked for Team ${data.team.teamName}.`);
      } else {
        setAuthError(data.error || 'Authentication failed. Please check your Team ID or Secret Code.');
        toast.error(data.error || 'Authentication failed.');
      }
    } catch {
      setAuthError('Server communication error during team verification.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Problem statement details copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetScanner = () => {
    setAccessResult(null);
    setValidatedData(null);
    setAuthModalOpen(false);
    setManualToken('');
    setTeamIdentifierInput('');
    setSecretCodeInput('');
    setAuthError(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen pt-20 pb-20">
      {/* Hidden container for file-based scanner temp element */}
      <div id="qr-reader-file-temp" className="hidden" />

      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-purple-900/5 to-transparent" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-6 text-center max-w-4xl"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-cyan-300 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <QrCode className="w-4 h-4 text-cyan-400 animate-pulse" /> Secure Team QR Verification
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Scan Problem <span className="gradient-text">Statement</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg text-foreground/80 leading-relaxed max-w-2xl mx-auto">
            Scan your team's assigned QR code using your mobile camera or laptop webcam to securely unlock your problem statement.
          </motion.p>
        </motion.div>
      </section>

      {/* Main Scanner Section */}
      <section className="py-8">
        <div className="container max-w-4xl space-y-8">
          {!accessResult ? (
            /* SCANNER INTERFACE */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 md:p-10 space-y-8 glow-border relative overflow-hidden"
            >
              {/* Tab Selector */}
              <div className="flex items-center justify-center gap-2 p-1.5 rounded-xl bg-white/5 border border-primary/20 max-w-md mx-auto">
                <button
                  onClick={() => setActiveTab('camera')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'camera'
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-foreground/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Camera className="w-4 h-4" /> Live Camera
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'upload'
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-foreground/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Upload className="w-4 h-4" /> Upload Image
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'manual'
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-foreground/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <KeyRound className="w-4 h-4" /> Manual Token
                </button>
              </div>

              {/* TAB 1: LIVE CAMERA SCANNER */}
              {activeTab === 'camera' && (
                <div className="space-y-6 text-center">
                  <div className="relative max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden border-2 border-primary/40 bg-black/60 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col items-center justify-center">
                    {/* Viewport for html5-qrcode */}
                    <div id="qr-reader-viewport" className="w-full h-full object-cover" />

                    {/* Animated Scanning Reticle HUD overlay */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                      {/* Corner HUD Brackets */}
                      <div className="flex justify-between">
                        <div className="w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg shadow-[0_0_10px_#06b6d4]" />
                        <div className="w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg shadow-[0_0_10px_#06b6d4]" />
                      </div>

                      {/* Laser Beam Animation Line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] animate-pulse" />

                      <div className="flex justify-between">
                        <div className="w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg shadow-[0_0_10px_#06b6d4]" />
                        <div className="w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg shadow-[0_0_10px_#06b6d4]" />
                      </div>
                    </div>

                    {validating && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 z-20">
                        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
                        <p className="text-sm font-semibold text-cyan-300">Validating QR Token...</p>
                      </div>
                    )}
                  </div>

                  {/* Camera Controls & Notice */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
                    <button
                      onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-primary/20 flex items-center gap-2 transition-all"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                      Switch Camera ({facingMode === 'environment' ? 'Rear Camera' : 'Laptop / Front Webcam'})
                    </button>
                  </div>

                  {cameraError && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left max-w-md mx-auto space-y-1">
                      <p className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" /> Camera Permission Note
                      </p>
                      <p>{cameraError}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: UPLOAD QR IMAGE */}
              {activeTab === 'upload' && (
                <div className="space-y-6 text-center max-w-md mx-auto py-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-primary/40 hover:border-cyan-400 rounded-2xl p-10 cursor-pointer bg-white/5 hover:bg-white/10 transition-all space-y-4 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto text-cyan-400 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground">Click to upload QR Code image</p>
                      <p className="text-xs text-foreground/60 mt-1">PNG, JPG, WEBP formats supported</p>
                    </div>
                  </div>

                  {validating && (
                    <div className="flex items-center justify-center gap-2 text-xs text-cyan-400 font-semibold">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing QR image...
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MANUAL TOKEN INPUT */}
              {activeTab === 'manual' && (
                <div className="space-y-6 max-w-md mx-auto py-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70">
                      Enter QR Token or Scanned URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value)}
                        placeholder="e.g. qr-abc123xyz or full link"
                        className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-sm focus:outline-none font-mono"
                      />
                      <button
                        onClick={() => handleTokenScanned(manualToken)}
                        disabled={!manualToken || validating}
                        className="btn-primary py-3 px-5 text-xs font-semibold shrink-0"
                      >
                        {validating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Validate'}
                      </button>
                    </div>
                    <p className="text-[11px] text-foreground/50">
                      Use this option if camera scan is unavailable or for testing.
                    </p>
                  </div>
                </div>
              )}

              {/* Instructions Bar */}
              <div className="border-t border-primary/10 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-foreground/70">
                <div className="flex items-start gap-2.5">
                  <ScanLine className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>1. Scan the team QR code issued by organizers.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>2. Verify team identity with Team ID / Secret Code.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span>3. Access your assigned challenge problem statement.</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* VERIFIED PROBLEM STATEMENT VIEW */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Header Status Banner */}
              <div className="glass-card p-6 border-l-4 border-green-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glow-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Assigned Problem Statement Unlocked</h2>
                    <p className="text-xs text-foreground/70">
                      Authenticated for Team: <span className="font-bold text-cyan-400">{accessResult.team.teamName}</span> ({accessResult.team.id})
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResetScanner}
                  className="btn-secondary py-2 px-4 text-xs font-semibold shrink-0"
                >
                  Scan Another QR Code
                </button>
              </div>

              {/* Team Details Summary Card */}
              <div className="glass-card p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm border-t border-primary/20">
                <div>
                  <p className="text-xs text-foreground/50 uppercase font-semibold">Team Name</p>
                  <p className="font-bold text-cyan-300">{accessResult.team.teamName}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/50 uppercase font-semibold">Team Leader</p>
                  <p className="font-semibold text-foreground/90">{accessResult.team.leaderName}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/50 uppercase font-semibold">Institution / College</p>
                  <p className="font-semibold text-foreground/90">{accessResult.team.college}</p>
                </div>
              </div>

              {/* Assigned Problem Card */}
              <div className="glass-card p-8 md:p-10 space-y-6 border-l-4 border-purple-500 glow-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-6">
                  <div>
                    <span className="inline-block text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      Track: {accessResult.problem.track}
                    </span>
                    <h3 className="text-3xl font-extrabold mt-3">{accessResult.problem.title}</h3>
                  </div>

                  <button
                    onClick={() =>
                      handleCopyText(
                        `TEAM: ${accessResult.team.teamName}\nPROBLEM: ${accessResult.problem.title}\nTRACK: ${accessResult.problem.track}\n\nDESCRIPTION:\n${accessResult.problem.description}`,
                        accessResult.problem.id
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors shrink-0"
                  >
                    {copiedId === accessResult.problem.id ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" /> Details Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-cyan-400" /> Copy Specification
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/60">
                    Official Problem Statement Description & Requirements
                  </h4>
                  <div className="p-6 rounded-2xl bg-white/5 border border-primary/10 text-foreground/90 text-base leading-relaxed whitespace-pre-line">
                    {accessResult.problem.description}
                  </div>
                </div>

                <div className="pt-4 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground/50">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-400" /> Verified Scan Log #{accessResult.scanCount} at{' '}
                    {new Date(accessResult.scannedAt).toLocaleTimeString()}
                  </div>
                  <span>AI Agent Challenge 2026 Official Brief</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* TEAM AUTHENTICATION MODAL */}
      <AnimatePresence>
        {authModalOpen && validatedData && (
          <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-card p-8 max-w-md w-full space-y-6 glow-border relative"
            >
              <button
                onClick={() => setAuthModalOpen(false)}
                className="absolute top-4 right-4 text-foreground/50 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto text-cyan-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Team Authentication</h3>
                <p className="text-xs text-foreground/70">
                  QR Token verified for Team: <span className="font-bold text-cyan-400">{validatedData.teamName}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyTeamSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Team ID / Team Name / Registration ID
                  </label>
                  <input
                    type="text"
                    value={teamIdentifierInput}
                    onChange={(e) => setTeamIdentifierInput(e.target.value)}
                    placeholder="e.g. Team Alpha"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Secret Passcode (or last 4 digits of Phone)
                  </label>
                  <input
                    type="password"
                    value={secretCodeInput}
                    onChange={(e) => setSecretCodeInput(e.target.value)}
                    placeholder="SEC-XXXX or phone suffix"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-sm focus:outline-none font-mono"
                  />
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                    {authError}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={verifying}
                  className="w-full btn-primary py-3 font-semibold text-sm flex items-center justify-center gap-2 mt-2"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" /> Verifying Credentials...
                    </>
                  ) : (
                    'Unlock Problem Statement'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
