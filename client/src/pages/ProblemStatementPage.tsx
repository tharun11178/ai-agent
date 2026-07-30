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
  Search,
  BookOpen,
  Tag,
  Layers,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

interface ProblemData {
  id: string;
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
  const [loading, setLoading] = useState(true);
  const [released, setReleased] = useState(false);
  const [problems, setProblems] = useState<ProblemData[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<ProblemData | null>(null);
  const [copied, setCopied] = useState(false);

  // Search & Category Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchProblemStatus();
  }, []);

  const fetchProblemStatus = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/problem-statement');
      const data = await res.json();
      if (data.success && data.released && data.problems && data.problems.length > 0) {
        setReleased(true);
        setProblems(data.problems);
        // If exactly 1 problem released, auto-select it
        if (data.problems.length === 1) {
          setSelectedProblem(data.problems[0]);
        } else {
          setSelectedProblem(null);
        }
      } else {
        setReleased(false);
        setProblems([]);
        setSelectedProblem(null);
      }
    } catch {
      setReleased(false);
      setProblems([]);
      setSelectedProblem(null);
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

  // Helper for Difficulty Badges
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
        <h2 className="text-xl font-bold text-white">Checking Release Status...</h2>
        <p className="text-sm text-foreground/60">Connecting to AI Agent Challenge server</p>
      </div>
    );
  }

  // State 2: 0 Problems Released -> Waiting Screen
  if (!released || problems.length === 0) {
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
              Problem Statements <span className="text-red-400">Not Released Yet</span>
            </h1>

            <div className="glass-card p-6 sm:p-8 space-y-4 border-l-4 border-amber-500 max-w-2xl mx-auto text-left">
              <p className="text-base sm:text-lg text-foreground/90 font-medium leading-relaxed">
                The problem statements have not been released by the event organizers.
              </p>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Please wait until the official inauguration and commencement announcement.
              </p>
              <p className="text-xs text-amber-300/90 font-mono bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                💡 Tip: Once announced, click the <strong>Refresh Release Status</strong> button below or scan the QR code again to reveal the live challenge statements.
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

  // Filter problems by search & category
  const categories = ['All', ...Array.from(new Set(problems.map((p) => p.category)))];
  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // State 3A: Multiple Released Problems -> Multi-Problem Statement Hub
  if (!selectedProblem && problems.length > 1) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-10 max-w-6xl"
        >
          {/* Header Navigation */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors w-fit"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Home
            </button>

            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-400/40 text-green-300 text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 w-fit">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" /> {problems.length} OFFICIAL PROBLEMS LIVE
            </span>
          </motion.div>

          {/* Hero Title Section */}
          <motion.div variants={itemVariants} className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-cyan-300 text-xs font-extrabold uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" /> AI AGENT CHALLENGE 2026
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Official <span className="gradient-text">Problem Statement Hub</span>
            </h1>
            <p className="text-lg text-foreground/80 leading-relaxed">
              Select any of the official challenge statements below to view detailed objectives, requirements, and deliverables.
            </p>
          </motion.div>

          {/* Search & Category Filter */}
          <motion.div variants={itemVariants} className="glass-card p-6 space-y-4 glow-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-foreground/50" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search problem statements..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-sm focus:outline-none"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg'
                        : 'bg-white/5 text-foreground/70 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Problem Cards Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.length === 0 ? (
              <div className="col-span-full glass-card p-12 text-center text-foreground/60 space-y-2">
                <BookOpen className="w-8 h-8 text-cyan-400 mx-auto opacity-50" />
                <p className="text-base font-bold">No problem statements match search filters.</p>
              </div>
            ) : (
              filteredProblems.map((prob) => (
                <motion.div
                  key={prob.id}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => setSelectedProblem(prob)}
                  className="glass-card p-6 space-y-5 border border-cyan-500/20 hover:border-cyan-400 cursor-pointer flex flex-col justify-between group transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
                        {prob.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getDifficultyBadge(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                      {prob.title}
                    </h3>

                    <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3">
                      {prob.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View Problem Statement <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] text-foreground/50 font-mono">
                      {prob.deliverables.length} Deliverables
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // State 3B: Single Released Problem or Selected Problem Detail View
  const targetProb = selectedProblem || problems[0];

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
          {problems.length > 1 ? (
            <button
              onClick={() => setSelectedProblem(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors w-fit"
            >
              <ChevronLeft className="w-4 h-4" /> ← Back to All Problem Statements
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors w-fit"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Home
            </button>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCopyProblemText(targetProb)}
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
        </motion.div>

        {/* Main Problem Statement Card */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-8 md:p-12 space-y-8 border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

          {/* Title Badge & Tags */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 text-xs font-extrabold uppercase">
                {targetProb.category}
              </span>
              <span className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase border ${getDifficultyBadge(targetProb.difficulty)}`}>
                Difficulty: {targetProb.difficulty}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 mt-1">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {targetProb.title}
              </h2>
            </div>

            <p className="text-base sm:text-lg text-foreground/90 leading-relaxed pt-3 border-t border-white/10">
              {targetProb.description}
            </p>
          </div>

          {/* Objectives Grid */}
          {targetProb.objectives && targetProb.objectives.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" /> Key Objectives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {targetProb.objectives.map((obj, i) => (
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

          {/* Requirements Section */}
          {targetProb.requirements && targetProb.requirements.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-secondary" /> Technical & Functional Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {targetProb.requirements.map((req, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-secondary/40 text-sm text-foreground/90 flex items-start gap-3">
                    <span className="text-secondary font-bold">•</span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints Section */}
          {targetProb.constraints && targetProb.constraints.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Development Constraints & Guidelines
              </h3>
              <div className="space-y-2">
                {targetProb.constraints.map((con, i) => (
                  <div key={i} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200/90 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables Section */}
          {targetProb.deliverables && targetProb.deliverables.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-purple-400" /> Required Deliverables
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {targetProb.deliverables.map((item, i) => (
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

        {/* Navigation Guidance Cards */}
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
