"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Activity, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { DashboardHeader } from "./DashboardHeader";
import { ProjectsPanel } from "./ProjectsPanel";
import { ProbeRunnerPanel } from "./ProbeRunnerPanel";
import { HistoryChartsPanel } from "./HistoryChartsPanel";
import { AiSummaryPanel } from "./AiSummaryPanel";
import { ApiKeyPanel } from "./ApiKeyPanel";
import type {
  FetchProjectsOptions,
  HttpMethod,
  LoadMetrics,
  Project,
  ProjectSummary,
  RedisObservability,
  Simulation,
} from "./types";
import {
  getSimulationAI,
  readJsonSafe,
  getErrorMessage,
  normalizeProject,
  getProjectNameKey,
  mergeProjectIntoList,
} from "./simulationHelpers";

const HTTPBIN_GET = "https://httpbin.org/get";
const HTTPBIN_POST = "https://httpbin.org/post";

function buildProbePayload(
  projectId: string,
  endpoint: string,
  method: HttpMethod,
  concurrency: number,
  headerKey: string,
  headerValue: string,
  requestBody: string,
) {
  const payload: Record<string, unknown> = {
    projectId,
    endpoint,
    method,
    concurrency: String(concurrency),
  };

  if (headerKey.trim() && headerValue.trim()) {
    payload.headers = JSON.stringify({ [headerKey.trim()]: headerValue.trim() });
  }

  if (method === "POST" && requestBody.trim()) {
    payload.body = requestBody;
  }

  return payload;
}

export default function DashboardClient({
  user,
}: {
  user: { isPaid: boolean; isAdmin: boolean } | null;
}) {
  const planLabel = user?.isAdmin
    ? "Admin"
    : user?.isPaid
      ? "Pro · 100 req/min"
      : "Free · 10 req/min";
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [endpoint, setEndpoint] = useState(HTTPBIN_GET);
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [concurrency, setConcurrency] = useState(1);
  const [headerKey, setHeaderKey] = useState("");
  const [headerValue, setHeaderValue] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<Simulation | null>(
    null,
  );
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [liveLatency, setLiveLatency] = useState(0);
  const [liveLoadMetrics, setLiveLoadMetrics] =
    useState<Partial<LoadMetrics> | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const eventSourceRef = useRef<EventSource | null>(null);

  const [aiPrompt, setAiPrompt] = useState("");
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<{
    concurrency: number;
    description: string;
  } | null>(null);

  const [aiSummary, setAiSummary] = useState<ProjectSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(
    null,
  );
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [observability, setObservability] = useState<RedisObservability | null>(
    null,
  );
  const [projectMenuOpen, setProjectMenuOpen] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API Key copied to clipboard!");
  };

  const fetchProjects = useCallback(
    async (options: FetchProjectsOptions = {}) => {
      try {
        const res = await fetch("/api/projects");
        const data = await readJsonSafe(res);

        if (!res.ok) {
          const message =
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof data.error === "string"
              ? data.error
              : "Failed to load projects.";
          toast.error(message);
          return;
        }

        if (Array.isArray(data)) {
          let normalized = data
            .map(normalizeProject)
            .filter((project): project is Project => Boolean(project));

          if (
            options.ensureProject &&
            !normalized.some(
              (project) => project.id === options.ensureProject?.id,
            )
          ) {
            normalized = mergeProjectIntoList(
              normalized,
              options.ensureProject,
            );
          }

          setProjects(normalized);
          setSelectedProject((current) => {
            if (!normalized.length) return null;
            if (options.selectProjectId) {
              return (
                normalized.find((p) => p.id === options.selectProjectId) ??
                options.ensureProject ??
                normalized[0]
              );
            }
            if (!current) return normalized[0];

            const refreshedCurrent = normalized.find((p) => p.id === current.id);
            return refreshedCurrent ?? normalized[0];
          });
          return normalized;
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
        toast.error("Network error while loading projects.");
      }

      return null;
    },
    [],
  );

  const fetchApiKey = async () => {
    try {
      const res = await fetch("/api/user/api-key");
      const data = await res.json();
      if (res.ok && data.apiKey) {
        setApiKey(data.apiKey);
      }
    } catch (e) {
      console.error("Failed to fetch api key background", e);
    }
  };

  const fetchObservability = async () => {
    try {
      const res = await fetch("/api/metrics/redis");
      const data = await readJsonSafe(res);
      if (res.ok && data && typeof data === "object") {
        setObservability(data as RedisObservability);
      }
    } catch (error) {
      console.error("Failed to fetch observability metrics", error);
    }
  };

  const handleGenerateApiKey = async () => {
    setIsApiKeyLoading(true);
    setNewlyGeneratedKey(null);
    try {
      const res = await fetch("/api/user/generate-api-key", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.apiKey) {
        setApiKey(data.apiKey);
        setNewlyGeneratedKey(data.apiKey);
        setIsApiKeyVisible(false);
        toast.success("API Key generated successfully!");

        const blob = new Blob(
          [
            `API Reliability Lab API Key\n\nYour Secret Key:\n${data.apiKey}\n\nKeep this key secure. Do not share it.`,
          ],
          { type: "text/plain" },
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "api-reliability-lab-api-key.txt";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        toast.error(data.error || "Failed to generate API key");
      }
    } catch {
      toast.error("Error connecting to server.");
    } finally {
      setIsApiKeyLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!selectedProject) return;
    try {
      toast.loading("Exporting report...", { id: "export" });
      const res = await fetch(
        `/api/simulations/export?projectId=${selectedProject.id}`,
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Export failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${selectedProject.name.replace(/\s+/g, "_")}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Report exported successfully!", { id: "export" });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to export report.";
      toast.error(message, { id: "export" });
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProjects();
      fetchApiKey();
      fetchObservability();
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const promptParams = urlParams.get("prompt");
        if (promptParams) {
          setAiPrompt(promptParams);
          setTimeout(() => {
            const btn = document.getElementById("ai-generate-btn");
            if (btn) btn.click();
          }, 1000);
        }
      }
    }
  }, [status, router, fetchProjects]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const id = setInterval(() => {
      fetchObservability();
    }, 15000);
    return () => clearInterval(id);
  }, [status]);

  const handleMethodChange = (nextMethod: HttpMethod) => {
    setMethod(nextMethod);
    if (nextMethod === "POST" && endpoint === HTTPBIN_GET) {
      setEndpoint(HTTPBIN_POST);
    } else if (nextMethod === "GET" && endpoint === HTTPBIN_POST) {
      setEndpoint(HTTPBIN_GET);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newProjectName.trim();
    if (!trimmedName || isCreating) return;

    const newProjectNameKey = getProjectNameKey(trimmedName);
    const hasLocalDuplicate = projects.some(
      (project) => getProjectNameKey(project.name) === newProjectNameKey,
    );

    if (hasLocalDuplicate) {
      toast.error("A project with this name already exists.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const data = await readJsonSafe(res);

      if (!res.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Failed to create project.";
        toast.error(message);
        return;
      }

      const createdProject = normalizeProject(data);

      if (!createdProject) {
        toast.error(
          "Project created, but response was invalid. Refreshing list...",
        );
        setNewProjectName("");
        await fetchProjects();
        return;
      }

      setProjects((prev) => mergeProjectIntoList(prev, createdProject));
      setSelectedProject(createdProject);
      setNewProjectName("");
      toast.success("Project created successfully.");

      await fetchProjects({
        ensureProject: createdProject,
        selectProjectId: createdProject.id,
      });

      try {
        const res2 = await fetch("/api/projects");
        const serverData = await readJsonSafe(res2);
        if (Array.isArray(serverData)) {
          const serverProjects = serverData
            .map(normalizeProject)
            .filter((project): project is Project => Boolean(project));
          const sameName = serverProjects.filter(
            (project) =>
              getProjectNameKey(project.name) ===
              getProjectNameKey(createdProject.name),
          );

          if (sameName.length > 1) {
            setProjects((prev) =>
              prev.filter((p) => p.id !== createdProject.id),
            );
            setSelectedProject((current) => {
              if (current?.id === createdProject.id)
                return serverProjects[0] ?? null;
              return current;
            });
            toast.error(
              "Project name conflict detected on server. Please pick a different name.",
            );
            void fetchProjects();
            return;
          }
        }
      } catch (e) {
        console.warn("Cross-validation of created project failed", e);
      }
    } catch (error) {
      console.error("Failed to create project", error);
      toast.error("Network error while creating project.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameProject = async (project: Project) => {
    setProjectMenuOpen(null);
    const newName = window.prompt("Rename project:", project.name);
    if (!newName) return;
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error("Project name cannot be empty.");
      return;
    }
    const renamedProjectNameKey = getProjectNameKey(trimmed);
    if (
      projects.some(
        (pr) =>
          pr.id !== project.id &&
          getProjectNameKey(pr.name) === renamedProjectNameKey,
      )
    ) {
      toast.error("A project with this name already exists.");
      return;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id, name: trimmed }),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) {
        toast.error(getErrorMessage(data, "Failed to rename project."));
        return;
      }
      setProjects((prev) =>
        prev.map((pr) => (pr.id === project.id ? { ...pr, name: trimmed } : pr)),
      );
      setSelectedProject((cur) =>
        cur && cur.id === project.id ? { ...cur, name: trimmed } : cur,
      );
      toast.success("Project renamed.");
    } catch (e) {
      console.error(e);
      toast.error("Network error while renaming project.");
    }
  };

  const handleDeleteProject = async (project: Project) => {
    setProjectMenuOpen(null);
    const ok = window.confirm(
      `Delete project "${project.name}"? This cannot be undone.`,
    );
    if (!ok) return;

    const before = projects;
    setProjects((prev) => prev.filter((pr) => pr.id !== project.id));
    if (selectedProject?.id === project.id) setSelectedProject(null);

    try {
      const res = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id }),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) {
        toast.error(getErrorMessage(data, "Failed to delete project."));
        setProjects(before);
        return;
      }
      toast.success("Project deleted.");
    } catch (e) {
      console.error(e);
      toast.error("Network error while deleting project.");
      setProjects(before);
    }
  };

  const runSimulation = async () => {
    if (!selectedProject) return;

    const probePayload = buildProbePayload(
      selectedProject.id,
      endpoint,
      method,
      concurrency,
      headerKey,
      headerValue,
      requestBody,
    );

    const runSimulationFallback = async () => {
      try {
        setStatusMessage("Fallback mode: running standard simulation...");
        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(probePayload),
        });
        const data = await readJsonSafe(res);

        if (!res.ok) {
          const message =
            data &&
            typeof data === "object" &&
            "message" in data &&
            typeof data.message === "string"
              ? data.message
              : "Simulation failed to start";
          const detail =
            data &&
            typeof data === "object" &&
            "detail" in data &&
            typeof data.detail === "string"
              ? data.detail
              : null;
          toast.error(detail ? `${message} (${detail})` : message);
          setIsSimulating(false);
          return;
        }

        setSimulationProgress(100);
        if (data && typeof data === "object") {
          const result = data as Simulation;
          setSimulationResult(result);
          const metrics = result.loadMetrics ?? result.ai?.loadMetrics;
          if (metrics) {
            setLiveLoadMetrics(metrics);
          }
        }
        setIsSimulating(false);
        setStatusMessage("Simulation completed.");
        toast.success("Simulation completed successfully!");
        fetchProjects();
      } catch {
        setIsSimulating(false);
        setStatusMessage("Simulation failed.");
        toast.error("Network error during simulation.");
      }
    };

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsSimulating(true);
    setSimulationResult(null);
    setSimulationProgress(0);
    setLiveLatency(0);
    setLiveLoadMetrics(null);
    setStatusMessage("Initializing simulation...");

    const params = new URLSearchParams({
      projectId: probePayload.projectId as string,
      endpoint: probePayload.endpoint as string,
      method: probePayload.method as string,
      concurrency: probePayload.concurrency as string,
    });

    if (probePayload.headers) {
      params.set("headers", probePayload.headers as string);
    }
    if (probePayload.body) {
      params.set("body", probePayload.body as string);
    }

    const streamUrl = `/api/simulate/stream?${params.toString()}`;
    let completed = false;

    try {
      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener("progress", (event) => {
        try {
          const payload = JSON.parse((event as MessageEvent).data) as {
            progressPercent?: number;
          };
          if (typeof payload.progressPercent === "number") {
            setSimulationProgress(payload.progressPercent);
          }
        } catch {
          // Ignore malformed event payloads.
        }
      });

      eventSource.addEventListener("latency", (event) => {
        try {
          const payload = JSON.parse((event as MessageEvent).data) as {
            value?: number;
            p50?: number;
            p95?: number;
            errorRatePercent?: number;
            concurrency?: number;
          };
          if (typeof payload.value === "number") {
            setLiveLatency(payload.value);
          }
          if (
            payload.p50 != null ||
            payload.p95 != null ||
            payload.errorRatePercent != null
          ) {
            setLiveLoadMetrics({
              p50Ms: payload.p50,
              p95Ms: payload.p95,
              errorRatePercent: payload.errorRatePercent,
              concurrency: payload.concurrency ?? concurrency,
            });
          }
        } catch {
          // Ignore malformed event payloads.
        }
      });

      eventSource.addEventListener("status", (event) => {
        try {
          const payload = JSON.parse((event as MessageEvent).data) as {
            message?: string;
          };
          if (payload.message) {
            setStatusMessage(payload.message);
          }
        } catch {
          // Ignore malformed event payloads.
        }
      });

      eventSource.addEventListener("complete", (event) => {
        try {
          const payload = JSON.parse((event as MessageEvent).data) as
            | { simulation?: Simulation }
            | Simulation;
          const simulation = (
            "simulation" in payload ? payload.simulation : payload
          ) as Simulation;
          completed = true;
          setSimulationProgress(100);
          if (simulation) {
            setSimulationResult(simulation);
            setLiveLatency(Math.round(simulation.avgLatency ?? 0));
            const metrics =
              simulation.loadMetrics ?? simulation.ai?.loadMetrics;
            if (metrics) {
              setLiveLoadMetrics(metrics);
            }
          }
          setStatusMessage("Simulation completed.");
          eventSource.close();
          eventSourceRef.current = null;
          setIsSimulating(false);
          toast.success("Simulation completed successfully!");
          fetchProjects();
        } catch {
          eventSource.close();
          eventSourceRef.current = null;
          runSimulationFallback();
        }
      });

      eventSource.addEventListener("error", () => {
        if (completed) return;
        eventSource.close();
        eventSourceRef.current = null;
        runSimulationFallback();
      });
    } catch {
      await runSimulationFallback();
    }
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAIGenerating(true);
    setGeneratedConfig(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const promptLower = aiPrompt.toLowerCase();
    const suggestedConcurrency =
      promptLower.includes("spike") || promptLower.includes("heavy") ? 10 : 3;

    setGeneratedConfig({
      concurrency: suggestedConcurrency,
      description: `Suggested probe notes: try about ${suggestedConcurrency} concurrent ${method} requests and watch latency trends. (This helper does not inject failures — probes are real HTTP requests.)`,
    });
    setIsAIGenerating(false);
  };

  useEffect(() => {
    if (
      selectedProject?.simulations &&
      selectedProject.simulations.length > 0
    ) {
      const projectId = selectedProject.id;
      const simsSnapshot = selectedProject.simulations ?? [];
      setIsGeneratingSummary(true);

      const fetchSummary = async () => {
        try {
          const res = await fetch(
            `/api/simulations/summary?projectId=${projectId}`,
          );
          if (!res.ok) throw new Error("Summary request failed");
          const data = await res.json();
          setAiSummary(data);
        } catch {
          const sims = simsSnapshot;
          if (!sims.length) {
            setAiSummary({
              overallHealth: "No simulation data available yet.",
              majorRisks: [
                "Insufficient telemetry to assess reliability risks.",
              ],
              recommendedActions: [
                "Run multiple simulations to generate reliability insights.",
              ],
            });
            return;
          }
          const avgLat =
            sims.reduce((acc, curr) => acc + curr.avgLatency, 0) / sims.length;
          const failureCount = sims.filter((s) => s.status === "FAILED").length;
          const failurePerc = (failureCount / sims.length) * 100;

          setAiSummary({
            overallHealth:
              failurePerc > 30
                ? "Critical reliability degradation with elevated failure concentration."
                : avgLat > 500
                  ? "Performance risk present due to elevated average latency."
                  : "Healthy reliability posture with stable baseline performance.",
            majorRisks: [
              `Failure ratio: ${failurePerc.toFixed(1)}% over ${sims.length} runs`,
              `Average latency: ${avgLat.toFixed(0)}ms`,
            ],
            recommendedActions: [
              "Enable deeper endpoint-level tracing and alert thresholds.",
              "Run periodic stress tests to detect degradation patterns earlier.",
            ],
          });
        } finally {
          setIsGeneratingSummary(false);
        }
      };

      fetchSummary();
    } else {
      setAiSummary(null);
    }
  }, [selectedProject?.id, selectedProject?.simulations]);

  const latestProjectSimulation = selectedProject?.simulations?.length
    ? selectedProject.simulations
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0]
    : null;
  const primarySimulation = simulationResult ?? latestProjectSimulation ?? null;
  const primaryAIData = primarySimulation
    ? getSimulationAI(primarySimulation)
    : null;

  const orderedSimulations = selectedProject?.simulations
    ? selectedProject.simulations
        .slice()
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
    : [];

  const lastFiveSimulations = orderedSimulations.slice(-5);
  const startRunNumber = Math.max(
    1,
    orderedSimulations.length - lastFiveSimulations.length + 1,
  );

  const chartData = lastFiveSimulations.map((item, index) => ({
    run: `Run ${startRunNumber + index}`,
    latency: item.avgLatency ?? item.latency,
  }));

  const validChartData = chartData.filter(
    (item) => item.latency !== null && item.latency !== undefined,
  );

  const successCount =
    selectedProject?.simulations?.filter((s) => s.status === "SUCCESS")
      .length || 0;
  const failureCount =
    selectedProject?.simulations?.filter((s) => s.status === "FAILED")
      .length || 0;

  const pieData = [
    { name: "Success", value: successCount },
    { name: "Failure", value: failureCount },
  ];

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#00C8FF" }}
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="ds-glow-orb w-[800px] h-[600px] top-[-200px] right-[-200px]"
          style={{ opacity: 0.15 }}
        />
      </div>

      <div className="pt-24 max-w-7xl mx-auto px-6 pb-16">
        <DashboardHeader
          userName={session?.user?.name || session?.user?.email}
          planLabel={planLabel}
          showUpgradeLink={!user?.isPaid && !user?.isAdmin}
        />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <ProjectsPanel
              projects={projects}
              selectedProject={selectedProject}
              newProjectName={newProjectName}
              isCreating={isCreating}
              projectMenuOpen={projectMenuOpen}
              onNewProjectNameChange={setNewProjectName}
              onCreateProject={createProject}
              onSelectProject={(p) => {
                setSelectedProject(p);
                setSimulationResult(null);
                setLiveLoadMetrics(null);
              }}
              onToggleProjectMenu={(id) =>
                setProjectMenuOpen((prev) => (prev === id ? null : id))
              }
              onRenameProject={handleRenameProject}
              onDeleteProject={handleDeleteProject}
            />

            <ApiKeyPanel
              apiKey={apiKey}
              newlyGeneratedKey={newlyGeneratedKey}
              isApiKeyVisible={isApiKeyVisible}
              isApiKeyLoading={isApiKeyLoading}
              selectedProject={selectedProject}
              onToggleVisibility={() => setIsApiKeyVisible((v) => !v)}
              onCopyKey={copyToClipboard}
              onGenerateKey={handleGenerateApiKey}
              onDismissNewKey={() => {
                setIsApiKeyVisible(false);
                setNewlyGeneratedKey(null);
                void fetchApiKey();
              }}
              onExportReport={handleExportReport}
            />
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-5">
            {!selectedProject ? (
              <div className="ds-card p-20 flex flex-col items-center justify-center text-center">
                <Activity
                  className="w-10 h-10 mb-4"
                  style={{ color: "rgba(0,200,255,0.4)" }}
                />
                <p className="font-semibold text-white mb-1">
                  No project selected
                </p>
                <p className="text-sm" style={{ color: "#9AA6C4" }}>
                  Create or select a project to run simulations.
                </p>
              </div>
            ) : (
              <>
                <ProbeRunnerPanel
                  projectName={selectedProject.name}
                  endpoint={endpoint}
                  method={method}
                  concurrency={concurrency}
                  headerKey={headerKey}
                  headerValue={headerValue}
                  requestBody={requestBody}
                  aiPrompt={aiPrompt}
                  isAIGenerating={isAIGenerating}
                  generatedConfig={generatedConfig}
                  isSimulating={isSimulating}
                  simulationProgress={simulationProgress}
                  liveLatency={liveLatency}
                  statusMessage={statusMessage}
                  simulationResult={simulationResult}
                  liveLoadMetrics={liveLoadMetrics}
                  onEndpointChange={setEndpoint}
                  onMethodChange={handleMethodChange}
                  onConcurrencyChange={setConcurrency}
                  onHeaderKeyChange={setHeaderKey}
                  onHeaderValueChange={setHeaderValue}
                  onRequestBodyChange={setRequestBody}
                  onAiPromptChange={setAiPrompt}
                  onAIGenerate={handleAIGenerate}
                  onRunSimulation={runSimulation}
                />

                {selectedProject.simulations &&
                  selectedProject.simulations.length > 0 && (
                    <AiSummaryPanel
                      aiSummary={aiSummary}
                      isGeneratingSummary={isGeneratingSummary}
                      primaryAIData={primaryAIData}
                      simulationCount={selectedProject.simulations.length}
                    />
                  )}

                <HistoryChartsPanel
                  selectedProject={selectedProject}
                  observability={observability}
                  validChartData={validChartData}
                  pieData={pieData}
                  successCount={successCount}
                  failureCount={failureCount}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
