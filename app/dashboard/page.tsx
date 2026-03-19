'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Info, Activity, Database, CheckCircle, XCircle } from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  
  // Simulation form
  const [endpoint, setEndpoint] = useState('https://api.example.com/v1/users');
  const [failureRate, setFailureRate] = useState(5);
  const [latency, setLatency] = useState(100);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status]);

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data);
    if (data.length > 0 && !selectedProject) {
      setSelectedProject(data[0]);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProjectName, description: newProjectDesc }),
    });
    if (res.ok) {
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects();
    }
  };

  const runSimulation = async () => {
    if (!selectedProject) return;
    setIsSimulating(true);
    setSimulationResult(null);

    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: selectedProject.id,
        endpoint,
        failureRate,
        latency,
      }),
    });
    const data = await res.json();
    setSimulationResult(data);
    setIsSimulating(false);
    fetchProjects(); // Refresh simulations
  };

  if (status === 'loading') return null;

  return (
    <main className="min-h-screen bg-[#05070f] text-white">
      <Navbar />
      
      <div className="pt-24 max-w-7xl mx-auto px-6 grid grid-cols-12 gap-8 pb-12">
        {/* Left: Projects Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                My Projects
              </h2>
            </div>
            
            <form onSubmit={createProject} className="space-y-3 mb-6">
              <input 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project Name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-blue-500/50 outline-none"
                required
              />
              <button 
                type="submit"
                className="w-full bg-white/10 border border-white/10 hover:bg-white/15 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Project
              </button>
            </form>

            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedProject?.id === p.id 
                      ? 'bg-blue-500/20 border-blue-500/50' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-xs text-white/50 truncate mt-1">{p.description || 'No description'}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Simulation Area */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {!selectedProject ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-20 flex flex-col items-center justify-center text-center opacity-50">
              <Activity className="w-12 h-12 mb-4" />
              <p>Create or select a project to start simulations</p>
            </div>
          ) : (
            <>
              {/* Configuration */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Play className="w-5 h-5 text-cyan-400" />
                  Run Simulation: {selectedProject.name}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-2 text-white/50 uppercase">Endpoint URL</label>
                    <input 
                      value={endpoint}
                      onChange={(e) => setEndpoint(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-500/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 text-white/50 uppercase">Failure Injection (%)</label>
                    <input 
                      type="number"
                      value={failureRate}
                      onChange={(e) => setFailureRate(parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-500/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 text-white/50 uppercase">Simulated Latency (ms)</label>
                    <input 
                      type="number"
                      value={latency}
                      onChange={(e) => setLatency(parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-500/50 outline-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="mt-8 w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-4 rounded-xl font-bold tracking-wide hover:scale-[1.01] transition-all disabled:opacity-50"
                >
                  {isSimulating ? 'SIMULATING...' : 'RUN SECURITY TEST'}
                </button>
              </div>

              {/* Real-time Results */}
              <AnimatePresence>
                {simulationResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Detailed Results</p>
                        <div className="flex items-center gap-3">
                          {simulationResult.status === 'SUCCESS' ? (
                            <CheckCircle className="w-8 h-8 text-green-400" />
                          ) : (
                            <XCircle className="w-8 h-8 text-red-400" />
                          )}
                          <h3 className="text-2xl font-bold">{simulationResult.status}</h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">P95 Latency</p>
                        <p className="text-3xl font-mono text-cyan-400">{simulationResult.avgLatency.toFixed(0)}<span className="text-sm">ms</span></p>
                      </div>
                    </div>

                    <div className="mt-8 bg-black/40 border border-white/5 rounded-xl p-4 flex gap-3 text-sm italic text-white/70">
                      <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      {simulationResult.insight}
                    </div>

                    {/* Faint grid background for the card */}
                    <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none">
                      <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* History */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                 <div className="p-6 border-b border-white/10">
                    <h3 className="font-bold flex items-center gap-2">Simulation History</h3>
                 </div>
                 <div className="divide-y divide-white/10 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {selectedProject.simulations?.slice().reverse().map((sim) => (
                       <div key={sim.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                          <div>
                             <p className="text-sm font-mono truncate max-w-[200px]">{sim.endpoint}</p>
                             <p className="text-[10px] text-white/30">{new Date(sim.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-6">
                             <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                sim.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                             }`}>
                                {sim.status}
                             </span>
                             <p className="text-sm font-mono w-16 text-right">{sim.avgLatency.toFixed(0)}ms</p>
                          </div>
                       </div>
                    ))}
                    {(!selectedProject.simulations || selectedProject.simulations.length === 0) && (
                       <p className="p-8 text-center text-white/30 text-sm">No simulations recorded yet.</p>
                    )}
                 </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
