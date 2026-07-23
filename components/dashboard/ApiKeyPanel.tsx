"use client";

import { Key, Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Project } from "./types";
import { maskApiKey } from "./simulationHelpers";

interface ApiKeyPanelProps {
  apiKey: string | null;
  newlyGeneratedKey: string | null;
  isApiKeyVisible: boolean;
  isApiKeyLoading: boolean;
  selectedProject: Project | null;
  onToggleVisibility: () => void;
  onCopyKey: (key: string) => void;
  onGenerateKey: () => void;
  onDismissNewKey: () => void;
  onExportReport: () => void;
}

export function ApiKeyPanel({
  apiKey,
  newlyGeneratedKey,
  isApiKeyVisible,
  isApiKeyLoading,
  selectedProject,
  onToggleVisibility,
  onCopyKey,
  onGenerateKey,
  onDismissNewKey,
  onExportReport,
}: ApiKeyPanelProps) {
  const hasSimulations =
    selectedProject?.simulations && selectedProject.simulations.length > 0;

  return (
    <div className="ds-card p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Key className="w-4 h-4" style={{ color: "#00C8FF" }} />
        <h2 className="font-bold text-white text-sm uppercase tracking-widest">
          Developer API
        </h2>
      </div>
      <p className="text-xs mb-4" style={{ color: "#9AA6C4" }}>
        Use your API key to integrate API Reliability Lab directly into your
        CI/CD pipelines.
      </p>

      <div className="space-y-3">
        {apiKey ? (
          <div className="flex flex-col gap-2">
            {newlyGeneratedKey && (
              <p className="text-xs text-yellow-400 mb-1">
                Copy and store this key securely. You won&apos;t be able to see
                it again.
              </p>
            )}
            <div
              className="flex items-center justify-between p-3 rounded text-xs font-mono"
              style={{
                background: "rgba(8,18,35,0.6)",
                border: "1px solid rgba(0,200,255,0.2)",
                color: "#00C8FF",
              }}
            >
              <span className="truncate mr-2">
                {isApiKeyVisible ? apiKey : maskApiKey(apiKey)}
              </span>
              <button
                onClick={onToggleVisibility}
                title={isApiKeyVisible ? "Hide API Key" : "Show API Key"}
                className="text-xs text-ds-muted hover:text-white transition-colors flex-shrink-0"
              >
                <span className="inline-flex items-center gap-1">
                  {isApiKeyVisible ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  [{isApiKeyVisible ? "Hide" : "Show"}]
                </span>
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onCopyKey(apiKey)}
                variant="ghost"
                className="flex-1 text-xs py-1.5 border border-[#1e293b]"
              >
                Copy
              </Button>
              {newlyGeneratedKey ? (
                <Button
                  onClick={onDismissNewKey}
                  variant="ghost"
                  className="flex-1 text-xs py-1.5"
                >
                  I&apos;ve saved it securely
                </Button>
              ) : (
                <Button
                  onClick={onGenerateKey}
                  isLoading={isApiKeyLoading}
                  variant="ghost"
                  className="flex-1 text-xs py-1.5"
                >
                  Regenerate Key
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Button
            onClick={onGenerateKey}
            isLoading={isApiKeyLoading}
            variant="ghost"
            className="w-full text-sm py-2"
          >
            Generate Secret Key
          </Button>
        )}
      </div>

      {hasSimulations && (
        <div
          className="mt-6 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-4 h-4" style={{ color: "#00C8FF" }} />
            <h2 className="font-bold text-white text-sm uppercase tracking-widest">
              Export Data
            </h2>
          </div>
          <Button
            onClick={onExportReport}
            variant="ghost"
            className="w-full text-sm py-2"
          >
            Download JSON Report
          </Button>
        </div>
      )}
    </div>
  );
}
