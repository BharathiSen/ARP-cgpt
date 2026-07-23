"use client";

import { motion } from "framer-motion";
import { Terminal, Copy, Check, Info, KeyRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const DEMO_CURL = `curl -X POST https://arp-cgpt.vercel.app/api/simulate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"projectId":"YOUR_PROJECT_ID","endpoint":"https://httpbin.org/get"}'`;

export default function DocsSection() {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(DEMO_CURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="docs" className="ds-section">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="ds-badge mb-5"
          >
            API Documentation
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="ds-heading text-4xl md:text-5xl mb-6"
          >
            Built for{" "}
            <span className="ds-gradient-text italic">Engineers.</span>
            <br />
            Probe an endpoint in minutes.
          </motion.h2>
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "#9AA6C4" }}
          >
            Authenticate with your API key, pass a project id you own, and a
            public https endpoint. The API enqueues a probe (or use the
            dashboard SSE stream for live progress).
          </p>

          <div className="flex flex-wrap gap-3">
            <div className="ds-badge">
              <Info className="w-3.5 h-3.5" /> REST API
            </div>
            <div className="ds-badge">
              <KeyRound className="w-3.5 h-3.5" /> Bearer API keys
            </div>
            <div className="ds-badge">
              <Terminal className="w-3.5 h-3.5" /> curl-friendly
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Button href="/login" className="text-sm">
              Get API Key →
            </Button>
            <Button variant="ghost" href="/#docs" className="text-sm">
              See example
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="ds-card overflow-hidden"
        >
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{
              background: "rgba(0,0,0,0.30)",
              borderBottom: "1px solid rgba(0,200,255,0.10)",
            }}
          >
            <div className="flex gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "rgba(255,100,100,0.5)" }}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "rgba(255,200,50,0.5)" }}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "rgba(0,200,100,0.5)" }}
              />
            </div>
            <span
              className="text-[10px] font-mono font-bold tracking-widest"
              style={{ color: "rgba(0,200,255,0.40)" }}
            >
              POST /api/simulate
            </span>
            <button
              onClick={copyCode}
              className="p-1.5 rounded-lg transition-all"
              style={{
                background: "rgba(0,200,255,0.08)",
                border: "1px solid rgba(0,200,255,0.15)",
              }}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" style={{ color: "#00C8FF" }} />
              ) : (
                <Copy className="w-3.5 h-3.5" style={{ color: "#9AA6C4" }} />
              )}
            </button>
          </div>

          <pre className="p-7 font-mono text-[13px] leading-7 overflow-x-auto">
            <span style={{ color: "#4DEBFF" }}>curl</span>
            <span style={{ color: "#9AA6C4" }}> -X POST </span>
            <span style={{ color: "#fff" }}>
              https://arp-cgpt.vercel.app/api/simulate \{"\n"}
            </span>
            {"  "}
            <span style={{ color: "#9AA6C4" }}>-H </span>
            <span style={{ color: "#4DEBFF" }}>
              &quot;Authorization: Bearer YOUR_API_KEY&quot;
            </span>
            <span style={{ color: "#9AA6C4" }}> \{"\n"}</span>
            {"  "}
            <span style={{ color: "#9AA6C4" }}>-H </span>
            <span style={{ color: "#4DEBFF" }}>
              &quot;Content-Type: application/json&quot;
            </span>
            <span style={{ color: "#9AA6C4" }}> \{"\n"}</span>
            {"  "}
            <span style={{ color: "#9AA6C4" }}>-d </span>
            <span style={{ color: "#fff" }}>
              &apos;{"{"}
              {"\n"}
            </span>
            {"    "}
            <span style={{ color: "#00C8FF" }}>&quot;projectId&quot;</span>
            <span style={{ color: "#9AA6C4" }}>: </span>
            <span style={{ color: "#4DEBFF" }}>
              &quot;YOUR_PROJECT_ID&quot;
            </span>
            <span style={{ color: "#9AA6C4" }}>,{"\n"}</span>
            {"    "}
            <span style={{ color: "#00C8FF" }}>&quot;endpoint&quot;</span>
            <span style={{ color: "#9AA6C4" }}>: </span>
            <span style={{ color: "#4DEBFF" }}>
              &quot;https://httpbin.org/get&quot;{"\n"}
            </span>
            {"  "}
            <span style={{ color: "#fff" }}>{"}"}&apos;</span>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}
