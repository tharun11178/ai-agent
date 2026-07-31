import { motion } from 'framer-motion';
import { useLocation, useRoute } from 'wouter';
import {
  FileText,
  Target,
  CheckCircle2,
  PackageCheck,
  Sparkles,
  Copy,
  Check,
  ChevronLeft,
  ShieldCheck,
  Lock,
  RefreshCw,
  Clock,
  Printer,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

interface ProblemData {
  id?: string;
  title: string;
  description: string;
  objectives: string[];
  requirements: string[];
  constraints: string[];
  deliverables: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  category: string;
  attachments?: string[];
  updatedAt: string;
}

export default function ProblemStatementPage() {
  const [, navigate] = useLocation();
  const [psMatch, psParams] = useRoute('/ps/:token');
  const [probMatch, probParams] = useRoute('/problem-statement/:id');

  const [loading, setLoading] = useState(true);
  const [released, setReleased] = useState(false);
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [copied, setCopied] = useState(false);

  const activeToken = psMatch && psParams?.token ? psParams.token : probMatch && probParams?.id ? probParams.id : null;

  useEffect(() => {
    fetchProblemStatus(activeToken);
  }, [activeToken]);

  const fetchProblemStatus = async (tokenParam?: string | null) => {
    setLoading(true);
    try {
      if (tokenParam) {
        const res = await apiFetch(`/api/problem-statement/access/${tokenParam}`);
        const data = await res.json();
        if (data.success && data.released && data.problem) {
          setReleased(true);
          setProblem(data.problem);
        } else {
          setReleased(false);
          setProblem(null);
        }
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

  const handleCopyProblemText = (prob: ProblemData) => {
    const text = `AI AGENT CHALLENGE 2026 - PROBLEM STATEMENT\n\nTitle: ${prob.title}\nCategory: ${prob.category} | Difficulty: ${prob.difficulty}\n\nDescription:\n${prob.description}\n\nObjectives:\n${prob.objectives.map((o) => `• ${o}`).join('\n')}\n\nRequirements:\n${prob.requirements.map((r) => `• ${r}`).join('\n')}\n\nConstraints:\n${prob.constraints.map((c) => `• ${c}`).join('\n')}\n\nDeliverables:\n${prob.deliverables.map((d) => `• ${d}`).join('\n')}`;

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

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'hard':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  // State 1: Loading
  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center container text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 animate-pulse">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Validating QR Access Key...</h2>
        <p className="text-sm text-foreground/60">Connecting to AI Agent Challenge secure portal</p>
      </div>
    );
  }

  // State 2: Unreleased or Invalid Access Key -> Locked Screen
  if (!released || !problem) {
    return (
      <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
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
          <motion.div variants={itemVariants} className="flex justify-start">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Home
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(239,68,68,0.25)] relative">
              <Lock className="w-12 h-12 text-red-400 animate-bounce" />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-extrabold uppercase tracking-widest text-red-300 whitespace-nowrap">
              LOCKED & SEALED
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 animate-pulse" /> Official Release Window
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
              Problem Statement <span className="text-red-400">Not Released Yet</span>
            </h1>

            <div className="glass-card p-6 sm:p-8 space-y-4 border-l-4 border-amber-500 max-w-2xl mx-auto text-left">
              <p className="text-base sm:text-lg text-foreground/90 font-medium leading-relaxed">
                This problem statement has not yet been released by the organizers. Please wait for the official announcement.
              </p>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Each QR code is permanently assigned to a specific problem statement. Once the organizers release this statement, rescanning or refreshing will instantly grant access.
              </p>
              <p className="text-xs text-amber-300/90 font-mono bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                💡 Tip: Click the <strong>Refresh Release Status</strong> button below to check if your problem statement has been unlocked.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchProblemStatus(activeToken)}
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

  // State 3: Released -> Isolated 1-to-1 Problem Statement View
  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden print:pt-4 print:pb-4 print:bg-white print:text-black">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden print:hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container max-w-4xl space-y-8"
      >
        {/* Navigation & Actions Header */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCopyProblemText(problem)}
              className="btn-secondary py-2 px-3 text-xs font-bold inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>

            <button
              onClick={handlePrintPDF}
              className="btn-primary py-2 px-3 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Save / Print PDF
            </button>
          </div>
        </motion.div>

        {/* Main Problem Banner */}
        <motion.div variants={itemVariants} className="glass-card p-6 sm:p-10 space-y-6 glow-border border-l-8 border-l-cyan-400 relative">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> {problem.category}
            </span>

            <span className={`px-3 py-1 rounded-full border text-xs font-extrabold uppercase tracking-wider ${getDifficultyBadge(problem.difficulty)}`}>
              {problem.difficulty} Difficulty
            </span>

            <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 ml-auto">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" /> OFFICIAL RELEASED STATEMENT
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {problem.title}
          </h1>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-sm text-foreground/80">
            <p className="font-semibold text-white">Challenge Description:</p>
            <p className="leading-relaxed">{problem.description}</p>
          </div>
        </motion.div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Objectives */}
          {problem.objectives && problem.objectives.length > 0 && (
            <motion.div variants={itemVariants} className="glass-card p-6 space-y-4 border-l-4 border-l-cyan-400">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" /> Key Objectives
              </h3>
              <ul className="space-y-3">
                {problem.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Technical Requirements */}
          {problem.requirements && problem.requirements.length > 0 && (
            <motion.div variants={itemVariants} className="glass-card p-6 space-y-4 border-l-4 border-l-purple-500">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" /> Requirements
              </h3>
              <ul className="space-y-3">
                {problem.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Constraints */}
          {problem.constraints && problem.constraints.length > 0 && (
            <motion.div variants={itemVariants} className="glass-card p-6 space-y-4 border-l-4 border-l-amber-500">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Constraints
              </h3>
              <ul className="space-y-3">
                {problem.constraints.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Expected Deliverables */}
          {problem.deliverables && problem.deliverables.length > 0 && (
            <motion.div variants={itemVariants} className="glass-card p-6 space-y-4 border-l-4 border-l-green-500">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-green-400" /> Expected Deliverables
              </h3>
              <ul className="space-y-3">
                {problem.deliverables.map((del, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span>{del}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <motion.div variants={itemVariants} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-foreground/60 space-y-1">
          <p className="font-semibold text-foreground/80">AI Agent Challenge 2026 — Isolated Challenge Portal</p>
          <p>This problem statement is assigned strictly to this QR code session. Ensure your submission meets all deliverables and requirements listed above.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
