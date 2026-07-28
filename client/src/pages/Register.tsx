import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Lock, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSection } from '@/components/QRCodeSection';
import { apiFetch } from '@/lib/api';

interface RegStatus {
  open: boolean;
  isFull: boolean;
  maxTeams: number;
  registeredTeams: number;
  availableSlots: number;
  message?: string;
}

export default function Register() {
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    leaderEmail: '',
    phone: '',
    college: '',
    department: '',
    year: '',
    member2: '',
  });

  const [regStatus, setRegStatus] = useState<RegStatus | null>({
    open: true,
    isFull: false,
    maxTeams: 40,
    registeredTeams: 0,
    availableSlots: 40,
  });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Field level inline validation warnings
  const [fieldErrors, setFieldErrors] = useState<{
    teamName?: string;
    leaderEmail?: string;
    phone?: string;
  }>({});

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Fetch registration open status & team capacity on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await apiFetch('/api/register/status');
      const data = await res.json();
      if (data.success) {
        setRegStatus(data);
      } else {
        setRegStatus({ open: true, isFull: false, maxTeams: 40, registeredTeams: 0, availableSlots: 40 });
      }
    } catch {
      setRegStatus({ open: true, isFull: false, maxTeams: 40, registeredTeams: 0, availableSlots: 40 });
    } finally {
      setLoadingStatus(false);
    }
  };

  // Check duplicate real-time on field blur
  const handleBlur = async (field: 'teamName' | 'leaderEmail' | 'phone') => {
    const val = formData[field]?.trim();
    if (!val) return;

    try {
      const res = await apiFetch('/api/register/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: val }),
      });
      const data = await res.json();

      if (data.success) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          if (field === 'teamName' && data.duplicateTeam) {
            next.teamName = 'Team name is already taken.';
          } else if (field === 'teamName') {
            delete next.teamName;
          }

          if (field === 'leaderEmail' && data.duplicateEmail) {
            next.leaderEmail = 'A team with this leader email address is already registered.';
          } else if (field === 'leaderEmail') {
            delete next.leaderEmail;
          }

          if (field === 'phone' && data.duplicatePhone) {
            next.phone = 'A team with this phone number is already registered.';
          } else if (field === 'phone') {
            delete next.phone;
          }

          return next;
        });
      }
    } catch {
      // Ignore background check error
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear inline error on typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.teamName || !formData.leaderName || !formData.leaderEmail || !formData.phone || !formData.college) {
      const msg = 'Please fill in all required fields (Team Name, Leader Name, Email, Phone, College).';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (Object.values(fieldErrors).some(Boolean)) {
      const msg = 'Please fix duplicate field errors before submitting.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiFetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        toast.success('Registration successful! Your team is registered.');
        fetchStatus();
      } else {
        const errorMessage = data.error || 'Registration failed. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
        if (data.isClosed) {
          fetchStatus();
        }
      }
    } catch (err) {
      const connErr = 'Failed to connect to the server. Please check your network connection.';
      setError(connErr);
      toast.error(connErr);
    } finally {
      setSubmitting(false);
    }
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
              Register Your <span className="gradient-text">Team</span>
            </h1>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Join the AI Agent Challenge (1–2 participants per team). Solo participants and pairs are welcome.
            </p>

            {regStatus && regStatus.open && (
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm font-semibold text-primary">
                <Users className="w-4 h-4 text-secondary" />
                <span>
                  Available Slots: <strong className="text-secondary">{regStatus.availableSlots}</strong> / {regStatus.maxTeams} Teams
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Main Registration Content / Closed state */}
      <section className="py-16 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container max-w-2xl"
        >
          {loadingStatus ? (
            <div className="glass-card p-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <p className="text-foreground/70 font-medium">Checking registration capacity & status...</p>
            </div>
          ) : regStatus && !regStatus.open && !submitted ? (
            /* REGISTRATION CLOSED STATE */
            <motion.div variants={itemVariants} className="glass-card p-10 md:p-14 text-center space-y-6 glow-border border-purple-500/40">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto border border-purple-500/40">
                <Lock className="w-10 h-10 text-purple-400" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-purple-300">Registration Closed</h2>
                <p className="text-xl font-semibold text-foreground/90">
                  Maximum number of teams has been reached.
                </p>
                <p className="text-base text-foreground/70 max-w-md mx-auto leading-relaxed">
                  {regStatus.message || 'Thank you for your interest! Capacity for the AI Agent Challenge has been filled.'}
                </p>
              </div>

              <div className="pt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-primary/20 text-xs text-foreground/60 font-mono">
                Total Registrations: {regStatus.registeredTeams} / {regStatus.maxTeams} Teams
              </div>
            </motion.div>
          ) : submitted ? (
            /* SUCCESS STATE */
            <motion.div variants={itemVariants} className="glass-card p-12 text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-accent" />
              </div>
              <h2 className="text-3xl font-bold">Registration Successful!</h2>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Your team has been registered successfully. Check your email for confirmation and event instructions.
              </p>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm text-foreground/70">
                You will receive an email with event confirmation and schedule details.
              </div>
            </motion.div>
          ) : (
            /* FORM STATE */
            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="glass-card p-8 space-y-6 glow-border">
              {error && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Team Information */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Team Information</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">Team Name *</label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('teamName')}
                    placeholder="Enter your unique team name"
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      fieldErrors.teamName ? 'border-red-500/80 focus:border-red-500' : 'border-primary/20 focus:border-primary/50'
                    } focus:outline-none transition-colors`}
                    required
                  />
                  {fieldErrors.teamName && (
                    <p className="text-xs text-red-400 mt-1 font-medium">{fieldErrors.teamName}</p>
                  )}
                </div>
              </div>

              {/* Team Lead Information */}
              <div className="space-y-4 border-t border-primary/10 pt-6">
                <h3 className="text-2xl font-bold">Team Lead / Primary Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Leader Name *</label>
                    <input
                      type="text"
                      name="leaderName"
                      value={formData.leaderName}
                      onChange={handleChange}
                      placeholder="Full name"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-primary/20 focus:border-primary/50 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="leaderEmail"
                      value={formData.leaderEmail}
                      onChange={handleChange}
                      onBlur={() => handleBlur('leaderEmail')}
                      placeholder="email@college.edu"
                      className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                        fieldErrors.leaderEmail ? 'border-red-500/80 focus:border-red-500' : 'border-primary/20 focus:border-primary/50'
                      } focus:outline-none transition-colors`}
                      required
                    />
                    {fieldErrors.leaderEmail && (
                      <p className="text-xs text-red-400 mt-1 font-medium">{fieldErrors.leaderEmail}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => handleBlur('phone')}
                      placeholder="+91 XXXXX XXXXX"
                      className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                        fieldErrors.phone ? 'border-red-500/80 focus:border-red-500' : 'border-primary/20 focus:border-primary/50'
                      } focus:outline-none transition-colors`}
                      required
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-red-400 mt-1 font-medium">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">College *</label>
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="College name"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-primary/20 focus:border-primary/50 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-primary/20 focus:border-primary/50 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Year</label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-primary/20 focus:border-primary/50 focus:outline-none transition-colors text-foreground"
                    >
                      <option value="" className="bg-background text-foreground">Select year</option>
                      <option value="1st" className="bg-background text-foreground">1st Year</option>
                      <option value="2nd" className="bg-background text-foreground">2nd Year</option>
                      <option value="3rd" className="bg-background text-foreground">3rd Year</option>
                      <option value="4th" className="bg-background text-foreground">4th Year</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Second Team Member (Optional) */}
              <div className="space-y-4 border-t border-primary/10 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Second Team Member</h3>
                  <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
                    Optional (Solo Allowed)
                  </span>
                </div>
                <p className="text-xs text-foreground/60">
                  Teams are 1–2 participants. Leave blank if competing individually.
                </p>

                <div>
                  <label className="block text-sm font-medium mb-2">Member 2 Full Name</label>
                  <input
                    type="text"
                    name="member2"
                    value={formData.member2}
                    onChange={handleChange}
                    placeholder="Member 2 full name (leave empty if solo)"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-primary/20 focus:border-primary/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="border-t border-primary/10 pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="terms" required className="mt-1 accent-primary" />
                  <label htmlFor="terms" className="text-sm text-foreground/80">
                    I agree to the competition rules and terms & conditions
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Registering Team...</span>
                  </>
                ) : (
                  'Register Team'
                )}
              </motion.button>
            </motion.form>
          )}
        </motion.div>
      </section>

      {/* QR Code Section */}
      <QRCodeSection />
    </div>
  );
}
