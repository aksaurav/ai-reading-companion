// Frontend/src/components/ChatPanel.tsx
import React, { useState, useRef, useEffect } from "react";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  sources?: string[];
}

export const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hi! I'm your Reading Companion AI. Ask me anything about the articles or videos you've ingested into your Knowledge Core!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();
    setInput("");

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userMessageText,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // FIX: Changed endpoint path from /api/ingest to /api/query
      const response = await fetch(`${API_BASE_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessageText }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed vector match");

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.answer,
        sources: data.sources || [],
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: `⚠️ Pipeline processing failure: ${error.message || "Check server logs."}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "540px",
        width: "100%",
        background:
          "linear-gradient(145deg, rgba(13, 20, 38, 0.8) 0%, rgba(8, 12, 24, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "20px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Module Meta Header */}
      <div
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "0.85rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(255, 255, 255, 0.01)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "6px",
              height: "6px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              boxShadow: "0 0 8px #3b82f6",
            }}
          ></div>
          <h3
            style={{
              margin: 0,
              fontWeight: "700",
              color: "#fff",
              fontSize: "0.9rem",
              letterSpacing: "0.3px",
            }}
          >
            Knowledge Base Companion
          </h3>
        </div>
        <span
          style={{
            fontSize: "0.7rem",
            color: "#475569",
            fontFamily: "monospace",
            backgroundColor: "rgba(255,255,255,0.03)",
            padding: "0.2rem 0.4rem",
            borderRadius: "5px",
          }}
        >
          RAG-v1.0.2
        </span>
      </div>

      {/* Message Feed Display */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          boxSizing: "border-box",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
              width: "100%",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                borderRadius: "14px",
                padding: "0.75rem 1rem",
                fontSize: "0.9rem",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background:
                  msg.sender === "user"
                    ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                    : "rgba(30, 41, 59, 0.45)",
                color: "#ffffff",
                border:
                  msg.sender === "user"
                    ? "none"
                    : "1px solid rgba(255, 255, 255, 0.04)",
                boxShadow:
                  msg.sender === "user"
                    ? "0 4px 12px rgba(37, 99, 235, 0.15)"
                    : "none",
                borderBottomRightRadius: msg.sender === "user" ? "2px" : "14px",
                borderBottomLeftRadius: msg.sender === "ai" ? "2px" : "14px",
              }}
            >
              {msg.text}
            </div>

            {msg.sources && msg.sources.length > 0 && (
              <div
                style={{
                  marginTop: "0.35rem",
                  fontSize: "0.75rem",
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  paddingLeft: "0.25rem",
                }}
              >
                <span style={{ color: "#10b981" }}>⚡</span>
                <span style={{ fontWeight: "600", color: "#64748b" }}>
                  Source Matrix:
                </span>
                <span style={{ fontStyle: "italic" }}>
                  {msg.sources.join(", ")}
                </span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              alignSelf: "flex-start",
              backgroundColor: "rgba(30, 41, 59, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.04)",
              borderRadius: "14px",
              borderBottomLeftRadius: "2px",
              padding: "0.75rem 1rem",
              fontSize: "0.85rem",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                width: "4px",
                height: "4px",
                backgroundColor: "#3b82f6",
                borderRadius: "50%",
              }}
            ></span>
            <span>Synthesizing vectors...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Action Form */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: "1rem",
          backgroundColor: "rgba(9, 13, 26, 0.5)",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          gap: "0.5rem",
          boxSizing: "border-box",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your sources..."
          disabled={isLoading}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "0.75rem 1rem",
            fontSize: "0.9rem",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            backgroundColor: "rgba(9, 13, 24, 0.8)",
            color: "#fff",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          style={{
            padding: "0.75rem 1.25rem",
            borderRadius: "12px",
            border: "none",
            background:
              !input.trim() || isLoading
                ? "rgba(255, 255, 255, 0.02)"
                : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            color: !input.trim() || isLoading ? "#475569" : "#fff",
            fontSize: "0.88rem",
            fontWeight: "600",
            cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
            boxShadow:
              !input.trim() || isLoading
                ? "none"
                : "0 4px 12px rgba(59, 130, 246, 0.2)",
            whiteSpace: "nowrap",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};
