"use client";

import { Plus, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Project } from "./types";

interface ProjectsPanelProps {
  projects: Project[];
  selectedProject: Project | null;
  newProjectName: string;
  isCreating: boolean;
  projectMenuOpen: string | null;
  onNewProjectNameChange: (name: string) => void;
  onCreateProject: (e: React.FormEvent) => void;
  onSelectProject: (project: Project) => void;
  onToggleProjectMenu: (projectId: string) => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

export function ProjectsPanel({
  projects,
  selectedProject,
  newProjectName,
  isCreating,
  projectMenuOpen,
  onNewProjectNameChange,
  onCreateProject,
  onSelectProject,
  onToggleProjectMenu,
  onRenameProject,
  onDeleteProject,
}: ProjectsPanelProps) {
  return (
    <div className="ds-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-4 h-4" style={{ color: "#00C8FF" }} />
        <h2 className="font-bold text-white text-sm uppercase tracking-widest">
          Projects
        </h2>
      </div>

      <form onSubmit={onCreateProject} className="flex gap-2 mb-5">
        <input
          value={newProjectName}
          onChange={(e) => onNewProjectNameChange(e.target.value)}
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
          style={{
            background: "rgba(0,200,255,0.15)",
            border: "1px solid rgba(0,200,255,0.30)",
          }}
        >
          {!isCreating && (
            <Plus className="w-5 h-5" style={{ color: "#00C8FF" }} />
          )}
        </Button>
      </form>

      <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
        {projects.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: "#9AA6C4" }}>
            No projects yet. Create one above.
          </p>
        )}
        {projects.map((p) => (
          <div key={p.id} className="relative">
            <button
              onClick={() => onSelectProject(p)}
              className="w-full text-left px-4 py-3 rounded-xl border transition-all"
              style={
                selectedProject?.id === p.id
                  ? {
                      background: "rgba(0,200,255,0.12)",
                      borderColor: "rgba(0,200,255,0.45)",
                      color: "#fff",
                    }
                  : {
                      background: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(0,200,255,0.10)",
                      color: "#9AA6C4",
                    }
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-white truncate">
                    {p.name}
                  </p>
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: "#9AA6C4" }}
                  >
                    {p.simulations?.length || 0} simulation
                    {p.simulations?.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleProjectMenu(p.id);
                    }}
                    className="px-2 py-1 rounded text-sm text-[#9AA6C4] hover:text-white"
                    aria-label="project actions"
                  >
                    •••
                  </button>
                </div>
              </div>
            </button>

            {projectMenuOpen === p.id && (
              <div
                className="absolute right-2 top-3 z-20 bg-zinc-900 border rounded shadow-md"
                style={{ minWidth: 160 }}
              >
                <button
                  className="w-full text-left px-3 py-2 text-sm text-[#9AA6C4] hover:bg-zinc-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameProject(p);
                  }}
                >
                  Rename
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-zinc-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(p);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
