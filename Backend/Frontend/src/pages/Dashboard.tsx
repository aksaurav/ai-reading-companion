// Frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { ChatPanel } from "../components/ChatPanel";

// Vite pulls this placeholder from your Vercel/local env configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Dashboard: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Ready to process content stream pipelines.",
  );
  const [isSuccess, setIsSuccess] = useState(true);
  const [isServerOnline, setIsServerOnline] = useState(false);

  // 1. Dynamic viewport scaling tracking
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize(); // Initialize check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Dynamic Live Backend Server Heartbeat check
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        // Pings your Render root or health endpoint
        const res = await fetch(`${API_BASE_URL}/`);
        if (res.ok || res.status === 404) {
          // 404 means server is up and routing
          setIsServerOnline(true);
        }
      } catch (err) {
        setIsServerOnline(false);
      }
    };
    checkServerHealth();
  }, []);

  // 3. Asynchronous Multimedia Ingestion Data Pipeline
  const handleIngestSubmit = async () => {
    if (!inputUrl.trim() || isIngesting) return;

    setIsIngesting(true);
    setStatusMessage(
      "Compiling data stream and generating dense vector embeddings...",
    );
    setIsSuccess(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ingestion pipeline sync error");
      }

      setIsSuccess(true);
      setStatusMessage(
        "Material processed and embedded successfully into Pinecone index.",
      );
      setInputUrl(""); // Clear input on success
    } catch (error: any) {
      setIsSuccess(false);
      setStatusMessage(
        `⚠️ Pipeline failure: ${error.message || "Could not connect to database core."}`,
      );
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#070a13",
        backgroundImage:
          "radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.06) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.04) 0%, transparent 40%)",
        color: "#f8fafc",
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        boxSizing: "border-box",
      }}
    >
      {/* Sidebar Layout Layer */}
      <aside
        style={{
          width: isMobile ? "100%" : "260px",
          minWidth: isMobile ? "100%" : "260px",
          backgroundColor: "rgba(11, 17, 32, 0.85)",
          backdropFilter: "blur(16px)",
          borderRight: isMobile
            ? "none"
            : "1px solid rgba(255, 255, 255, 0.06)",
          borderBottom: isMobile
            ? "1px solid rgba(255, 255, 255, 0.06)"
            : "none",
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          justifyContent: isMobile ? "space-between" : "flex-start",
          alignItems: isMobile ? "center" : "stretch",
          padding: isMobile ? "1rem 1.5rem" : "2rem 1.5rem",
          boxSizing: "border-box",
          zIndex: 10,
        }}
      >
        {/* Brand Glow Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: isMobile ? "0" : "2.5rem",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #3b82f6, #10b981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(59, 130, 246, 0.4)",
            }}
          >
            <span
              style={{ fontWeight: "800", color: "#fff", fontSize: "1.1rem" }}
            >
              Ω
            </span>
          </div>
          <span
            style={{
              fontSize: "1.15rem",
              fontWeight: "800",
              letterSpacing: "0.5px",
              color: "#ffffff",
            }}
          >
            Companion.AI
          </span>
        </div>

        {/* Navigation Action Feed */}
        <nav
          style={{
            display: "flex",
            flexDirection: isMobile ? "row" : "column",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 1rem",
              borderRadius: "10px",
              border: "none",
              background: "rgba(59, 130, 246, 0.1)",
              borderLeft: isMobile ? "none" : "3px solid #3b82f6",
              borderBottom: isMobile ? "3px solid #3b82f6" : "none",
              color: "#3b82f6",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.88rem",
            }}
          >
            Library
          </button>
          {!isMobile && (
            <>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  width: "100%",
                  padding: "0.65rem 1rem",
                  borderRadius: "10px",
                  border: "none",
                  background: "transparent",
                  color: "#475569",
                  fontWeight: "500",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.88rem",
                }}
              >
                🕒 Sessions
              </button>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  width: "100%",
                  padding: "0.65rem 1rem",
                  borderRadius: "10px",
                  border: "none",
                  background: "transparent",
                  color: "#475569",
                  fontWeight: "500",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.88rem",
                }}
              >
                🔑 Keys
              </button>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content Dashboard Stream Container */}
      <main
        style={{
          flex: 1,
          padding: isMobile ? "1.5rem" : "2.5rem 3rem",
          overflowY: "auto",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        {/* Dynamic Status Server Header */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? "1.75rem" : "2.25rem",
                fontWeight: "800",
                letterSpacing: "-0.75px",
              }}
            >
              Welcome Back
            </h1>
            <p
              style={{
                margin: "0.25rem 0 0 0",
                color: "#475569",
                fontSize: "0.95rem",
              }}
            >
              Expand your vector database instantly.
            </p>
          </div>
          <div
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              backgroundColor: isServerOnline
                ? "rgba(16, 185, 129, 0.05)"
                : "rgba(239, 68, 68, 0.05)",
              border: isServerOnline
                ? "1px solid rgba(16, 185, 129, 0.15)"
                : "1px solid rgba(239, 68, 68, 0.15)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              alignSelf: isMobile ? "stretch" : "auto",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: isServerOnline ? "#10b981" : "#ef4444",
                borderRadius: "50%",
                boxShadow: isServerOnline
                  ? "0 0 8px #10b981"
                  : "0 0 8px #ef4444",
              }}
            ></span>
            <span
              style={{
                color: isServerOnline ? "#10b981" : "#ef4444",
                fontSize: "0.78rem",
                fontWeight: "700",
                letterSpacing: "0.5px",
              }}
            >
              {isServerOnline
                ? "PRODUCTION ENGINE CONNECTED"
                : "ENGINE OFFLINE (CHECK CLOUD)"}
            </span>
          </div>
        </div>

        {/* Workspaces Layout Split Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "minmax(400px, 1fr) minmax(450px, 1.2fr)",
            gap: "2rem",
            alignItems: "start",
            width: "100%",
          }}
        >
          {/* Left Block Layer: Data Ingestion Console */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              width: "100%",
            }}
          >
            {/* Ingestion Block Container */}
            <div
              style={{
                background:
                  "linear-gradient(145deg, rgba(15, 23, 42, 0.6) 0%, rgba(20, 30, 55, 0.4) 100%)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "20px",
                padding: "1.75rem",
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.3)",
                boxSizing: "border-box",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                🌌 Feed Knowledge Core
              </h2>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.88rem",
                  marginBottom: "1.5rem",
                  lineHeight: "1.5",
                }}
              >
                Drop media URLs or text streams below to generate embedded
                vectors.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.75rem",
                  marginBottom: "1.25rem",
                  width: "100%",
                }}
              >
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  disabled={isIngesting}
                  placeholder="Paste YouTube links or web URLs..."
                  style={{
                    flex: 1,
                    minWidth: 0,
                    backgroundColor: "rgba(9, 13, 26, 0.8)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "12px",
                    padding: "0.75rem 1rem",
                    color: "#fff",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleIngestSubmit}
                  disabled={isIngesting || !inputUrl.trim()}
                  style={{
                    background: isIngesting
                      ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                      : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    color: isIngesting ? "#64748b" : "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "0.75rem 1.25rem",
                    fontWeight: "600",
                    cursor: isIngesting ? "not-allowed" : "pointer",
                    fontSize: "0.88rem",
                    whiteSpace: "nowrap",
                    boxShadow: isIngesting
                      ? "none"
                      : "0 4px 12px rgba(59, 130, 246, 0.25)",
                  }}
                >
                  {isIngesting ? "Processing..." : "Ingest"}
                </button>
              </div>

              {/* Ingestion Pipeline Feedback banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  backgroundColor: isSuccess
                    ? "rgba(16, 185, 129, 0.06)"
                    : "rgba(239, 68, 68, 0.06)",
                  border: isSuccess
                    ? "1px solid rgba(16, 185, 129, 0.12)"
                    : "1px solid rgba(239, 68, 68, 0.12)",
                }}
              >
                <span
                  style={{
                    color: isSuccess ? "#10b981" : "#ef4444",
                    fontSize: "0.9rem",
                  }}
                >
                  {isSuccess ? "✓" : "⚠️"}
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: isSuccess ? "#a7f3d0" : "#fca5a5",
                    fontWeight: "500",
                  }}
                >
                  {statusMessage}
                </span>
              </div>
            </div>

            {/* Context Item Asset Tracker */}
            <div
              style={{
                background: "rgba(13, 20, 38, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.03)",
                borderRadius: "20px",
                padding: "1.5rem",
                boxSizing: "border-box",
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#475569",
                  fontWeight: "700",
                }}
              >
                Active Knowledge Context
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  color: "#94a3b8",
                  fontSize: "0.88rem",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.03)",
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  lineHeight: "1.4",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>🎥</span>
                <span
                  style={{
                    color: "#e2e8f0",
                    fontWeight: "500",
                    wordBreak: "break-word",
                  }}
                >
                  5 Amazing Facts About Mars: Exploring The Red Planet
                </span>
              </div>
            </div>
          </div>

          {/* Right Block Layer: Chat System Interface Panel */}
          <div style={{ width: "100%" }}>
            <ChatPanel />
          </div>
        </div>
      </main>
    </div>
  );
};
