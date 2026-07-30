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
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProblemStatementPage() {
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);

  const problemUrl = typeof window !== 'undefined' ? `${window.location.origin}/problem-statement` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(problemUrl);
    setCopied(true);
    toast.success('Problem statement URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
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

  const objectives = [
    'Understand user queries using Artificial Intelligence.',
    'Provide accurate, relevant, and meaningful responses.',
    'Maintain a clean, intuitive, and responsive user interface.',
    'Demonstrate practical and efficient AI integration.',
    'Present a working, end-to-end functional prototype.',
  ];

  const deliverables = [
    { title: 'Functional Application', icon: Laptop, desc: 'A working frontend/backend prototype ready for evaluation.' },
    { title: 'Source Code', icon: Code2, desc: 'Clean, well-structured codebase with setup instructions.' },
    { title: 'AI Integration', icon: Sparkles, desc: 'Effective integration of LLMs, NLP models, or intelligent agents.' },
    { title: 'Live Demonstration', icon: Presentation, desc: 'A live demo showcasing core features to the judges.' },
    { title: 'Project Explanation', icon: PackageCheck, desc: 'A concise summary explaining architecture and approach.' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Background Decorative Glow */}
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

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-white/5 border border-primary/20 hover:border-cyan-400 text-xs font-semibold text-foreground/80 hover:text-white inline-flex items-center gap-2 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              Official Track 2026
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
            Review the challenge specifications, project objectives, and evaluation deliverables below.
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
                  Build an AI-Powered Smart Campus Assistant
                </h2>
              </div>
            </div>

            <p className="text-base sm:text-lg text-foreground/90 leading-relaxed pt-3 border-t border-white/10">
              Design and develop an intelligent AI-powered assistant that helps students and faculty by answering queries related to academics, departments, campus facilities, event schedules, placements, and general college information.
            </p>
            <p className="text-sm sm:text-base text-foreground/70 leading-relaxed">
              Your solution should demonstrate the use of Artificial Intelligence to solve real-world problems while providing an intuitive and user-friendly experience.
            </p>
          </div>

          {/* Objectives Grid */}
          <div className="space-y-4 pt-6 border-t border-white/10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" /> Key Objectives
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objectives.map((obj, i) => (
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

          {/* Deliverables Section */}
          <div className="space-y-4 pt-6 border-t border-white/10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-purple-400" /> Project Deliverables
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliverables.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition-all space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-base">{item.title}</h4>
                    <p className="text-xs text-foreground/70 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons & Guidance Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 space-y-4 border-l-4 border-cyan-400 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" /> Event Rules & Judging Criteria
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
                <HelpCircle className="w-5 h-5 text-purple-400" /> Timeline & Schedule
              </h3>
              <p className="text-sm text-foreground/70">
                Check check-in times, competition start hours, submission deadlines, and demo slots.
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
