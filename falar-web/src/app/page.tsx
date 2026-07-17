"use client";

import { useState, useEffect } from "react";

interface Segment {
  time: string;
  text: string;
}

const DEMO_SEGMENTS: Segment[] = [
  { time: "00:01", text: "Welcome to Falar." },
  { time: "00:03", text: " This is a local speech-to-text desktop application." },
  { time: "00:07", text: " Powered by OpenAI Whisper and compiled natively with Rust." },
  { time: "00:12", text: " It runs one hundred percent locally on your machine." },
  { time: "00:16", text: " No API keys, no tracking, and no voice data ever leaves your device." }
];

export default function Home() {
  const [currentText, setCurrentText] = useState<string>("");
  const [activeSegments, setActiveSegments] = useState<Segment[]>([]);
  const [demoIndex, setDemoIndex] = useState<number>(0);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(true);

  // Simulation loop for integration/font animations
  useEffect(() => {
    if (!isTranscribing) return;

    const timer = setTimeout(() => {
      if (demoIndex < DEMO_SEGMENTS.length) {
        const nextSeg = DEMO_SEGMENTS[demoIndex];
        setActiveSegments((prev) => [...prev, nextSeg]);
        setCurrentText((prev) => prev + nextSeg.text);
        setDemoIndex((prev) => prev + 1);
      } else {
        // Reset simulation after it finishes to keep the page alive
        setTimeout(() => {
          setActiveSegments([]);
          setCurrentText("");
          setDemoIndex(0);
        }, 4000);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [demoIndex, isTranscribing]);

  return (
    <div style={{ position: "relative" }}>
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      <div className="container">
        {/* Navigation Header */}
        <header className="hero-header">
          <div className="brand-section">
            <span className="logo">🎙 FALAR</span>
            <div className="logo-sub">Local Speech-to-Text</div>
          </div>
          <div className="logo-sub">Version 0.1.0</div>
        </header>

        {/* Hero Section */}
        <section className="hero-section animate-fade-in">
          <span className="hero-tag">Tauri 2 Native App</span>
          <h1 className="hero-title">Offline Speech-to-Text,<br />100% Private.</h1>
          <p className="hero-subtitle">
            Transcribe and translate your audio and video files locally. Powered by OpenAI Whisper. No cloud APIs, no network accounts, no limits.
          </p>
        </section>

        {/* Interactive Preview Mockup with Waveform & Font Animation */}
        <section className="preview-container animate-fade-in animate-delay-1">
          <div>
            <span className="hero-tag" style={{ background: "rgba(139, 92, 246, 0.08)", color: "#8b5cf6", borderColor: "rgba(139, 92, 246, 0.2)" }}>Live Integration Preview</span>
            <h2 className="outfit-font" style={{ fontSize: "2rem", marginTop: "16px", marginBottom: "16px", border: "none" }}>Segment Streaming</h2>
            <p>
              Falar streams transcript segments into the UI in real-time as they decode. You can watch the text unfold, edit the results on the fly, and export instantly.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button 
                className="download-btn secondary" 
                style={{ width: "auto", padding: "10px 20px" }}
                onClick={() => {
                  setIsTranscribing(!isTranscribing);
                  if(!isTranscribing) {
                    setActiveSegments([]);
                    setCurrentText("");
                    setDemoIndex(0);
                  }
                }}
              >
                {isTranscribing ? "Pause Demo" : "Restart Demo"}
              </button>
            </div>
          </div>

          <div className="preview-mockup">
            <div className="mockup-header">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="mockup-title">Falar - Local transcriber</div>
            </div>
            <div className="mockup-body">
              <div className="preview-waveform">
                {isTranscribing ? (
                  <>
                    <span className="bar bar-1"></span>
                    <span className="bar bar-2"></span>
                    <span className="bar bar-3"></span>
                    <span className="bar bar-4"></span>
                    <span className="bar bar-5"></span>
                    <span className="bar bar-6"></span>
                    <span className="bar bar-7"></span>
                    <span className="bar bar-8"></span>
                    <span className="bar bar-3"></span>
                    <span className="bar bar-1"></span>
                    <span className="bar bar-5"></span>
                    <span className="bar bar-2"></span>
                  </>
                ) : (
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "Fira Code, monospace" }}>Audio Waveform Paused</div>
                )}
              </div>
              <div className="preview-text">
                {activeSegments.length === 0 ? (
                  <span style={{ color: "var(--text-muted)" }}>Waiting for audio drop...</span>
                ) : (
                  activeSegments.map((seg, idx) => (
                    <div key={idx} style={{ marginBottom: "6px", animation: "fadeInUp 0.4s ease forwards" }}>
                      <span style={{ color: "var(--accent-cyan)", marginRight: "8px" }}>[{seg.time}]</span>
                      <span>{seg.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Download Grid Section */}
        <section style={{ padding: "40px 0" }}>
          <h2 className="outfit-font" style={{ justifyContent: "center", border: "none", fontSize: "2.2rem", marginBottom: "8px" }}>Download Falar</h2>
          <p style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 40px auto" }}>
            Select the installer bundle for your operating system. Falar runs on standard CPU, with optional Vulkan/Metal GPU configuration.
          </p>

          <div className="card-grid">
            {/* Windows Card */}
            <div className="download-card">
              <div className="card-top">
                <div className="os-icon">🪟</div>
                <div className="os-title">Windows</div>
                <div className="os-desc">Compatible with Windows 10 and 11. Requires WebView2 runtime (pre-installed on Win 11).</div>
              </div>
              <div>
                <a href="https://github.com/anshul-ab17/falar/releases/latest/download/Falar_0.1.0_x64-setup.exe" target="_blank" rel="noopener noreferrer">
                  <button className="download-btn">Download .exe Installer</button>
                </a>
                <a href="https://github.com/anshul-ab17/falar/releases/latest/download/Falar_0.1.0_x64_en-US.msi" target="_blank" rel="noopener noreferrer" className="meta-link">
                  Download .msi bundle (x64)
                </a>
              </div>
            </div>

            {/* macOS Card */}
            <div className="download-card">
              <div className="card-top">
                <div className="os-icon">🍎</div>
                <div className="os-title">macOS</div>
                <div className="os-desc">Supports Apple Silicon (M1/M2/M3) and Intel CPUs. Standard Metal acceleration enabled.</div>
              </div>
              <div>
                <a href="https://github.com/anshul-ab17/falar/releases/latest/download/Falar_0.1.0_x64.dmg" target="_blank" rel="noopener noreferrer">
                  <button className="download-btn">Download .dmg Installer</button>
                </a>
                <span className="meta-link" style={{ textDecoration: "none" }}>Intel & Apple Silicon universal</span>
              </div>
            </div>

            {/* Linux Card */}
            <div className="download-card">
              <div className="card-top">
                <div className="os-icon">🐧</div>
                <div className="os-title">Linux</div>
                <div className="os-desc">Includes packages for Debian/Ubuntu distributions. Requires webkit2gtk libraries.</div>
              </div>
              <div>
                <a href="https://github.com/anshul-ab17/falar/releases/latest/download/Falar_0.1.0_amd64.AppImage" target="_blank" rel="noopener noreferrer">
                  <button className="download-btn">Download .AppImage</button>
                </a>
                <a href="https://github.com/anshul-ab17/falar/releases/latest/download/falar_0.1.0_amd64.deb" target="_blank" rel="noopener noreferrer" className="meta-link">
                  Download Debian package (.deb)
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="features-section">
          <h2 className="section-title">Built for Performance</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <div className="feature-title">Local-First Sandbox</div>
              <div className="feature-desc">All transcription operations execute entirely on your CPU/GPU. No servers, no accounts, and no data leak risks.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📻</div>
              <div className="feature-title">Multi-Format Decoder</div>
              <div className="feature-desc">Symphonia native parsing supports unpacking standard media extensions including MP3, WAV, FLAC, OGG, and MP4.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <div className="feature-title">GGML Inference Engine</div>
              <div className="feature-desc">Whisper FFI bindings call C++ libraries directly, bypassing browser engine limits and accelerating speech decoding.</div>
            </div>
          </div>
        </section>

        <footer>
          <p>© 2026 Falar Project. 100% client-side distribution page. Open Source under MIT.</p>
        </footer>
      </div>
    </div>
  );
}
