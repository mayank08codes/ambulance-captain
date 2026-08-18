import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

type ErrorBoundaryState = { hasError: boolean; message: string };

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || "Unexpected application error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("SavLife Captain runtime error", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#F4F7FA", padding: 32, fontFamily: "DM Sans, system-ui, sans-serif", color: "#102A43" }}>
          <section style={{ maxWidth: 560, background: "#FFFFFF", border: "1px solid #D9E2EC", borderRadius: 18, padding: 32, boxShadow: "0 20px 60px rgba(16,42,67,.12)" }}>
            <p style={{ color: "#0F766E", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 12 }}>SavLife Captain</p>
            <h1 style={{ margin: "8px 0 12px", fontSize: 28 }}>Operations screen could not load</h1>
            <p style={{ color: "#486581", lineHeight: 1.6 }}>The driver session is still safe. Refresh the page to retry the operations workspace.</p>
            <details style={{ marginTop: 18, color: "#829AB1", fontSize: 12 }}><summary>Technical details</summary><pre style={{ whiteSpace: "pre-wrap" }}>{this.state.message}</pre></details>
            <button onClick={() => window.location.reload()} style={{ marginTop: 22, border: 0, borderRadius: 10, padding: "12px 18px", background: "#2563EB", color: "white", fontWeight: 800, cursor: "pointer" }}>Reload operations</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
