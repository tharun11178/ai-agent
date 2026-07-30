import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Shield,
  Lock,
  Users,
  FileText,
  BarChart3,
  ToggleLeft,
  ToggleRight,
  LogOut,
  CheckCircle,
  AlertCircle,
  PlusCircle,
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
  QrCode,
  KeyRound,
  Printer,
  RotateCw,
  ShieldCheck,
  CheckCircle2,
  Copy,
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
  assignedProblemId?: string;
  createdAt: string;
}

interface TeamQRData {
  id: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  phone: string;
  college: string;
  assignedProblemId?: string;
  assignedProblemTitle?: string;
  assignedProblemTrack?: string;
  qrToken: string;
  secretCode: string;
  qrAccessEnabled: number;
  problemReleased: number;
  scannedAt?: string;
  scanCount: number;
  createdAt: string;
}

interface ProblemStatement {
  id: string;
  title: string;
  track: string;
  description: string;
  fileUrl?: string;
  fileType?: string;
  released: boolean;
  releasedAt?: string;
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
  totalProblems: number;
  releasedProblemsCount: number;
  lockedProblems: number;
  problemsReleased: boolean;
  lastRegistration: string | null;
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

  const [activeTab, setActiveTab] = useState<'analytics' | 'registrations' | 'problems' | 'qrcodes' | 'controls' | 'logs'>('analytics');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [teamQRs, setTeamQRs] = useState<TeamQRData[]>([]);
  const [problems, setProblems] = useState<ProblemStatement[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Pagination for Registrations Table
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Team Details Modal
  const [selectedTeam, setSelectedTeam] = useState<Registration | null>(null);
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);

  // New problem form
  const [newTitle, setNewTitle] = useState('');
  const [newTrack, setNewTrack] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Event Config Form
  const [configMaxTeams, setConfigMaxTeams] = useState<number>(100);
  const [updatingConfig, setUpdatingConfig] = useState(false);

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

      const [regRes, probRes, anaRes, logRes, qrRes] = await Promise.all([
        apiFetch('/api/admin/registrations', { headers }),
        apiFetch('/api/admin/problems', { headers }),
        apiFetch('/api/admin/analytics', { headers }),
        apiFetch('/api/admin/logs', { headers }),
        apiFetch('/api/admin/teams/qr', { headers }),
      ]);

      if (regRes.status === 403 || probRes.status === 403 || anaRes.status === 403) {
        handleLogout();
        toast.error('403 Forbidden: Admin session expired or invalid. Please log in again.');
        return;
      }

      const regData = await regRes.json();
      const probData = await probRes.json();
      const anaData = await anaRes.json();
      const logData = await logRes.json();
      const qrData = await qrRes.json();

      if (regData.success) setRegistrations(regData.registrations);
      if (probData.success) setProblems(probData.problems);
      if (anaData.success) {
        setAnalytics(anaData.analytics);
        setConfigMaxTeams(anaData.analytics.maxTeams || 40);
      }
      if (logData.success) setLogs(logData.logs);
      if (qrData.success) setTeamQRs(qrData.teams);
    } catch {
      toast.error('Failed to connect to admin API server.');
    } finally {
      setLoading(false);
    }
  };

  // QR Code Management Handlers
  const handleAssignProblemToTeam = async (teamId: string, problemId: string) => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/admin/problems/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId, problemId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Assigned problem statement to team successfully!');
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Failed to assign problem.');
      }
    } catch {
      toast.error('Server error assigning problem.');
    }
  };

  const handleToggleQRAccess = async (teamId?: string, enabled?: boolean) => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/admin/teams/qr-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId, enabled }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'QR Access updated.');
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Failed to update QR access.');
      }
    } catch {
      toast.error('Server error updating QR access.');
    }
  };

  const handleToggleIndividualRelease = async (teamId: string, released: boolean) => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/admin/teams/release-individual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId, released }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(released ? 'Problem statement released to team!' : 'Problem statement locked for team.');
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Failed to update release status.');
      }
    } catch {
      toast.error('Server error updating individual release status.');
    }
  };

  const handleRegenerateQR = async (teamId: string) => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/admin/teams/regenerate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('New QR Code & Secret Code generated successfully!');
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Failed to regenerate QR.');
      }
    } catch {
      toast.error('Server error regenerating QR code.');
    }
  };

  const handlePrintQRCard = (team: TeamQRData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrUrl = `${window.location.origin}/problem-statement?token=${team.qrToken}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Passcode - ${team.teamName}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; background: #fff; color: #1e293b; }
            .card { border: 3px solid #0284c7; padding: 30px; border-radius: 16px; max-width: 400px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            h2 { color: #0369a1; margin-bottom: 5px; }
            .team-id { background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-weight: bold; display: inline-block; margin-bottom: 15px; }
            .qr-box { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 12px; display: inline-block; }
            .secret-box { background: #f1f5f9; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 16px; font-weight: bold; margin-top: 15px; }
            .footer { font-size: 12px; color: #64748b; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>AI AGENT CHALLENGE 2026</h2>
            <p style="margin: 0; font-[14px]">Official Team Problem Access Pass</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
            
            <h3 style="margin: 5px 0;">${team.teamName}</h3>
            <div class="team-id">ID: ${team.id}</div>
            
            <p style="font-size: 13px; margin: 5px 0;">Leader: <strong>${team.leaderName}</strong></p>
            <p style="font-size: 13px; margin: 5px 0;">Institution: ${team.college}</p>
            
            <div class="qr-box">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}" width="180" height="180" />
            </div>

            <div class="secret-box">Secret Code: ${team.secretCode}</div>
            <p style="font-size: 12px; color: #0284c7; margin-top: 8px;">Scan this QR code with camera or visit website to view problem statement.</p>

            <div class="footer">Kuppam Engineering College — Department of AI & ML</div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  // Toggle Release / Lock Problem Statements (One click)
  const handleToggleRelease = async (released: boolean) => {
    if (!token) return;
    try {
      const response = await apiFetch('/api/admin/problems/release', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ released }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(released ? '🚀 All problem statements are now LIVE and released!' : '🔒 Problem statements locked.');
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Failed to update problem release status.');
      }
    } catch {
      toast.error('Failed to communicate with server.');
    }
  };

  // Create / Upload Problem
  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!newTitle || !newDescription) {
      toast.error('Title and description are required.');
      return;
    }

    setUploading(true);
    try {
      const response = await apiFetch('/api/admin/problems/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          track: newTrack || 'General AI',
          description: newDescription,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Problem statement created successfully!');
        setNewTitle('');
        setNewTrack('');
        setNewDescription('');
        fetchAdminData(token);
      } else {
        toast.error(data.error || 'Upload failed.');
      }
    } catch {
      toast.error('Server error while uploading problem.');
    } finally {
      setUploading(false);
    }
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

  // Update Event Config (Open/Close Registration, Max Teams capacity)
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

  // Search & Pagination Logic
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

  // If not logged in -> Render Secure Admin Login Form
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

  // Render Logged-in Admin Dashboard
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
              { id: 'problems', label: 'Problem Statements', icon: FileText },
              { id: 'qrcodes', label: `QR Code Access (${teamQRs.length})`, icon: QrCode },
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

                <div className="glass-card p-6 space-y-2 border-l-4 border-purple-500">
                  <p className="text-sm font-medium text-foreground/60">Problem Status</p>
                  <p className="text-4xl font-bold text-purple-400">
                    {analytics.problemsReleased ? 'RELEASED' : 'LOCKED'}
                  </p>
                  <p className="text-xs text-foreground/50">{analytics.totalProblems} Problems Uploaded</p>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="glass-card p-8 space-y-6 glow-border">
                <h3 className="text-2xl font-bold">Quick Event Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleRelease(!analytics.problemsReleased)}
                    className={`p-4 rounded-xl font-semibold border flex items-center justify-between ${
                      analytics.problemsReleased
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                        : 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20'
                    }`}
                  >
                    <span>{analytics.problemsReleased ? '🔒 Lock Problems' : '🚀 Release All Problems'}</span>
                    {analytics.problemsReleased ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpdateConfig('registrationOpen', !analytics.registrationOpen)}
                    className={`p-4 rounded-xl font-semibold border flex items-center justify-between ${
                      analytics.registrationOpen
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
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
                        <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
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
                        paginatedRegistrations.map((team) => (
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

          {/* TAB 3: PROBLEM STATEMENTS */}
          {activeTab === 'problems' && (
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Upload New Problem */}
              <div className="lg:col-span-5 glass-card p-6 space-y-4 glow-border">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-primary" /> Create Problem Statement
                </h3>
                <form onSubmit={handleCreateProblem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase mb-1">Title *</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g., Autonomous Fleet Dispatcher"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white/10 border border-primary/20 focus:border-primary/50 text-sm focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase mb-1">Track Category</label>
                    <input
                      type="text"
                      value={newTrack}
                      onChange={(e) => setNewTrack(e.target.value)}
                      placeholder="e.g., AI Agents & Autonomous Systems"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white/10 border border-primary/20 focus:border-primary/50 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase mb-1">Description & Requirements *</label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={5}
                      placeholder="Detailed problem specification..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white/10 border border-primary/20 focus:border-primary/50 text-sm focus:outline-none"
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={uploading}
                    className="w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Publish Problem Statement'}
                  </motion.button>
                </form>
              </div>

              {/* Right Column: Existing Problems List */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Uploaded Problems ({problems.length})</h3>
                  <button
                    onClick={() => handleToggleRelease(!analytics?.problemsReleased)}
                    className="btn-secondary text-xs px-4 py-2 font-semibold flex items-center gap-2"
                  >
                    {analytics?.problemsReleased ? 'Lock All Problems' : 'Release All Problems'}
                  </button>
                </div>

                <div className="space-y-4">
                  {problems.map((prob: ProblemStatement) => (
                    <div key={prob.id} className="glass-card p-6 space-y-3 border-l-4 border-secondary">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs bg-secondary/20 text-secondary px-2.5 py-0.5 rounded-full font-semibold">
                            {prob.track}
                          </span>
                          <h4 className="text-lg font-bold mt-1">{prob.title}</h4>
                        </div>
                        <button
                          onClick={() => handleDeleteProblem(prob.id)}
                          className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Problem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{prob.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: QR CODE MANAGEMENT & AUDIT TRACKING */}
          {activeTab === 'qrcodes' && (
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Header Overview Bar */}
              <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4 glow-border">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-cyan-300">
                    <QrCode className="w-5 h-5 text-cyan-400" /> Team QR Code Access Suite
                  </h3>
                  <p className="text-xs text-foreground/60">
                    Manage problem assignments, QR code access locks, individual releases, and monitor team scan logs.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleToggleQRAccess(undefined, true)}
                    className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Enable All QR Codes
                  </button>
                  <button
                    onClick={() => handleToggleQRAccess(undefined, false)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold inline-flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" /> Disable All QR Codes
                  </button>
                </div>
              </div>

              {/* Stat Summary Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-4 border-l-4 border-cyan-400">
                  <p className="text-xs text-foreground/60 uppercase font-semibold">Total Teams</p>
                  <p className="text-2xl font-bold text-cyan-300">{teamQRs.length} Teams</p>
                </div>
                <div className="glass-card p-4 border-l-4 border-green-400">
                  <p className="text-xs text-foreground/60 uppercase font-semibold">QR Scanned Teams</p>
                  <p className="text-2xl font-bold text-green-400">
                    {teamQRs.filter((t: TeamQRData) => t.scannedAt).length} / {teamQRs.length} Scanned
                  </p>
                </div>
                <div className="glass-card p-4 border-l-4 border-purple-400">
                  <p className="text-xs text-foreground/60 uppercase font-semibold">Active Problems Uploaded</p>
                  <p className="text-2xl font-bold text-purple-300">{problems.length} Statements</p>
                </div>
              </div>

              {/* QR Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {teamQRs.map((team: TeamQRData) => {
                  const qrUrl = `${window.location.origin}/problem-statement?token=${team.qrToken}`;
                  const isScanned = Boolean(team.scannedAt);
                  const isQREnabled = team.qrAccessEnabled === 1;

                  return (
                    <div
                      key={team.id}
                      className={`glass-card p-6 space-y-5 border-l-4 transition-all ${
                        isScanned
                          ? 'border-green-500 bg-green-500/5'
                          : isQREnabled
                          ? 'border-cyan-400'
                          : 'border-amber-500 opacity-80'
                      }`}
                    >
                      {/* Top Header & Scan Badge */}
                      <div className="flex items-start justify-between gap-4 border-b border-primary/10 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold bg-primary/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-primary/30">
                              {team.id}
                            </span>
                            {isScanned ? (
                              <span className="text-[11px] font-bold bg-green-500/20 text-green-400 px-2.5 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Scanned (#{team.scanCount})
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                                Pending Scan
                              </span>
                            )}
                          </div>
                          <h4 className="text-xl font-bold text-foreground mt-1">{team.teamName}</h4>
                          <p className="text-xs text-foreground/70">
                            Leader: <strong>{team.leaderName}</strong> | {team.college}
                          </p>
                        </div>

                        {/* Secret Code Badge */}
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-foreground/50 uppercase font-semibold">Secret Code</p>
                          <span className="text-xs font-mono font-bold text-cyan-300 bg-white/10 px-2.5 py-1 rounded-md border border-primary/20 inline-block">
                            {team.secretCode}
                          </span>
                        </div>
                      </div>

                      {/* QR Display & Controls */}
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* QR Code Canvas */}
                        <div className="p-3 bg-white rounded-2xl shadow-lg border border-primary/20 shrink-0 text-center">
                          <QRCodeSVG value={qrUrl} size={130} level="H" />
                          <p className="text-[10px] font-mono text-gray-600 mt-1">Scan for Problem</p>
                        </div>

                        {/* Controls & Assignments */}
                        <div className="space-y-4 flex-1 w-full text-xs">
                          {/* Problem Assignment Dropdown */}
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70">
                              Assigned Problem Statement
                            </label>
                            <select
                              value={team.assignedProblemId || ''}
                              onChange={(e) => handleAssignProblemToTeam(team.id, e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-primary/20 focus:border-primary/50 text-foreground font-semibold"
                            >
                              <option value="" className="bg-[#0F172A] text-foreground">
                                -- Select Problem Statement --
                              </option>
                              {problems.map((prob: ProblemStatement) => (
                                <option key={prob.id} value={prob.id} className="bg-[#0F172A] text-foreground">
                                  {prob.title} ({prob.track})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Access & Release Toggles */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => handleToggleQRAccess(team.id, team.qrAccessEnabled !== 1)}
                              className={`p-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
                                team.qrAccessEnabled === 1
                                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              }`}
                            >
                              {team.qrAccessEnabled === 1 ? (
                                <>
                                  <ToggleRight className="w-4 h-4 text-cyan-400" /> QR Enabled
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4 text-amber-400" /> QR Disabled
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleToggleIndividualRelease(team.id, team.problemReleased !== 1)}
                              className={`p-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
                                team.problemReleased === 1
                                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                  : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                              }`}
                            >
                              {team.problemReleased === 1 ? (
                                <>
                                  <ToggleRight className="w-4 h-4 text-green-400" /> Release Live
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4 text-purple-300" /> Lock Problem
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="border-t border-primary/10 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="text-[11px] text-foreground/60">
                          {team.scannedAt ? (
                            <span>Scanned at: {new Date(team.scannedAt).toLocaleString()}</span>
                          ) : (
                            <span>Not yet scanned by team</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePrintQRCard(team)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-foreground text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5 text-cyan-400" /> Print Pass
                          </button>
                          <button
                            onClick={() => handleRegenerateQR(team.id)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-foreground text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                            title="Generate new QR token & secret"
                          >
                            <RotateCw className="w-3.5 h-3.5 text-purple-400" /> Reset Token
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
