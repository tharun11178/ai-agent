import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Shield,
  Users,
  BarChart3,
  ToggleLeft,
  ToggleRight,
  LogOut,
  Search,
  Download,
  Trash2,
  Eye,
  Activity,
  Settings,
  RefreshCw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lock,
  Unlock,
  PlusCircle,
  Edit,
  Sparkles,
  Target,
  AlertTriangle,
  PackageCheck,
  CheckCircle2,
  Copy,
  Layers,
  QrCode,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

interface Registration {
  id: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  phone: string;
  college: string;
  department?: string;
  year?: string;
  member2?: string;
  createdAt: string;
}

interface Analytics {
  totalTeams: number;
  registeredTeams: number;
  maxTeams: number;
  availableSlots: number;
  registrationOpen: boolean;
  totalParticipants: number;
  collegesRepresented: number;
  problemsReleased: boolean;
  totalProblems: number;
  releasedCount: number;
  draftCount: number;
  hiddenCount: number;
  lastRegistration: string | null;
}

interface ProblemStatement {
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
  status: 'Draft' | 'Released' | 'Hidden' | string;
  accessToken?: string;
  qrCode?: string;
  scanCount?: number;
  firstScannedAt?: string | null;
  lastScannedAt?: string | null;
  releasedAt?: string | null;
  assignedTeamIds?: string[];
  updatedAt: string;
  createdAt: string;
}

interface LogEntry {
  id: string;
  adminUser: string;
  action: string;
  details: string;
  createdAt: string;
}

export default function ControlCenter() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('admin_jwt_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'analytics' | 'registrations' | 'problems' | 'controls' | 'logs'>('analytics');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [problems, setProblems] = useState<ProblemStatement[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Pagination for Registrations Table
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Team Details Modal & Delete Confirmation
  const [selectedTeam, setSelectedTeam] = useState<Registration | null>(null);
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);

  // Problem Form State
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [probTitle, setProbTitle] = useState('');
  const [probCategory, setProbCategory] = useState('AI Agents');
  const [probDifficulty, setProbDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [probStatus, setProbStatus] = useState<'Draft' | 'Released' | 'Hidden'>('Draft');
  const [probDesc, setProbDesc] = useState('');
  const [probObjectives, setProbObjectives] = useState('');
  const [probRequirements, setProbRequirements] = useState('');
  const [probConstraints, setProbConstraints] = useState('');
  const [probDeliverables, setProbDeliverables] = useState('');
  const [savingProblem, setSavingProblem] = useState(false);
  const [previewProblem, setPreviewProblem] = useState<ProblemStatement | null>(null);

  // Event Config Form
  const [configMaxTeams, setConfigMaxTeams] = useState<number>(100);
  const [updatingConfig, setUpdatingConfig] = useState(false);

  // Problem Table Filters, Pagination, Selection, & QR Modal State
  const [problemSearch, setProblemSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Released' | 'Hidden'>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [problemPage, setProblemPage] = useState(1);
  const problemItemsPerPage = 10;
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [qrModalProblem, setQrModalProblem] = useState<ProblemStatement | null>(null);
  const [qrCopied, setQrCopied] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  useEffect(() => {
    if (token) {
      fetchAdminData(token);
    }
  }, [token]);

  const fetchAdminData = async (authToken: string) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      const [regRes, anaRes, probRes, logRes] = await Promise.all([
        apiFetch('/api/admin/registrations', { headers }),
        apiFetch('/api/admin/analytics', { headers }),
        apiFetch('/api/admin/problems', { headers }),
        apiFetch('/api/admin/logs', { headers }),
      ]);

      if (regRes.status === 403 || anaRes.status === 403 || probRes.status === 403) {
        handleLogout();
        toast.error('403 Forbidden: Admin session expired or invalid. Please log in again.');
        return;
      }

      const regData = await regRes.json();
      const anaData = await anaRes.json();
      const probData = await probRes.json();
      const logData = await logRes.json();

      if (regData.success) setRegistrations(regData.registrations);
      if (anaData.success) {
        setAnalytics(anaData.analytics);
        setConfigMaxTeams(anaData.analytics.maxTeams || 40);
      }
      if (probData.success) {
        setProblems(probData.problems);
      }
      if (logData.success) setLogs(logData.logs);
    } catch {
      toast.error('Failed to connect to admin API server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password.');
      return;
    }

    setLoggingIn(true);

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        sessionStorage.setItem('admin_jwt_token', data.token);
        setToken(data.token);
        toast.success(`Welcome back, ${data.user?.username || 'Admin'}!`);
      } else {
        toast.error(data.error || 'Authentication failed.');
      }
    } catch {
      toast.error('Server error during login.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('admin_jwt_token');
    setToken(null);
    toast.info('Logged out from admin panel.');
  };

  // Change Specific Problem Status (Draft / Released / Hidden)
  const handleUpdateProblemStatus = async (id: string, newStatus: 'Draft' | 'Released' | 'Hidden') => {
    if (!token) return;
    try {
      const response = await apiFetch(`/api/admin/problems/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Problem status updated to ${newStatus}!`);
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Failed to update problem status.');
      }
    } catch {
      toast.error('Failed to communicate with server.');
    }
  };

  // Batch Status Change (Release Selected, Release All, Hide Selected, Hide All)
  const handleBatchStatusChange = async (ids: string[] | 'all', newStatus: 'Draft' | 'Released' | 'Hidden') => {
    if (!token) return;
    try {
      const response = await apiFetch('/api/admin/problems/batch-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids, status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || `Bulk status updated to ${newStatus}!`);
        setSelectedProblemIds([]);
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Failed to update batch status.');
      }
    } catch {
      toast.error('Failed to communicate with server for bulk update.');
    }
  };

  // Download QR Code image as PNG
  const handleDownloadQRImage = (prob: ProblemStatement) => {
    const svgElement = document.getElementById(`qr-svg-${prob.id}`);
    if (!svgElement) {
      toast.error('QR element not ready.');
      return;
    }

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
      downloadLink.download = `AI_Agent_Challenge_Problem_${prob.id}_QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success(`Downloaded QR Code PNG for Problem ${prob.id}!`);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Regenerate Secure Access Token for Problem Statement
  const handleRegenerateToken = async (id: string) => {
    if (!token) return;
    try {
      const response = await apiFetch(`/api/admin/problems/${id}/regenerate-token`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 'Token regenerated successfully!');
        if (qrModalProblem && qrModalProblem.id === id) {
          setQrModalProblem({
            ...qrModalProblem,
            qrCode: data.qrCode,
          });
        }
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Failed to regenerate token.');
      }
    } catch {
      toast.error('Server error regenerating token.');
    }
  };

  // Duplicate Problem Statement
  const handleDuplicateProblem = async (id: string) => {
    if (!token) return;
    try {
      const response = await apiFetch(`/api/admin/problems/${id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 'Problem duplicated successfully!');
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Failed to duplicate problem.');
      }
    } catch {
      toast.error('Server error duplicating problem.');
    }
  };

  // Save / Update Problem Statement Form
  const handleSaveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!probTitle || !probDesc) {
      toast.error('Title and description are required.');
      return;
    }

    setSavingProblem(true);
    try {
      const response = await apiFetch('/api/admin/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingProblemId,
          title: probTitle,
          category: probCategory || 'AI Agents',
          difficulty: probDifficulty,
          status: probStatus,
          description: probDesc,
          objectives: probObjectives.split('\n').map((s) => s.trim()).filter(Boolean),
          requirements: probRequirements.split('\n').map((s) => s.trim()).filter(Boolean),
          constraints: probConstraints.split('\n').map((s) => s.trim()).filter(Boolean),
          deliverables: probDeliverables.split('\n').map((s) => s.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingProblemId ? 'Problem statement updated!' : 'New problem draft created!');
        handleClearProblemForm();
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Failed to save problem statement.');
      }
    } catch {
      toast.error('Server error while saving problem statement.');
    } finally {
      setSavingProblem(false);
    }
  };

  const handleClearProblemForm = () => {
    setEditingProblemId(null);
    setProbTitle('');
    setProbCategory('AI Agents');
    setProbDifficulty('Medium');
    setProbStatus('Draft');
    setProbDesc('');
    setProbObjectives('');
    setProbRequirements('');
    setProbConstraints('');
    setProbDeliverables('');
  };

  const handleLoadProblemToEdit = (prob: ProblemStatement) => {
    setEditingProblemId(prob.id);
    setProbTitle(prob.title);
    setProbCategory(prob.category || 'AI Agents');
    setProbDifficulty((prob.difficulty as any) || 'Medium');
    setProbStatus((prob.status as any) || 'Draft');
    setProbDesc(prob.description);
    setProbObjectives(Array.isArray(prob.objectives) ? prob.objectives.join('\n') : '');
    setProbRequirements(Array.isArray(prob.requirements) ? prob.requirements.join('\n') : '');
    setProbConstraints(Array.isArray(prob.constraints) ? prob.constraints.join('\n') : '');
    setProbDeliverables(Array.isArray(prob.deliverables) ? prob.deliverables.join('\n') : '');
  };

  // Delete Problem Statement
  const handleDeleteProblem = async (id: string) => {
    if (!token) return;
    try {
      const res = await apiFetch(`/api/admin/problems/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Problem statement deleted.');
        if (editingProblemId === id) handleClearProblemForm();
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Delete failed.');
      }
    } catch {
      toast.error('Server error while deleting problem.');
    }
  };

  // Delete Team Registration
  const handleDeleteTeam = async (id: string) => {
    if (!token) return;
    try {
      const res = await apiFetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Team registration deleted.');
        setDeleteTeamId(null);
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Delete failed.');
      }
    } catch {
      toast.error('Server error while deleting team.');
    }
  };

  // Update Event Config
  const handleUpdateConfig = async (key: string, value: any) => {
    if (!token) return;
    setUpdatingConfig(true);
    try {
      const res = await apiFetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: value }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Event configuration updated successfully!');
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Failed to update config.');
      }
    } catch {
      toast.error('Server error while updating config.');
    } finally {
      setUpdatingConfig(false);
    }
  };

  // Export CSV function
  const handleExportCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast.error('No registration data available to export.');
      return;
    }

    const headers = ['ID', 'Team Name', 'Leader Name', 'Leader Email', 'Phone', 'College', 'Department', 'Year', 'Member 2', 'Registered At'];
    const rows = registrations.map((r: Registration) => [
      r.id,
      `"${r.teamName.replace(/"/g, '""')}"`,
      `"${r.leaderName.replace(/"/g, '""')}"`,
      `"${r.leaderEmail.replace(/"/g, '""')}"`,
      `"${r.phone.replace(/"/g, '""')}"`,
      `"${r.college.replace(/"/g, '""')}"`,
      `"${(r.department || '').replace(/"/g, '""')}"`,
      `"${(r.year || '').replace(/"/g, '""')}"`,
      `"${(r.member2 || '').replace(/"/g, '""')}"`,
      `"${r.createdAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: string[]) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-agent-challenge-teams-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success('CSV export generated successfully!');
  };

  // Search & Pagination Logic for Registrations
  const filteredRegistrations = registrations.filter(
    (reg: Registration) =>
      reg.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.leaderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.college.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage) || 1;
  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Search, Filter, & Pagination Logic for Problems Table
  const filteredProblemsList = problems.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(problemSearch.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    return matchesSearch && matchesStatus && matchesDifficulty;
  });

  const totalProblemPages = Math.ceil(filteredProblemsList.length / problemItemsPerPage) || 1;
  const paginatedProblemsList = filteredProblemsList.slice(
    (problemPage - 1) * problemItemsPerPage,
    problemPage * problemItemsPerPage
  );

  const isAllOnPageSelected =
    paginatedProblemsList.length > 0 &&
    paginatedProblemsList.every((p) => selectedProblemIds.includes(p.id));

  const toggleSelectAllOnPage = () => {
    if (isAllOnPageSelected) {
      const pageIds = paginatedProblemsList.map((p) => p.id);
      setSelectedProblemIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedProblemsList.map((p) => p.id);
      setSelectedProblemIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectProblem = (id: string) => {
    setSelectedProblemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (!token) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="glass-card p-8 md:p-10 space-y-6 glow-border">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto border border-primary/30">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Admin Portal</h1>
              <p className="text-sm text-foreground/60">
                Secure access for AI Agent Challenge Event Organizers
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Username / Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="aitheronmlsymposium@gmail.com"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-primary/20 focus:border-primary/50 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-primary/20 focus:border-primary/50 focus:outline-none transition-colors"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loggingIn}
                className="w-full btn-primary py-3 font-semibold flex items-center justify-center gap-2 mt-4"
              >
                {loggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                  </>
                ) : (
                  'Login to Control Center'
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  const releasedCount = analytics?.releasedCount || problems.filter((p) => p.status === 'Released').length;

  return (
    <div className="min-h-screen pt-20 pb-20">
      <section className="py-10 border-b border-primary/10 bg-primary/5">
        <div className="container flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> Event Control Center
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchAdminData(token)}
              className="btn-secondary py-2.5 px-4 text-xs font-medium inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </motion.button>
          </div>
        </div>
      </section>

      <section className="py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-8"
        >
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-primary/10 pb-4">
            {[
              { id: 'analytics', label: 'Analytics & Overview', icon: BarChart3 },
              { id: 'registrations', label: `Registrations (${registrations.length})`, icon: Users },
              { id: 'problems', label: `Problem Statements (${problems.length})`, icon: FileText },
              { id: 'controls', label: 'Event Controls', icon: Sliders },
              { id: 'logs', label: 'Activity Logs', icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center gap-2 transition-colors ${
                    isActive ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-foreground/70 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </motion.button>
              );
            })}
          </div>

          {/* TAB 1: ANALYTICS & OVERVIEW */}
          {activeTab === 'analytics' && analytics && (
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 space-y-2 border-l-4 border-primary">
                  <p className="text-sm font-medium text-foreground/60">Registered Teams</p>
                  <p className="text-4xl font-bold text-primary">{analytics.totalTeams}</p>
                  <p className="text-xs text-foreground/50">Capacity: {analytics.maxTeams} Teams</p>
                </div>

                <div className="glass-card p-6 space-y-2 border-l-4 border-secondary">
                  <p className="text-sm font-medium text-foreground/60">Available Slots</p>
                  <p className="text-4xl font-bold text-secondary">{analytics.availableSlots}</p>
                  <p className="text-xs text-foreground/50">
                    Status: {analytics.registrationOpen ? 'Registration Open' : 'Closed'}
                  </p>
                </div>

                <div className="glass-card p-6 space-y-2 border-l-4 border-accent">
                  <p className="text-sm font-medium text-foreground/60">Total Participants</p>
                  <p className="text-4xl font-bold text-accent">{analytics.totalParticipants}</p>
                  <p className="text-xs text-foreground/50">{analytics.collegesRepresented} Colleges Represented</p>
                </div>

                <div className={`glass-card p-6 space-y-2 border-l-4 ${releasedCount > 0 ? 'border-green-500' : 'border-red-500'}`}>
                  <p className="text-sm font-medium text-foreground/60">Released Problems</p>
                  <p className={`text-4xl font-bold ${releasedCount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {releasedCount} / {problems.length}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {releasedCount > 0 ? `🟢 ${releasedCount} Live Problem(s)` : '🔴 All Problems Locked'}
                  </p>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="glass-card p-8 space-y-6 glow-border">
                <h3 className="text-2xl font-bold">Quick Event Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('problems')}
                    className="p-4 rounded-xl font-semibold border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 flex items-center justify-between"
                  >
                    <span>Manage & Release Problems</span>
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpdateConfig('registrationOpen', !analytics.registrationOpen)}
                    className={`p-4 rounded-xl font-semibold border flex items-center justify-between ${
                      analytics.registrationOpen
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                        : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                    }`}
                  >
                    <span>{analytics.registrationOpen ? 'Close Registration' : 'Open Registration'}</span>
                    {analytics.registrationOpen ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportCSV}
                    className="p-4 rounded-xl font-semibold border border-secondary/30 bg-secondary/10 text-secondary hover:bg-secondary/20 flex items-center justify-between"
                  >
                    <span>Export Teams CSV</span>
                    <Download className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: TEAM REGISTRATIONS */}
          {activeTab === 'registrations' && (
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-foreground/50" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search teams, emails, colleges..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-sm focus:outline-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleExportCSV}
                  className="btn-primary py-2.5 px-5 text-sm font-semibold inline-flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </motion.button>
              </div>

              {/* Registrations Table */}
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-primary/10 text-foreground/70 uppercase text-xs">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Team Name</th>
                        <th className="py-3.5 px-4 font-semibold">Leader</th>
                        <th className="py-3.5 px-4 font-semibold">Email</th>
                        <th className="py-3.5 px-4 font-semibold">Phone</th>
                        <th className="py-3.5 px-4 font-semibold">College</th>
                        <th className="py-3.5 px-4 font-semibold">Member 2</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                      {paginatedRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-foreground/50">
                            No team registrations found matching search.
                          </td>
                        </tr>
                      ) : (
                        paginatedRegistrations.map((team: Registration) => (
                          <tr key={team.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-primary">{team.teamName}</td>
                            <td className="py-3.5 px-4 font-medium">{team.leaderName}</td>
                            <td className="py-3.5 px-4 text-foreground/80">{team.leaderEmail}</td>
                            <td className="py-3.5 px-4 font-mono text-xs">{team.phone}</td>
                            <td className="py-3.5 px-4 text-foreground/80">{team.college}</td>
                            <td className="py-3.5 px-4 text-foreground/70">{team.member2 || '— (Solo)'}</td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              <button
                                onClick={() => setSelectedTeam(team)}
                                className="p-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTeamId(team.id)}
                                className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                title="Delete Team"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-primary/10 flex items-center justify-between text-xs text-foreground/70">
                    <span>
                      Page {currentPage} of {totalPages} ({filteredRegistrations.length} teams)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                        className="p-1.5 rounded bg-white/10 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
                        className="p-1.5 rounded bg-white/10 disabled:opacity-30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: MULTI-PROBLEM STATEMENT MANAGEMENT SYSTEM */}
          {activeTab === 'problems' && (
              <motion.div variants={itemVariants} className="space-y-8">
                {/* Header Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div className="glass-card p-6 border-l-4 border-cyan-500 space-y-1">
                    <span className="text-xs font-semibold text-foreground/60">Total Problem Statements</span>
                    <p className="text-3xl font-bold text-cyan-300">{problems.length}</p>
                    <span className="text-[11px] text-foreground/50">11 QR Codes Configured</span>
                  </div>

                  <div className="glass-card p-6 border-l-4 border-green-500 space-y-1">
                    <span className="text-xs font-semibold text-foreground/60">Released Statements</span>
                    <p className="text-3xl font-bold text-green-400">
                      {problems.filter((p) => p.status === 'Released').length}
                    </p>
                    <span className="text-[11px] text-foreground/50">Live and accessible to participants</span>
                  </div>

                  <div className="glass-card p-6 border-l-4 border-amber-500 space-y-1">
                    <span className="text-xs font-semibold text-foreground/60">Draft Statements</span>
                    <p className="text-3xl font-bold text-amber-400">
                      {problems.filter((p) => p.status === 'Draft').length}
                    </p>
                    <span className="text-[11px] text-foreground/50">Saved in editor, locked</span>
                  </div>

                  <div className="glass-card p-6 border-l-4 border-purple-500 space-y-1">
                    <span className="text-xs font-semibold text-foreground/60">Total QR Scans</span>
                    <p className="text-3xl font-bold text-purple-300">
                      {problems.reduce((acc, p) => acc + (p.scanCount || 0), 0)}
                    </p>
                    <span className="text-[11px] text-foreground/50">Across all 11 QR codes</span>
                  </div>
                </div>

                {/* Bulk Actions & Search Filters Bar */}
                <div className="glass-card p-6 space-y-4 glow-border">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                      {/* Search */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-foreground/50" />
                        <input
                          type="text"
                          value={problemSearch}
                          onChange={(e) => {
                            setProblemSearch(e.target.value);
                            setProblemPage(1);
                          }}
                          placeholder="Search problem ID or title..."
                          className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-xs focus:outline-none"
                        />
                      </div>

                      {/* Status Filter */}
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value as any);
                          setProblemPage(1);
                        }}
                        className="px-3 py-2 rounded-xl bg-[#0F172A] border border-primary/20 text-xs font-semibold focus:outline-none"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Released">Released</option>
                        <option value="Hidden">Hidden</option>
                      </select>

                      {/* Difficulty Filter */}
                      <select
                        value={difficultyFilter}
                        onChange={(e) => {
                          setDifficultyFilter(e.target.value as any);
                          setProblemPage(1);
                        }}
                        className="px-3 py-2 rounded-xl bg-[#0F172A] border border-primary/20 text-xs font-semibold focus:outline-none"
                      >
                        <option value="All">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    {/* Bulk Actions Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                      <button
                        onClick={() => handleBatchStatusChange('all', 'Released')}
                        className="px-3 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                      >
                        🚀 Release ALL Problems
                      </button>

                      <button
                        onClick={() => handleBatchStatusChange('all', 'Hidden')}
                        className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                      >
                        🔒 Hide ALL Problems
                      </button>

                      {selectedProblemIds.length > 0 && (
                        <>
                          <button
                            onClick={() => handleBatchStatusChange(selectedProblemIds, 'Released')}
                            className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                          >
                            Release Selected ({selectedProblemIds.length})
                          </button>

                          <button
                            onClick={() => handleBatchStatusChange(selectedProblemIds, 'Hidden')}
                            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                          >
                            Hide Selected ({selectedProblemIds.length})
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table of All Problem Statements */}
                <div className="glass-card overflow-hidden">
                  <div className="p-6 border-b border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-cyan-400" /> Multi-QR Problem Management ({problems.length} Statements)
                      </h3>
                      <p className="text-xs text-foreground/60">
                        Assigns 11 unique QR codes. Each QR code tracks scans and maintains individual release status.
                      </p>
                    </div>

                    <button
                      onClick={handleClearProblemForm}
                      className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-2 w-fit"
                    >
                      <PlusCircle className="w-4 h-4" /> Add New Problem
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 border-b border-primary/10 text-foreground/70 uppercase text-xs">
                        <tr>
                          <th className="py-3.5 px-4 w-10">
                            <input
                              type="checkbox"
                              checked={isAllOnPageSelected}
                              onChange={toggleSelectAllOnPage}
                              className="rounded border-white/20 bg-white/10"
                            />
                          </th>
                          <th className="py-3.5 px-4 font-semibold">Problem ID</th>
                          <th className="py-3.5 px-4 font-semibold">Title & Category</th>
                          <th className="py-3.5 px-4 font-semibold">QR Code</th>
                          <th className="py-3.5 px-4 font-semibold">Scan Count</th>
                          <th className="py-3.5 px-4 font-semibold">Status</th>
                          <th className="py-3.5 px-4 font-semibold">Last Updated</th>
                          <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10">
                        {paginatedProblemsList.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-foreground/50">
                              No problem statements found matching search and filters.
                            </td>
                          </tr>
                        ) : (
                          paginatedProblemsList.map((prob) => (
                            <tr key={prob.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-3.5 px-4">
                                <input
                                  type="checkbox"
                                  checked={selectedProblemIds.includes(prob.id)}
                                  onChange={() => toggleSelectProblem(prob.id)}
                                  className="rounded border-white/20 bg-white/10"
                                />
                              </td>
                              <td className="py-3.5 px-4 font-mono text-xs font-bold text-cyan-400">
                                Problem {prob.id}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5 max-w-xs">
                                  <p className="font-bold text-white truncate">{prob.title}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px] font-semibold">
                                      {prob.category}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      prob.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-300' :
                                      prob.difficulty === 'Hard' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                                    }`}>
                                      {prob.difficulty}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Interactive QR Code Thumbnail */}
                              <td className="py-3.5 px-4">
                                <div
                                  onClick={() => setQrModalProblem(prob)}
                                  className="p-1.5 bg-white rounded-lg inline-block cursor-pointer border hover:border-cyan-400 hover:scale-105 transition-all shadow-md"
                                  title="Click to view/download QR"
                                >
                                  <QRCodeSVG
                                    id={`qr-svg-${prob.id}`}
                                    value={
                                      typeof window !== 'undefined'
                                        ? `${window.location.origin}/ps/${prob.accessToken || prob.id}`
                                        : `/ps/${prob.accessToken || prob.id}`
                                    }
                                    size={40}
                                    bgColor="#FFFFFF"
                                    fgColor="#0F172A"
                                    level="M"
                                  />
                                </div>
                              </td>

                              {/* Scan Analytics Column */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5">
                                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold font-mono inline-flex items-center gap-1">
                                    <QrCode className="w-3 h-3" /> {prob.scanCount || 0} scans
                                  </span>
                                  {prob.lastScannedAt ? (
                                    <p className="text-[10px] text-foreground/50 font-mono">
                                      Last: {new Date(prob.lastScannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  ) : (
                                    <p className="text-[10px] text-foreground/40 font-mono">No scans yet</p>
                                  )}
                                </div>
                              </td>

                              {/* Status Badge */}
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase inline-flex items-center gap-1 ${
                                  prob.status === 'Released' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                  prob.status === 'Hidden' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}>
                                  {prob.status === 'Released' ? '🟢 Released' : prob.status === 'Hidden' ? '🔴 Hidden' : '🟡 Draft'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-xs font-mono text-foreground/60">
                                {new Date(prob.updatedAt).toLocaleDateString()}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {prob.status === 'Released' ? (
                                    <button
                                      onClick={() => handleUpdateProblemStatus(prob.id, 'Hidden')}
                                      className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold"
                                      title="Hide Problem"
                                    >
                                      Hide
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateProblemStatus(prob.id, 'Released')}
                                      className="px-2 py-1 rounded bg-green-500/10 hover:bg-green-500/20 text-green-300 text-xs font-semibold"
                                      title="Release Problem"
                                    >
                                      Release
                                    </button>
                                  )}

                                  <button
                                    onClick={() => setQrModalProblem(prob)}
                                    className="p-1.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                                    title="View QR Code & Analytics"
                                  >
                                    <QrCode className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => setPreviewProblem(prob)}
                                    className="p-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300"
                                    title="Preview Statement"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleLoadProblemToEdit(prob)}
                                    className="p-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300"
                                    title="Edit Content"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleDownloadQRImage(prob)}
                                    className="p-1.5 rounded bg-green-500/10 hover:bg-green-500/20 text-green-300"
                                    title="Download QR PNG"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteProblem(prob.id)}
                                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination for Problems Table */}
                  {totalProblemPages > 1 && (
                    <div className="p-4 border-t border-primary/10 flex items-center justify-between text-xs text-foreground/70">
                      <span>
                        Page {problemPage} of {totalProblemPages} ({filteredProblemsList.length} statements)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={problemPage === 1}
                          onClick={() => setProblemPage((prev) => Math.max(1, prev - 1))}
                          className="p-1.5 rounded bg-white/10 disabled:opacity-30"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          disabled={problemPage === totalProblemPages}
                          onClick={() => setProblemPage((prev) => Math.min(totalProblemPages, prev + 1))}
                          className="p-1.5 rounded bg-white/10 disabled:opacity-30"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              {/* Form Editor */}
              <div className="glass-card p-6 md:p-8 space-y-6 glow-border">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Edit className="w-5 h-5 text-primary" />
                    {editingProblemId ? `Edit Problem Statement (${editingProblemId})` : 'Create New Problem Statement'}
                  </h3>
                  {editingProblemId && (
                    <button
                      onClick={handleClearProblemForm}
                      className="text-xs font-semibold text-foreground/60 hover:text-white"
                    >
                      Clear & Create New
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProblem} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-1">Problem Title *</label>
                      <input
                        type="text"
                        value={probTitle}
                        onChange={(e) => setProbTitle(e.target.value)}
                        placeholder="e.g. Build an AI-Powered Smart Campus Assistant"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-sm focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Category</label>
                      <input
                        type="text"
                        value={probCategory}
                        onChange={(e) => setProbCategory(e.target.value)}
                        placeholder="e.g. AI Agents & Automation"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Difficulty Level</label>
                      <select
                        value={probDifficulty}
                        onChange={(e) => setProbDifficulty(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-primary/20 focus:border-primary/50 text-sm focus:outline-none"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Initial Status</label>
                      <select
                        value={probStatus}
                        onChange={(e) => setProbStatus(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-primary/20 focus:border-primary/50 text-sm focus:outline-none"
                      >
                        <option value="Draft">Draft (Saved, not released)</option>
                        <option value="Released">Released (Live to participants)</option>
                        <option value="Hidden">Hidden (Archived)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Detailed Description *</label>
                    <textarea
                      rows={4}
                      value={probDesc}
                      onChange={(e) => setProbDesc(e.target.value)}
                      placeholder="Describe the challenge statement, problem scope, background, and expected user experience..."
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-sm focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Key Objectives (1 per line)</label>
                      <textarea
                        rows={4}
                        value={probObjectives}
                        onChange={(e) => setProbObjectives(e.target.value)}
                        placeholder="Understand user queries using AI&#10;Provide accurate responses&#10;Maintain clean UI"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-xs focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Requirements (1 per line)</label>
                      <textarea
                        rows={4}
                        value={probRequirements}
                        onChange={(e) => setProbRequirements(e.target.value)}
                        placeholder="User-friendly UI/UX interface&#10;Fast response times under 2s&#10;Support for campus knowledge"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-xs focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Constraints (1 per line)</label>
                      <textarea
                        rows={4}
                        value={probConstraints}
                        onChange={(e) => setProbConstraints(e.target.value)}
                        placeholder="Development during event window&#10;Permissible AI models only&#10;Original solution code"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-xs focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Deliverables (1 per line)</label>
                      <textarea
                        rows={4}
                        value={probDeliverables}
                        onChange={(e) => setProbDeliverables(e.target.value)}
                        placeholder="Functional Application&#10;Source Code Repository&#10;Live Judge Demonstration"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-xs focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClearProblemForm}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-foreground/70"
                    >
                      Clear / Reset
                    </button>

                    <button
                      type="submit"
                      disabled={savingProblem}
                      className="btn-primary py-3 px-6 text-sm font-bold inline-flex items-center gap-2"
                    >
                      {savingProblem ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        'Save Problem Statement'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 4: EVENT CONTROLS */}
          {activeTab === 'controls' && analytics && (
            <motion.div variants={itemVariants} className="space-y-6 max-w-3xl">
              <div className="glass-card p-8 space-y-6 glow-border">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Settings className="w-6 h-6 text-primary" /> Competition Capacity & Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold">Maximum Teams Limit (MAX_TEAMS)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={configMaxTeams}
                        onChange={(e) => setConfigMaxTeams(parseInt(e.target.value, 10) || 40)}
                        className="px-4 py-2.5 rounded-xl bg-white/10 border border-primary/20 text-base font-semibold focus:outline-none w-32"
                      />
                      <button
                        onClick={() => handleUpdateConfig('MAX_TEAMS', configMaxTeams)}
                        disabled={updatingConfig}
                        className="btn-primary py-2.5 px-4 text-xs font-semibold"
                      >
                        Save Limit
                      </button>
                    </div>
                    <p className="text-xs text-foreground/50">
                      Current registrations: {analytics.registeredTeams} / {analytics.maxTeams} teams.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold">Registration Status</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateConfig('registrationOpen', !analytics.registrationOpen)}
                        className={`py-2.5 px-5 rounded-xl font-semibold text-xs border flex items-center gap-2 ${
                          analytics.registrationOpen
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-green-500/10 border-green-500/30 text-green-400'
                        }`}
                      >
                        {analytics.registrationOpen ? 'Close Registration Now' : 'Open Registration Now'}
                      </button>
                    </div>
                    <p className="text-xs text-foreground/50">
                      Currently: {analytics.registrationOpen ? '🟢 Registration Open' : '🔴 Registration Closed'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: ACTIVITY LOGS */}
          {activeTab === 'logs' && (
            <motion.div variants={itemVariants} className="glass-card overflow-hidden">
              <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-secondary" /> Admin Activity Audit Log
                </h3>
                <span className="text-xs text-foreground/50">Last {logs.length} events logged</span>
              </div>

              <div className="divide-y divide-primary/10">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-foreground/50">No activity logs recorded yet.</div>
                ) : (
                  logs.map((log: LogEntry) => (
                    <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/5 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase bg-primary/20 text-primary px-2 py-0.5 rounded">
                            {log.action}
                          </span>
                          <span className="text-xs text-foreground/60">by {log.adminUser}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground/90">{log.details}</p>
                      </div>
                      <span className="text-xs font-mono text-foreground/50 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* QR Code Analytics & Download Modal */}
      {qrModalProblem && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card p-6 md:p-8 max-w-md w-full space-y-6 glow-border border-2 border-cyan-400 text-center relative">
            <div className="space-y-1">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                QR CODE METRICS & ACCESS
              </span>
              <h3 className="text-xl font-extrabold text-white">
                Problem Statement {qrModalProblem.id}
              </h3>
              <p className="text-xs text-foreground/70">{qrModalProblem.title}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white shadow-2xl inline-block border-4 border-cyan-400/50">
              <QRCodeSVG
                id={`qr-modal-svg-${qrModalProblem.id}`}
                value={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/ps/${qrModalProblem.accessToken || qrModalProblem.id}`
                    : `/ps/${qrModalProblem.accessToken || qrModalProblem.id}`
                }
                size={220}
                bgColor="#FFFFFF"
                fgColor="#0F172A"
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Scan Analytics Stats */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-foreground/70">Total Scans:</span>
                <span className="font-bold text-cyan-300 font-mono text-sm">{qrModalProblem.scanCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground/70">First Scan:</span>
                <span className="font-mono text-foreground/90">
                  {qrModalProblem.firstScannedAt ? new Date(qrModalProblem.firstScannedAt).toLocaleString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground/70">Last Scan:</span>
                <span className="font-mono text-foreground/90">
                  {qrModalProblem.lastScannedAt ? new Date(qrModalProblem.lastScannedAt).toLocaleString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground/70">Assigned Secure Token:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {qrModalProblem.accessToken || qrModalProblem.id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground/70">Assigned URL:</span>
                <span className="font-mono text-cyan-400 truncate max-w-[200px]">
                  /ps/{qrModalProblem.accessToken || qrModalProblem.id}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/ps/${qrModalProblem.accessToken || qrModalProblem.id}`;
                  navigator.clipboard.writeText(url);
                  setQrCopied(true);
                  toast.success('Secure QR URL copied to clipboard!');
                  setTimeout(() => setQrCopied(false), 2000);
                }}
                className="btn-secondary py-2 px-3 text-xs font-bold inline-flex items-center gap-1.5"
              >
                {qrCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                {qrCopied ? 'Copied!' : 'Copy URL'}
              </button>

              <button
                onClick={() => handleDownloadQRImage(qrModalProblem)}
                className="btn-primary py-2 px-3 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>

              <button
                onClick={() => handleRegenerateToken(qrModalProblem.id)}
                className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                title="Generate a new secure access token for this problem"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Token
              </button>

              <button
                onClick={() => setQrModalProblem(null)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-foreground/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Preview Modal */}
      {previewProblem && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card p-6 md:p-8 max-w-3xl w-full space-y-6 glow-border border-2 border-cyan-400 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Admin Preview Mode</span>
                <h3 className="text-2xl font-bold text-white">{previewProblem.title}</h3>
              </div>
              <button
                onClick={() => setPreviewProblem(null)}
                className="btn-primary text-xs py-1.5 px-3"
              >
                Close Preview
              </button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-xs font-bold">
                  Category: {previewProblem.category}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 text-xs font-bold">
                  Difficulty: {previewProblem.difficulty}
                </span>
              </div>

              <p className="text-foreground/90">{previewProblem.description}</p>

              {previewProblem.objectives && previewProblem.objectives.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-cyan-300 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Key Objectives:
                  </h4>
                  <ul className="space-y-1 pl-4">
                    {previewProblem.objectives.map((o, i) => (
                      <li key={i} className="text-foreground/80 list-disc">{o}</li>
                    ))}
                  </ul>
                </div>
              )}

              {previewProblem.requirements && previewProblem.requirements.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-secondary flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Requirements:
                  </h4>
                  <ul className="space-y-1 pl-4">
                    {previewProblem.requirements.map((r, i) => (
                      <li key={i} className="text-foreground/80 list-disc">{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {previewProblem.constraints && previewProblem.constraints.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Constraints:
                  </h4>
                  <ul className="space-y-1 pl-4">
                    {previewProblem.constraints.map((c, i) => (
                      <li key={i} className="text-foreground/80 list-disc">{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {previewProblem.deliverables && previewProblem.deliverables.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-purple-300 flex items-center gap-2">
                    <PackageCheck className="w-4 h-4" /> Deliverables:
                  </h4>
                  <ul className="space-y-1 pl-4">
                    {previewProblem.deliverables.map((d, i) => (
                      <li key={i} className="text-foreground/80 list-disc">{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Team Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 max-w-lg w-full space-y-6 glow-border">
            <h3 className="text-2xl font-bold text-primary">Team Details</h3>
            <div className="space-y-3 text-sm">
              <p><strong>Team Name:</strong> {selectedTeam.teamName}</p>
              <p><strong>Leader Name:</strong> {selectedTeam.leaderName}</p>
              <p><strong>Leader Email:</strong> {selectedTeam.leaderEmail}</p>
              <p><strong>Phone:</strong> {selectedTeam.phone}</p>
              <p><strong>College:</strong> {selectedTeam.college}</p>
              <p><strong>Department:</strong> {selectedTeam.department || 'N/A'}</p>
              <p><strong>Year:</strong> {selectedTeam.year || 'N/A'}</p>
              <p><strong>Member 2:</strong> {selectedTeam.member2 || 'Solo participant'}</p>
              <p><strong>Registered At:</strong> {new Date(selectedTeam.createdAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <button
                onClick={() => setSelectedTeam(null)}
                className="btn-primary text-xs py-2 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTeamId && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-md w-full space-y-6 border-l-4 border-red-500">
            <h3 className="text-xl font-bold text-red-400">Confirm Registration Deletion</h3>
            <p className="text-sm text-foreground/80">
              Are you sure you want to delete this team registration? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTeamId(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTeam(deleteTeamId)}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
              >
                Delete Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
