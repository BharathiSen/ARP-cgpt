'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Activity, Database, CheckCircle, XCircle, LogOut, Loader2, Sparkles, BrainCircuit, Zap, Key, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/Button';
import { toast } from 'react-hot-toast';

// Add simple interfaces for data models
// ... (rest of imports keep unchanged below)
interface Simulation {
  id: string;
  endpoint: string;
  status: string;
  avgLatency: number;
  insight?: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  simulations?: Simulation[];
}

export default function DashboardClient({ user }: { user: { isPaid: boolean, isAdmin: boolean } | null }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Simulation form
  const [endpoint, setEndpoint] = useState('https://api.example.com/v1/users');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<Simulation | null>(null);
  
  // Real-time animation states
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [liveLatency, setLiveLatency] = useState(0);

  // --- FEATURE 2: AI TEST GENERATOR STATES ---
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<{
    failureRate: number;
    latencySpikes: number;
    concurrency: number;
    description: string;
  } | null>(null);

  // --- FEATURE 3: AI SUMMARY STATE ---
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // --- FEATURE: API KEY ---
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  const maskApiKey = (key: string | null) => {
    if (!key) return '';
    return key.slice(0, 12) + "**************" + key.slice(-6);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('API Key copied to clipboard!');
  };

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    if (Array.isArray(data)) {
      setProjects(data);
      if (data.length > 0 && !selectedProject) setSelectedProject(data[0]);
    }
  };

  const fetchApiKey = async () => {
    try {
      const res = await fetch('/api/user/api-key');
      const data = await res.json();
      if (res.ok && data.apiKey) {
        setApiKey(data.apiKey);
      }
    } catch (e) {
      console.error('Failed to fetch api key background', e);
    }
  };

  const handleGenerateApiKey = async () => {
    setIsApiKeyLoading(true);
    setNewlyGeneratedKey(null);
    try {
      const res = await fetch('/api/user/generate-api-key', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.apiKey) {
        setApiKey(`${data.apiKey.slice(0, 12)} **** ${data.apiKey.slice(-4)}`);
        setNewlyGeneratedKey(data.apiKey);
        toast.success('API Key generated successfully!');

        // Auto-download file
        const blob = new Blob([`AI Reliability Lab API Key\n\nYour Secret Key:\n${data.apiKey}\n\nKeep this key secure. Do not share it.`], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-reliability-lab-api-key.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        toast.error(data.error || 'Failed to generate API key');
      }
    } catch (e) {
      toast.error('Error connecting to server.');
    } finally {
      setIsApiKeyLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!selectedProject) return;
    try {
      toast.loading('Exporting report...', { id: 'export' });
      const res = await fetch(`/api/simulations/export?projectId=${selectedProject.id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Export failed');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${selectedProject.name.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully!', { id: 'export' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to export report.', { id: 'export' });
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); }
    else if (status === 'authenticated') {
      fetchProjects();
      fetchApiKey();
      // Read prompt from URL if present
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const promptParams = urlParams.get('prompt');
        if (promptParams) {
          setAiPrompt(promptParams);
          // Set timeout to wait for projects to load, then we could auto-click, but just filling it is enough for UX.
          setTimeout(() => {
             const btn = document.getElementById('ai-generate-btn');
             if(btn) btn.click();
          }, 1000);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || isCreating) return;
    setIsCreating(true);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProjectName }),
    });
    if (res.ok) { setNewProjectName(''); fetchProjects(); }
    setIsCreating(false);
  };

  const runSimulation = async () => {
    if (!selectedProject) return;
    setIsSimulating(true);
    setSimulationResult(null);
    setSimulationProgress(0);
    setLiveLatency(0);

    // Live Progress Animation Interval
    const interval = setInterval(() => {
      setSimulationProgress(p => {
        if (p >= 95) return p;
        return p + Math.floor(Math.random() * 15);
      });
      setLiveLatency(Math.floor(Math.random() * 800) + 50); // random between 50 and 850
    }, 150);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProject.id, endpoint }),
      });
      const data = await res.json();
      
      clearInterval(interval);
      setSimulationProgress(100);
      
      if (!res.ok) {
        toast.error(data.message || 'Simulation failed to start');
        setIsSimulating(false);
        return;
      }
      
      setTimeout(() => {
        setSimulationResult(data);
        setIsSimulating(false);
        toast.success('Simulation completed successfully!');
        fetchProjects();
      }, 500); // short delay to show 100%
      
    } catch (e: any) {
      clearInterval(interval);
      setIsSimulating(false);
      toast.error('Network error during simulation.');
    }
  };

  // --- FEATURE 2: AI TEST GENERATOR LOGIC ---
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAIGenerating(true);
    setGeneratedConfig(null);
    
    // Simulate AI thinking and rule-based generation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const promptLower = aiPrompt.toLowerCase();
    const config = {
      failureRate: promptLower.includes('heavy') || promptLower.includes('load') ? 35 : 5,
      latencySpikes: promptLower.includes('slow') || promptLower.includes('latency') ? 800 : 120,
      concurrency: promptLower.includes('spike') || promptLower.includes('heavy') ? 1000 : 50,
      description: ''
    };
    
    config.description = `Generated Test Plan: Simulating ${config.concurrency} concurrent virtual users with expected ${config.failureRate}% failure injection and ${config.latencySpikes}ms latency p95.`;
    
    setGeneratedConfig(config);
    setIsAIGenerating(false);
  };

  // --- FEATURE 3: AI SUMMARY LOGIC ---
  useEffect(() => {
    if (selectedProject?.simulations && selectedProject.simulations.length > 2) {
      setIsGeneratingSummary(true);
      
      const timer = setTimeout(() => {
        const sims = selectedProject.simulations!;
        const avgLat = sims.reduce((acc, curr) => acc + curr.avgLatency, 0) / sims.length;
        const failureCount = sims.filter(s => s.status === 'FAILED').length;
        const failurePerc = (failureCount / sims.length) * 100;
        
        let summary = '';
        if (failurePerc > 30) {
          summary = `Critical reliability degradation. Over ${failurePerc.toFixed(0)}% of the last ${sims.length} simulations failed. Frequent timeouts observed. Immediate scaling or circuit breakers recommended.`;
        } else if (avgLat > 500) {
          summary = `Performance warning. The average latency over the last ${sims.length} runs is ${avgLat.toFixed(0)}ms. Consider employing edge caching and optimizing upstream dependencies.`;
        } else {
          summary = `Healthy system architecture. Over the last ${sims.length} simulations, your services maintained a ${100 - failurePerc}% success rate with stable latency (${avgLat.toFixed(0)}ms avg).`;
        }
        
        setAiSummary(summary);
        setIsGeneratingSummary(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setAiSummary(null);
    }
  }, [selectedProject]);

  const chartData = selectedProject?.simulations?.map((s: Simulation, idx: number) => ({
    name: `Run ${idx + 1}`,
    latency: s.avgLatency,
  })) || [];

  const successCount = selectedProject?.simulations?.filter((s: Simulation) => s.status === 'SUCCESS').length || 0;
  const failureCount = selectedProject?.simulations?.filter((s: Simulation) => s.status === 'FAILED').length || 0;

  const pieData = [
    { name: 'Success', value: successCount },
    { name: 'Failure', value: failureCount }
  ];
  const COLORS = ['#00C8FF', '#ff4d4d'];

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00C8FF' }} />
    </div>
  );

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
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
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm px-4 py-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
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
                  disabled={isCreating}
                  required
                />
                <Button 
                  type="submit"
                  variant="custom"
                  isLoading={isCreating}
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-all"
                  style={{ background: 'rgba(0,200,255,0.15)', border: '1px solid rgba(0,200,255,0.30)' }}
                >
                  {!isCreating && <Plus className="w-5 h-5" style={{ color: '#00C8FF' }} />}
                </Button>
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

            {/* API Settings & Export Card */}
            <div className="ds-card p-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-4 h-4" style={{ color: '#00C8FF' }} />
                <h2 className="font-bold text-white text-sm uppercase tracking-widest">Developer API</h2>
              </div>
              <p className="text-xs mb-4" style={{ color: '#9AA6C4' }}>
                Use your API key to integrate AI Reliability Lab directly into your CI/CD pipelines.
              </p>
              
              <div className="space-y-3">
                {newlyGeneratedKey ? (
                  <div className="flex flex-col gap-2">
                     <p className="text-xs text-yellow-400 mb-1">
                       Copy and store this key securely. You won&apos;t be able to see it again.
                     </p>
                     <div className="p-3 rounded break-all text-xs font-mono" style={{ background: 'rgba(8,18,35,0.6)', border: '1px solid rgba(250,204,21,0.4)', color: '#00C8FF' }}>
                       {newlyGeneratedKey}
                     </div>
                     <div className="flex gap-2">
                       <Button 
                         onClick={() => copyToClipboard(newlyGeneratedKey)}
                         variant="ghost" 
                         className="flex-1 text-xs py-1.5 border border-[#1e293b]"
                       >
                         Copy Key
                       </Button>
                       <Button 
                         onClick={() => setNewlyGeneratedKey(null)}
                         variant="ghost" 
                         className="flex-1 text-xs py-1.5"
                       >
                         I&apos;ve saved it securely
                       </Button>
                     </div>
                  </div>
                ) : apiKey ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-3 rounded text-xs font-mono" style={{ background: 'rgba(8,18,35,0.6)', border: '1px solid rgba(0,200,255,0.2)', color: '#00C8FF' }}>
                      <span className="truncate mr-2">{isApiKeyVisible ? apiKey : maskApiKey(apiKey)}</span>
                      <button 
                        onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                        className="text-xs text-ds-muted hover:text-white transition-colors flex-shrink-0"
                      >
                        [{isApiKeyVisible ? 'Hide' : 'Show'}]
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => copyToClipboard(apiKey)}
                        variant="ghost" 
                        className="flex-1 text-xs py-1.5 border border-[#1e293b]"
                      >
                        Copy
                      </Button>
                      <Button 
                        onClick={handleGenerateApiKey} 
                        isLoading={isApiKeyLoading}
                        variant="ghost" 
                        className="flex-1 text-xs py-1.5"
                      >
                        Regenerate Key
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={handleGenerateApiKey} 
                    isLoading={isApiKeyLoading}
                    variant="ghost" 
                    className="w-full text-sm py-2"
                  >
                    Generate Secret Key
                  </Button>
                )}
              </div>

              {selectedProject && selectedProject.simulations && selectedProject.simulations.length > 0 && (
                <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Download className="w-4 h-4" style={{ color: '#00C8FF' }} />
                    <h2 className="font-bold text-white text-sm uppercase tracking-widest">Export Data</h2>
                  </div>
                  <Button 
                    onClick={handleExportReport} 
                    variant="ghost" 
                    className="w-full text-sm py-2"
                  >
                    Download JSON Report
                  </Button>
                </div>
              )}
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
                {/* ── Top System Health Summary ── */}
                {selectedProject.simulations && selectedProject.simulations.length > 0 && (() => {
                  const sims = selectedProject.simulations;
                  const fails = sims.filter(s => s.status === 'FAILED');
                  const failRate = Math.round((fails.length / sims.length) * 100);
                  const latencies = sims.map(s => s.avgLatency).sort((a,b) => a - b);
                  const p95Idx = Math.floor(latencies.length * 0.95);
                  const p95 = latencies.length > 0 ? latencies[p95Idx] : 0;
                  const lastIncident = fails.length > 0 ? new Date(fails[0].createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'None recently';
                  
                  let statusColor = '#00C8FF';
                  let statusText = 'Healthy';
                  if (failRate > 20) { statusColor = '#ff4d4d'; statusText = 'Critical'; }
                  else if (failRate > 5 || p95 > 800) { statusColor = '#f59e0b'; statusText = 'Degraded'; }
                  
                  return (
                    <div className="ds-card p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center w-12 h-12 rounded-full" style={{ background: `${statusColor}15` }}>
                          <Activity className="w-6 h-6" style={{ color: statusColor }} />
                          {statusText === 'Healthy' && (
                            <span className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900" style={{ background: statusColor }}></span>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#9AA6C4] font-bold mb-1">System Status</p>
                          <p className="text-lg font-bold" style={{ color: statusColor }}>{statusText}</p>
                        </div>
                      </div>
                      <div className="flex gap-8 text-right">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#9AA6C4] font-bold mb-1">Failure Rate</p>
                          <p className="text-lg font-mono text-white">{failRate}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#9AA6C4] font-bold mb-1">P95 Latency</p>
                          <p className="text-lg font-mono text-white">{p95.toFixed(0)}<span className="text-xs text-white/40 ml-1">ms</span></p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-[10px] uppercase tracking-widest text-[#9AA6C4] font-bold mb-1">Last Incident</p>
                          <p className="text-lg text-white/90">{lastIncident}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── Simulation Configurator ── */}
                <div className="ds-card p-8">
                  <div className="flex items-center gap-2 mb-8">
                    <Play className="w-4 h-4" style={{ color: '#00C8FF' }} />
                    <h2 className="font-bold text-white text-sm uppercase tracking-widest">
                      Configure Simulation — <span className="ds-gradient-text">{selectedProject.name}</span>
                    </h2>
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* --- FEATURE 2: AI TEST GENERATOR UI --- */}
                    <div className="p-5 rounded-xl" style={{ background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.1)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-[#00C8FF]" />
                        <h3 className="font-semibold text-sm text-white">AI Test Generator</h3>
                      </div>
                      <div className="flex gap-3">
                        <input
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          className="ds-input flex-1 text-sm bg-black/50"
                          placeholder="e.g. Test my API under heavy load..."
                        />
                        <Button 
                          id="ai-generate-btn"
                          onClick={handleAIGenerate} 
                          isLoading={isAIGenerating}
                          style={{ minWidth: '140px' }}
                        >
                          Generate
                        </Button>
                      </div>
                      <AnimatePresence>
                        {generatedConfig && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4"
                          >
                            <p className="text-xs text-[#9AA6C4] mb-3">{generatedConfig.description}</p>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                                <p className="text-[10px] uppercase text-[#9AA6C4] font-semibold mb-1">Failure Injection</p>
                                <p className="text-white font-mono">{generatedConfig.failureRate}%</p>
                              </div>
                              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                                <p className="text-[10px] uppercase text-[#9AA6C4] font-semibold mb-1">Latency Spikes</p>
                                <p className="text-white font-mono">{generatedConfig.latencySpikes}ms</p>
                              </div>
                              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                                <p className="text-[10px] uppercase text-[#9AA6C4] font-semibold mb-1">Concurrency</p>
                                <p className="text-white font-mono">{generatedConfig.concurrency} VU</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label className="ds-label">Target Endpoint URL</label>
                      <input
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        className="ds-input font-mono text-sm"
                        placeholder="https://api.yourservice.com/endpoint"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-4">
                    <Button
                      onClick={runSimulation}
                      isLoading={isSimulating}
                      className="w-full text-base py-3"
                    >
                      <Play className="w-4 h-4 mr-2" /> 
                      {isSimulating ? 'Running Simulation…' : 'Run Reliability Test'}
                    </Button>
                    
                    <AnimatePresence>
                      {isSimulating && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col gap-2 overflow-hidden"
                        >
                          <div className="flex justify-between items-center text-xs text-[#9AA6C4] font-mono">
                            <span className="flex items-center gap-2">
                              <Activity className="w-3 h-3 text-[#00C8FF] animate-pulse" />
                              Pinging {endpoint.substring(0, 25)}...
                            </span>
                            <span className={liveLatency > 600 ? 'text-[#ff4d4d]' : 'text-[#00C8FF]'}>
                              {liveLatency}ms
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-[#00C8FF]/50 to-[#00C8FF]"
                              initial={{ width: 0 }}
                              animate={{ width: `${simulationProgress}%` }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                          <div className="text-[10px] text-right font-mono text-[#00C8FF]/60">{simulationProgress}%</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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

                      {/* --- FEATURE 1: AI FAILURE ANALYSIS UI --- */}
                      <div className="flex flex-col gap-2 rounded-xl p-5 text-sm relative overflow-hidden"
                           style={{ background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.3)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5" style={{ color: '#00C8FF' }} />
                            <span className="font-bold text-[#00C8FF] text-xs uppercase tracking-widest">AI Insights</span>
                          </div>
                          {simulationResult.insight && (() => {
                            try {
                              const data = JSON.parse(simulationResult.insight);
                              return (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00C8FF]/10 border border-[#00C8FF]/20">
                                  <Sparkles className="w-3 h-3 text-[#00C8FF]" />
                                  <span className="text-[10px] font-mono text-[#00C8FF]">{data.confidence}% Confidence</span>
                                </div>
                              );
                            } catch (e) { return null; }
                          })()}
                        </div>
                        
                        {(() => {
                          try {
                            if (!simulationResult.insight) return null;
                            const data = JSON.parse(simulationResult.insight);
                            return (
                              <div className="mt-1 flex flex-col gap-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                                    <span className="text-[10px] text-[#ff4d4d] uppercase font-bold tracking-wider mb-1 block">Root Cause Analysis</span>
                                    <p className="text-white/90 text-xs leading-relaxed">{data.rootCause}</p>
                                  </div>
                                  <div className="bg-black/30 p-3 rounded-lg border border-[#00C8FF]/10">
                                    <span className="text-[10px] text-[#00C8FF] uppercase font-bold tracking-wider mb-1 block">Suggested Fix</span>
                                    <p className="text-white/90 text-xs leading-relaxed">{data.suggestion}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          } catch (e) {
                            return <p className="leading-relaxed" style={{ color: '#9AA6C4' }}>{simulationResult.insight}</p>;
                          }
                        })()}
                      </div>

                      {/* decorative glow */}
                      <div className="ds-glow-orb w-48 h-48 -bottom-16 -right-16" style={{ opacity: 0.12 }} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Data Visualization ── */}
                {selectedProject?.simulations && selectedProject.simulations.length > 0 && (
                  <>
                    {/* --- FEATURE 3: AI SUMMARY UI --- */}
                    <div className="ds-card p-6 mb-5" style={{ background: 'linear-gradient(to right, rgba(0,200,255,0.05), rgba(0,0,0,0))' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-[#00C8FF]" />
                        <h3 className="font-bold text-white text-sm uppercase tracking-widest">AI Portfolio Analysis</h3>
                      </div>
                      {isGeneratingSummary ? (
                        <div className="flex items-center gap-3 text-sm text-[#9AA6C4]">
                          <Loader2 className="w-4 h-4 animate-spin text-[#00C8FF]" /> Generating insights across {selectedProject.simulations.length} runs...
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed text-[#9AA6C4]">{aiSummary}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="ds-card p-6">
                      <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-4">Latency Trend</h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <XAxis dataKey="name" stroke="#9AA6C4" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9AA6C4" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px' }}
                              itemStyle={{ color: '#00C8FF' }}
                            />
                            <Line type="monotone" dataKey="latency" stroke="#00C8FF" strokeWidth={2} dot={{ r: 3, fill: '#0F172A', stroke: '#00C8FF', strokeWidth: 2 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="ds-card p-6">
                      <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-4">Reliability Split</h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px' }}
                              itemStyle={{ color: '#fff' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-2">
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: '#00C8FF' }}></div><span className="text-xs text-slate-300">Success ({successCount})</span></div>
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: '#ff4d4d' }}></div><span className="text-xs text-slate-300">Failed ({failureCount})</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </>
                )}

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
                    {selectedProject.simulations?.slice().reverse().map((sim: Simulation) => (
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
