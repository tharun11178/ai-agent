import { motion } from 'framer-motion';
import { Lock, CheckCircle, Clock, AlertTriangle, ArrowRight, Copy, Check, RefreshCw } from 'lucide-react';
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
  released: boolean;
  releasedAt?: string;
  createdAt?: string;
}

export default function ProblemStatementPage() {
  const [, navigate] = useLocation();
  const [problemData, setProblemData] = useState<{
    released: boolean;
    releasedAt?: string;
    problems?: ProblemStatement[];
    message?: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const previousReleasedRef = useRef<boolean | null>(null);

  const fetchProblemStatus = async () => {
    try {
      const res = await apiFetch('/api/problem-statement');
      const data = await res.json();
      setProblemData(data);

      // Toast notification if organizers release problems live!
      if (previousReleasedRef.current === false && data.released === true) {
        toast.success('🎉 Problem Statements have been released by organizers!');
      }
      previousReleasedRef.current = Boolean(data.released);
    } catch {
      setProblemData({
        released: false,
        message: '🔒 Problem Statement Locked. Please wait for the organizers to release the problem statement.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblemStatus();

    // 5-second polling interval for real-time automatic release detection without page refresh
    const interval = setInterval(() => {
      fetchProblemStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleCopyText = (text: string, id: string) => {
    if (!problemData?.released) {
      toast.error('Cannot copy locked problem details.');
      return;
    }
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Problem statement details copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-8"
        >
          <motion.div variants={itemVariants} className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Problem <span className="gradient-text">Statements</span>
            </h1>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Official challenge details, track descriptions, and technical specifications for the AI Agent Challenge.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content Section */}
      <section className="py-12 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          {loading ? (
            <div className="glass-card p-12 text-center text-foreground/60 flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              <span>Checking problem statement release status...</span>
            </div>
          ) : problemData && !problemData.released ? (
            /* LOCKED STATE */
            <div className="space-y-8 max-w-4xl mx-auto">
              <motion.div
                variants={itemVariants}
                className="glass-card p-10 border-l-4 border-amber-500 space-y-6 text-center glow-border"
              >
                <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto border border-amber-500/40">
                  <Lock className="w-10 h-10 text-amber-400" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-amber-400">🔒 Problem Statement Locked</h2>
                  <p className="text-xl font-semibold text-foreground/90">
                    {problemData.message || 'Please wait for the organizers to release the problem statement.'}
                  </p>
                  <p className="text-sm text-foreground/60 max-w-md mx-auto">
                    This page automatically updates in real-time as soon as the problem statements are released by event organizers.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-full text-xs font-semibold text-amber-300">
                  <Clock className="w-4 h-4 animate-pulse" /> Auto-checking release status every 5 seconds...
                </div>
              </motion.div>

              {/* Guidelines Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 space-y-3 border-l-4 border-primary">
                  <div className="flex items-center gap-3 text-primary font-bold text-lg">
                    <AlertTriangle className="w-5 h-5" /> Early Access Rule
                  </div>
                  <p className="text-sm text-foreground/80">
                    Pre-release development or attempting to bypass locks is strictly prohibited and results in immediate team disqualification.
                  </p>
                </div>

                <div className="glass-card p-6 space-y-3 border-l-4 border-secondary">
                  <div className="flex items-center gap-3 text-secondary font-bold text-lg">
                    <Clock className="w-5 h-5" /> Live Briefing Q&A
                  </div>
                  <p className="text-sm text-foreground/80">
                    A Q&A clarification window opens immediately following the live release of problem statements.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center pt-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Return to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          ) : problemData?.released && problemData.problems ? (
            /* RELEASED STATE */
            <div className="space-y-8">
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold">Official Problem Statements</h2>
                  <p className="text-foreground/70">Select your problem statement and begin development.</p>
                </div>
                <span className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full font-bold text-sm border border-green-500/40 w-fit">
                  <CheckCircle className="w-4 h-4" /> Released & Active
                </span>
              </motion.div>

              <div className="grid grid-cols-1 gap-8">
                {problemData.problems.map((prob) => (
                  <motion.div
                    key={prob.id}
                    variants={itemVariants}
                    className="glass-card p-8 space-y-6 border-l-4 border-secondary hover:border-primary transition-colors glow-border"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-4">
                      <div>
                        <span className="text-xs bg-secondary/20 text-secondary px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                          {prob.track}
                        </span>
                        <h3 className="text-2xl font-bold mt-2">{prob.title}</h3>
                      </div>

                      <button
                        onClick={() => handleCopyText(`${prob.title}\n\n${prob.description}`, prob.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors w-fit"
                      >
                        {copiedId === prob.id ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-primary" /> Copy Details
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-4 text-foreground/90 leading-relaxed">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
                        Problem Overview & Description
                      </h4>
                      <p className="text-base whitespace-pre-line">{prob.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-foreground/60">
              Fetching problem statement status...
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
