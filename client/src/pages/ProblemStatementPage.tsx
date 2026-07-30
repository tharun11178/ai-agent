import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  FileText,
  Target,
  CheckCircle2,
  PackageCheck,
  Code2,
  Sparkles,
  Presentation,
  Laptop,
  Copy,
  Check,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Lock,
  RefreshCw,
  Clock,
  Printer,
  AlertTriangle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

interface ProblemData {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  constraints: string[];
  deliverables: string[];
  updatedAt: string;
}

export default function ProblemStatementPage() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [released, setReleased] = useState(false);
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProblemStatus();
  }, []);

  const fetchProblemStatus = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/problem-statement');
      const data = await res.json();
      if (data.success) {
        setReleased(data.released);
        setProblem(data.problem || null);
        if (data.message) setMessage(data.message);
      } else {
        setReleased(false);
        setProblem(null);
      }
    } catch {
      setReleased(false);
      setProblem(null);
      toast.error('Unable to fetch release status from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyProblemText = () => {
    if (!problem) return;
    const text = `AI AGENT CHALLENGE 2026 - PROBLEM STATEMENT\n\nTitle: ${problem.title}\n\nDescription:\n${problem.description}\n\nObjectives:\n${problem.objectives.map((o) => `• ${o}`).join('\n')}\n\nConstraints:\n${problem.constraints.map((c) => `• ${c}`).join('\n')}\n\nDeliverables:\n${problem.deliverables.map((d) => `• ${d}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Problem statement text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // State 1: Loading
  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center container text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 animate-pulse">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Checking Release Status...</h2>
        <p className="text-sm text-foreground/60">Connecting to AI Agent Challenge server</p>
      </div>
    );
  }

  // State 2: Unreleased Waiting Screen
  if (!released || !problem) {
    return (
      <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container max-w-3xl space-y-8 text-center pt-8"
        >
          {/* Back Navigation */}
          <motion.div variants={itemVariants} className="flex justify-start">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Home
            </button>
          </motion.div>

          {/* Animated Lock Icon */}
          <motion.div variants={itemVariants} className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(239,68,68,0.25)] relative">
              <Lock className="w-12 h-12 text-red-400 animate-bounce" />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-extrabold uppercase tracking-widest text-red-300 whitespace-nowrap">
              LOCKED & SEALED
            </span>
          </motion.div>

          {/* Title & Message */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 animate-pulse" /> Official Commencement Window
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
              Problem Statement <span className="text-red-400">Not Released Yet</span>
            </h1>

            <div className="glass-card p-6 sm:p-8 space-y-4 border-l-4 border-amber-500 max-w-2xl mx-auto text-left">
              <p className="text-base sm:text-lg text-foreground/90 font-medium leading-relaxed">
                The problem statement has not been released by the event organizers.
              </p>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Please wait until the official inauguration and commencement announcement.
              </p>
              <p className="text-xs text-amber-300/90 font-mono bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                💡 Tip: Once announced, simply click the <strong>Refresh Status</strong> button below or scan the QR code again to reveal the live challenge.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchProblemStatus}
              className="btn-primary py-3 px-6 text-sm font-bold inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-cyan-300" /> Refresh Release Status
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/rules')}
              className="btn-secondary py-3 px-6 text-sm font-bold inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Review Competition Rules
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // State 3: Released Official Problem Statement
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container space-y-10 max-w-5xl"
      >
        {/* Header Breadcrumb & Actions */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors w-fit"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyProblemText}
              className="px-4 py-2 rounded-xl bg-white/5 border border-primary/20 hover:border-cyan-400 text-xs font-semibold text-foreground/80 hover:text-white inline-flex items-center gap-2 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              {copied ? 'Copied!' : 'Copy Statement'}
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-4 py-2 rounded-xl bg-white/5 border border-primary/20 hover:border-purple-400 text-xs font-semibold text-foreground/80 hover:text-white inline-flex items-center gap-2 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-purple-400" /> Print / PDF
            </button>

            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-400/40 text-green-300 text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" /> 🟢 OFFICIAL & LIVE
            </span>
          </div>
        </motion.div>

        {/* Hero Title Section */}
        <motion.div variants={itemVariants} className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-cyan-300 text-xs font-extrabold uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" /> AI AGENT CHALLENGE 2026
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Official <span className="gradient-text">Problem Statement</span>
          </h1>
          <p className="text-lg text-foreground/80 leading-relaxed">
            The problem statement is officially live. Review requirements, objectives, and deliverables.
          </p>
        </motion.div>

        {/* Main Problem Statement Card */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-8 md:p-12 space-y-8 border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

          {/* Title Badge */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Main Challenge Title</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
                  {problem.title}
                </h2>
              </div>
            </div>

            <p className="text-base sm:text-lg text-foreground/90 leading-relaxed pt-3 border-t border-white/10">
              {problem.description}
            </p>
          </div>

          {/* Objectives Grid */}
          {problem.objectives && problem.objectives.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" /> Key Objectives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {problem.objectives.map((obj, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-colors flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-foreground/90">{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints Section */}
          {problem.constraints && problem.constraints.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Development Constraints & Guidelines
              </h3>
              <div className="space-y-2">
                {problem.constraints.map((con, i) => (
                  <div key={i} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200/90 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables Section */}
          {problem.deliverables && problem.deliverables.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-purple-400" /> Required Deliverables
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {problem.deliverables.map((item, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition-all space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-base">{item}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons & Guidance Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 space-y-4 border-l-4 border-cyan-400 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" /> Event Rules & Criteria
              </h3>
              <p className="text-sm text-foreground/70">
                Review competition rules, clarification window details, and judging parameters.
              </p>
            </div>
            <button
              onClick={() => navigate('/rules')}
              className="btn-primary py-2.5 px-4 text-xs font-bold inline-flex items-center gap-2 w-fit"
            >
              View Rules <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="glass-card p-6 space-y-4 border-l-4 border-purple-400 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" /> Competition Schedule
              </h3>
              <p className="text-sm text-foreground/70">
                Check submission deadlines, judging slots, and results ceremony schedule.
              </p>
            </div>
            <button
              onClick={() => navigate('/schedule')}
              className="btn-secondary py-2.5 px-4 text-xs font-bold inline-flex items-center gap-2 w-fit"
            >
              Event Schedule <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
