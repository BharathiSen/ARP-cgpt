'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Activity, Database, CheckCircle, XCircle, Info, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [newProjectName, setNewProjectName] = useState('');

  // Simulation form
  const [endpoint, setEndpoint] = useState('https://api.example.com/v1/users');
  const [failureRate, setFailureRate] = useState(5);
  const [latency, setLatency] = useState(100);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); }
    else if (status === 'authenticated') { fetchProjects(); }
  }, [status]);

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    if (Array.isArray(data)) {
      setProjects(data);
      if (data.length > 0 && !selectedProject) setSelectedProject(data[0]);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProjectName }),
    });
    if (res.ok) { setNewProjectName(''); fetchProjects(); }
  };

  const runSimulation = async () => {
    if (!selectedProject) return;
    setIsSimulating(true);
    setSimulationResult(null);
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: selectedProject.id, endpoint, failureRate, latency }),
    });
    const data = await res.json();
    setSimulationResult(data);
    setIsSimulating(false);
    fetchProjects();
  };

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00C8FF' }} />
    </div>
  );

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Navbar />

      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="ds-glow-orb w-[800px] h-[600px] top-[-200px] right-[-200px]" style={{ opacity: 0.15 }} />
      </div>

      <div className="pt-24 max-w-7xl mx-auto px-6 pb-16">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-10 pt-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: '#9AA6C4' }}>
              Welcome back, <span style={{ color: '#00C8FF' }}>{session?.user?.name || session?.user?.email}</span>
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="ds-btn-ghost text-sm px-4 py-2 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* ─── Sidebar: Projects ─────────────────────────── */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="ds-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Database className="w-4 h-4" style={{ color: '#00C8FF' }} />
                <h2 className="font-bold text-white text-sm uppercase tracking-widest">Projects</h2>
              </div>

              {/* New Project Form */}
              <form onSubmit={createProject} className="flex gap-2 mb-5">
                <input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="New project name…"
                  className="ds-input text-sm py-2"
                  required
                />
                <button type="submit"
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-all"
                  style={{ background: 'rgba(0,200,255,0.15)', border: '1px solid rgba(0,200,255,0.30)' }}
                >
                  <Plus className="w-5 h-5" style={{ color: '#00C8FF' }} />
                </button>
              </form>

              {/* Project List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                {projects.length === 0 && (
                  <p className="text-center py-8 text-sm" style={{ color: '#9AA6C4' }}>No projects yet. Create one above.</p>
                )}
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProject(p); setSimulationResult(null); }}
                    className="w-full text-left px-4 py-3 rounded-xl border transition-all"
                    style={selectedProject?.id === p.id
                      ? { background: 'rgba(0,200,255,0.12)', borderColor: 'rgba(0,200,255,0.45)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(0,200,255,0.10)', color: '#9AA6C4' }
                    }
                  >
                    <p className="font-semibold text-sm text-white truncate">{p.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#9AA6C4' }}>
                      {p.simulations?.length || 0} simulation{p.simulations?.length !== 1 ? 's' : ''}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Main Panel ─────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-8 space-y-5">
            {!selectedProject ? (
              <div className="ds-card p-20 flex flex-col items-center justify-center text-center">
                <Activity className="w-10 h-10 mb-4" style={{ color: 'rgba(0,200,255,0.4)' }} />
                <p className="font-semibold text-white mb-1">No project selected</p>
                <p className="text-sm" style={{ color: '#9AA6C4' }}>Create or select a project to run simulations.</p>
              </div>
            ) : (
              <>
                {/* ── Simulation Configurator ── */}
                <div className="ds-card p-8">
                  <div className="flex items-center gap-2 mb-8">
                    <Play className="w-4 h-4" style={{ color: '#00C8FF' }} />
                    <h2 className="font-bold text-white text-sm uppercase tracking-widest">
                      Configure Simulation — <span className="ds-gradient-text">{selectedProject.name}</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="ds-label">Target Endpoint URL</label>
                      <input
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        className="ds-input font-mono text-sm"
                        placeholder="https://api.yourservice.com/endpoint"
                      />
                    </div>
                    <div>
                      <label className="ds-label">Failure Injection Rate (%)</label>
                      <input
                        type="number" min={0} max={100}
                        value={failureRate}
                        onChange={(e) => setFailureRate(parseInt(e.target.value))}
                        className="ds-input"
                      />
                    </div>
                    <div>
                      <label className="ds-label">Simulated Latency (ms)</label>
                      <input
                        type="number" min={0}
                        value={latency}
                        onChange={(e) => setLatency(parseInt(e.target.value))}
                        className="ds-input"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <button
                      onClick={runSimulation}
                      disabled={isSimulating}
                      className="ds-btn-primary flex-1 justify-center"
                    >
                      {isSimulating
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Running Simulation…</>
                        : <><Play className="w-4 h-4" /> Run Reliability Test</>
                      }
                    </button>
                  </div>
                </div>

                {/* ── Simulation Result ── */}
                <AnimatePresence>
                  {simulationResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.4 }}
                      className="ds-card p-8 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          {simulationResult.status === 'SUCCESS'
                            ? <CheckCircle className="w-7 h-7" style={{ color: '#00C8FF' }} />
                            : <XCircle className="w-7 h-7" style={{ color: '#ff4d4d' }} />
                          }
                          <div>
                            <p className="ds-label mb-0">Result</p>
                            <p className="text-xl font-bold text-white">{simulationResult.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="ds-label mb-0">P95 Latency</p>
                          <p className="text-3xl font-mono font-bold ds-gradient-text">
                            {simulationResult.avgLatency.toFixed(0)}<span className="text-base text-white/40">ms</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl p-4 text-sm"
                           style={{ background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.15)' }}>
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#00C8FF' }} />
                        <p className="italic" style={{ color: '#9AA6C4' }}>{simulationResult.insight}</p>
                      </div>

                      {/* decorative glow */}
                      <div className="ds-glow-orb w-48 h-48 -bottom-16 -right-16" style={{ opacity: 0.12 }} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Simulation History ── */}
                <div className="ds-card overflow-hidden">
                  <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(0,200,255,0.10)' }}>
                    <Activity className="w-4 h-4" style={{ color: '#00C8FF' }} />
                    <h3 className="font-bold text-white text-sm uppercase tracking-widest">Run History</h3>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto no-scrollbar divide-y" style={{ borderColor: 'rgba(0,200,255,0.08)' }}>
                    {(!selectedProject.simulations || selectedProject.simulations.length === 0) && (
                      <p className="p-8 text-center text-sm" style={{ color: '#9AA6C4' }}>No simulations yet. Run your first test above.</p>
                    )}
                    {selectedProject.simulations?.slice().reverse().map((sim: any) => (
                      <div key={sim.id}
                           className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-mono truncate text-white" style={{ maxWidth: 220 }}>{sim.endpoint}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: '#9AA6C4' }}>
                            {new Date(sim.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                                style={sim.status === 'SUCCESS'
                                  ? { background: 'rgba(0,200,255,0.12)', color: '#00C8FF' }
                                  : { background: 'rgba(255,50,50,0.12)', color: '#ff7070' }
                                }>
                            {sim.status}
                          </span>
                          <p className="text-sm font-mono text-right w-16 text-white">{sim.avgLatency.toFixed(0)}ms</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
