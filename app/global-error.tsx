"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          background: "#05070f",
          color: "#fff",
          margin: 0,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              maxWidth: 540,
              width: "100%",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: 24,
              background: "rgba(10,15,28,0.85)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: "0.08em",
                color: "#9AA6C4",
                textTransform: "uppercase",
              }}
            >
              Application Error
            </p>
            <h1 style={{ marginTop: 10, marginBottom: 10, fontSize: 22 }}>
              Something went wrong
            </h1>
            <p style={{ marginTop: 0, marginBottom: 20, color: "#9AA6C4" }}>
              The incident was captured for investigation. You can retry safely.
            </p>
            <button
              onClick={reset}
              style={{
                border: "1px solid rgba(0,200,255,0.35)",
                background: "rgba(0,200,255,0.10)",
                color: "#00C8FF",
                borderRadius: 10,
                padding: "10px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
