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

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Does Falar require an internet connection?",
    answer: "No. Falar runs Whisper models 100% offline. The model weights are downloaded once during initial setup and cached in your application data directory. Transcriptions are executed entirely locally, requiring zero internet access."
  },
  {
    question: "What audio and video formats are supported?",
    answer: "Falar utilizes the high-performance Rust library 'symphonia' for hardware-independent audio decoding. It supports unpacking standard extensions, including .mp3, .wav, .m4a, .ogg, .flac, .mp4, .mkv, and .webm containers, resampling them natively to 16 kHz mono on-the-fly."
  },
  {
    question: "How is privacy maintained? Is my audio shared?",
    answer: "Falar is built local-first. There are no telemetry servers, API keys, or tracking scripts. Your audio files and transcripts never leave your device. The app operates inside a secure native container bridging your local OS resources directly to whisper.cpp FFI bindings."
  },
  {
    question: "How do I download the latest release?",
    answer: "Since build configurations are frequently updated, the latest desktop installers are hosted directly on our GitHub Releases repository page. Click the download buttons below to check the latest releases. We offer .exe/.msi for Windows, .dmg for macOS, and .AppImage/.deb for Linux."
  },
  {
    question: "Does the app support GPU acceleration?",
    answer: "Yes, Falar utilizes system libraries for acceleration. On macOS, it leverages Apple Metal framework. On Windows and Linux, it uses Vulkan/DirectX runtimes when supported by your graphics card to speed up model execution."
  }
];

const Logo = ({ size = 28, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" className={`animated-logo-wave ${className}`} style={{ flexShrink: 0, borderRadius: "6px" }}>
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7a54ff" />
        <stop offset="100%" stopColor="#906fff" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#logo-grad)" />
    <rect className="wave-bar bar-1" x="7" y="10" width="2" height="4" rx="1" fill="#ffffff" />
    <rect className="wave-bar bar-2" x="10" y="7" width="2" height="10" rx="1" fill="#ffffff" />
    <rect className="wave-bar bar-3" x="13" y="6" width="2" height="12" rx="1" fill="#ffffff" />
    <rect className="wave-bar bar-4" x="16" y="9" width="2" height="6" rx="1" fill="#ffffff" />
  </svg>
);

export default function Home() {
  const [loading, setLoading] = useState<boolean>(true);
  const [currentText, setCurrentText] = useState<string>("");
  const [activeSegments, setActiveSegments] = useState<Segment[]>([]);
  const [demoIndex, setDemoIndex] = useState<number>(0);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(true);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Monitor scroll state for navbar style transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simulation loop for live transcription preview
  useEffect(() => {
    if (!isTranscribing) return;

    const timer = setTimeout(() => {
      if (demoIndex < DEMO_SEGMENTS.length) {
        const nextSeg = DEMO_SEGMENTS[demoIndex];
        setActiveSegments((prev) => [...prev, nextSeg]);
        setCurrentText((prev) => prev + nextSeg.text);
        setDemoIndex((prev) => prev + 1);
      } else {
        // Reset simulation after it finishes
        setTimeout(() => {
          setActiveSegments([]);
          setCurrentText("");
          setDemoIndex(0);
        }, 4000);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [demoIndex, isTranscribing]);

  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Loader Screen */}
      {loading && (
        <div className="loader-screen">
          <div className="loader-content">
            <Logo size={72} className="logo-wave-active" />
            <h2 className="loader-title outfit-font">Falar</h2>
            <p className="loader-subtitle">Loading workspace...</p>
          </div>
        </div>
      )}

      {/* Background Gradients */}
      <div className="ambient-bg-glow"></div>
      <div className="ambient-bg-glow-bottom"></div>

      {/* Navigation Bar */}
      <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
        <div className="nav-container">
          <a href="#" className="brand-section">
            <Logo size={28} />
            <span className="logo" style={{ background: "linear-gradient(135deg, #111827, #374151)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Falar</span>
            <span className="logo-sub">v0.1.0</span>
          </a>
          
          <div className="nav-menu">
            <a href="#about" className="nav-link">About</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#download" className="nav-link">Downloads</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </div>

          <div className="nav-actions">
            <a href="https://github.com/anshul-ab17/falar" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontSize: "0.9rem" }}>
              GitHub
            </a>
            <a href="#download" className="btn-primary" style={{ padding: "8px 18px", fontSize: "0.9rem" }}>
              Download Free
            </a>
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Hero Section */}
        <section className="hero-section animate-fade-in">
          <span className="hero-tag">Tauri 2 Native Core</span>
          <h1 className="hero-title outfit-font">
            Offline Speech-to-Text,<br />
            <span>100% Private.</span>
          </h1>
          <p className="hero-subtitle">
            Transcribe, translate, and capture speech natively on your hardware. Powered by OpenAI Whisper, bundled in a secure client sandbox. No accounts, no network leaks, and zero latency overhead.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <a href="#download" className="btn-primary" style={{ padding: "14px 32px", fontSize: "1.05rem" }}>
              Get Started
            </a>
            <a href="#demo" className="btn-secondary" style={{ padding: "14px 32px", fontSize: "1.05rem" }}>
              Live Demo
            </a>
          </div>

          {/* OS Badges with Original SVGs */}
          <div className="os-badge-container">
            {/* Windows Badge */}
            <a href="#download" className="os-badge windows-hover">
              <svg width="18" height="18" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0H11V11H0V0Z" fill="#0078d4"/>
                <path d="M12 0H23V11H12V0Z" fill="#0078d4"/>
                <path d="M0 12H11V23H0V12Z" fill="#0078d4"/>
                <path d="M12 12H23V23H12V12Z" fill="#0078d4"/>
              </svg>
              Windows
            </a>

            {/* macOS Badge */}
            <a href="#download" className="os-badge mac-hover">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#111827" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.73-1.2 1.87-1.05 2.97 1.12.09 2.27-.56 3-1.41Z"/>
              </svg>
              macOS
            </a>

            {/* Linux Badge */}
            <a href="#download" className="os-badge linux-hover">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.008c-.287 0-.586.067-.84.2a.311.311 0 01-.136.068l-.004.004c-.059.054-.108.067-.172.132-.016.01-.027.02-.04.032.22.464.444.864.717 1.272.274-.136.57-.267.893-.267h.004z" fill="#111827" />
              </svg>
              Linux
            </a>
          </div>
        </section>

        {/* Live Integration Preview (White-Theme Mockup) */}
        <section id="demo" className="preview-container animate-fade-in animate-delay-1">
          <div className="preview-content">
            <span className="hero-tag" style={{ background: "var(--accent-primary-glow)", color: "var(--accent-primary)", borderColor: "rgba(79, 70, 229, 0.15)", width: "fit-content" }}>
              Live Streaming Pipeline
            </span>
            <h2 className="outfit-font animate-font-hover" style={{ fontSize: "2.2rem", color: "var(--text-primary)", fontWeight: 800 }}>
              Segment Streaming
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.6" }}>
              Watch Falar decode high-density audio in real-time. Native Symphonia threads feed mono audio frames to a Whisper runtime, dispatching immediate segments straight to your UI thread. 
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button 
                className="btn-secondary" 
                style={{ padding: "10px 20px", fontSize: "0.95rem" }}
                onClick={() => {
                  setIsTranscribing(!isTranscribing);
                  if(!isTranscribing) {
                    setActiveSegments([]);
                    setCurrentText("");
                    setDemoIndex(0);
                  }
                }}
              >
                {isTranscribing ? "Pause Simulation" : "Restart Simulation"}
              </button>
            </div>
          </div>

          <div className="preview-mockup">
            <div className="mockup-header">
              <div className="dot-group">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <div className="mockup-title">Falar Native Client</div>
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
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "Fira Code, monospace" }}>Audio Feed Suspended</div>
                )}
              </div>
              <div className="preview-text">
                {activeSegments.length === 0 ? (
                  <span style={{ color: "var(--text-muted)" }}>Drop audio or video files here...</span>
                ) : (
                  activeSegments.map((seg, idx) => (
                    <div key={idx} style={{ marginBottom: "8px", animation: "fadeInUp 0.4s ease forwards" }}>
                      <span style={{ color: "var(--accent-primary)", marginRight: "8px", fontWeight: "600" }}>[{seg.time}]</span>
                      <span>{seg.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* About Section / Performance Features */}
        <section id="about" className="info-section">
          <div className="section-header">
            <span className="section-tag">About Falar</span>
            <h2 className="section-heading outfit-font animate-font-hover">Local Execution. Desktop Integrity.</h2>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-item-icon">🛡️</div>
              <h3 className="feature-item-title outfit-font">Local-First Sandbox</h3>
              <p className="feature-item-desc">
                All model operations and translation decodes execute inside a sandboxed Tauri instance on CPU or GPU. Zero cloud data endpoints. Zero data harvesting.
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon">⚡</div>
              <h3 className="feature-item-title outfit-font">GGML Bindings</h3>
              <p className="feature-item-desc">
                By compiling native whisper.cpp code directly via Rust FFI wrapper layers, Falar completely side-steps browser sandbox speed penalties.
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon">📻</div>
              <h3 className="feature-item-title outfit-font">Symphonia Decoder</h3>
              <p className="feature-item-desc">
                A pure-Rust decoding pipeline that parses raw containers, extracts audio channels, and outputs resampled 16,000 Hz float-arrays.
              </p>
            </div>
          </div>
        </section>

        {/* Download Grid Section */}
        <section id="download" style={{ padding: "80px 0" }}>
          <div className="section-header">
            <span className="section-tag">Installers</span>
            <h2 className="section-heading outfit-font animate-font-hover">Download Falar</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "16px", fontSize: "1.1rem" }}>
              Select the native bundle package for your desktop environment.
            </p>
          </div>

          <div className="card-grid">
            {/* Windows Card */}
            <div className="interactive-card">
              <div className="card-top">
                <div className="card-icon-wrapper">
                  <svg width="22" height="22" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H11V11H0V0Z" fill="#0078d4"/>
                    <path d="M12 0H23V11H12V0Z" fill="#0078d4"/>
                    <path d="M0 12H11V23H0V12Z" fill="#0078d4"/>
                    <path d="M12 12H23V23H12V12Z" fill="#0078d4"/>
                  </svg>
                </div>
                <h3 className="card-title outfit-font">Windows Edition</h3>
                <p className="card-desc">
                  Compatible with Windows 10 & 11 (x64 architectures). Fully optimized for Windows DirectML acceleration.
                </p>
              </div>
              <div>
                <a href="https://github.com/anshul-ab17/falar/releases" target="_blank" rel="noopener noreferrer">
                  <button className="btn-primary btn-card-action">View Windows Releases</button>
                </a>
                <a href="https://github.com/anshul-ab17/falar/releases" target="_blank" rel="noopener noreferrer" className="meta-link">
                  Get .msi or portable builds
                </a>
              </div>
            </div>

            {/* macOS Card */}
            <div className="interactive-card">
              <div className="card-top">
                <div className="card-icon-wrapper">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#111827" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.73-1.2 1.87-1.05 2.97 1.12.09 2.27-.56 3-1.41Z" />
                  </svg>
                </div>
                <h3 className="card-title outfit-font">macOS Edition</h3>
                <p className="card-desc">
                  Native Apple Silicon (M1/M2/M3/M4) & Intel packages. Leverages core Metal frameworks for quick operations.
                </p>
              </div>
              <div>
                <a href="https://github.com/anshul-ab17/falar/releases" target="_blank" rel="noopener noreferrer">
                  <button className="btn-primary btn-card-action">View macOS Releases</button>
                </a>
                <span className="meta-link" style={{ textDecoration: "none" }}>Universal Apple package (.dmg)</span>
              </div>
            </div>

            {/* Linux Card */}
            <div className="interactive-card">
              <div className="card-top">
                <div className="card-icon-wrapper">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.008c-.287 0-.586.067-.84.2a.311.311 0 01-.136.068l-.004.004c-.059.054-.108.067-.172.132-.016.01-.027.02-.04.032.22.464.444.864.717 1.272.274-.136.57-.267.893-.267h.004z" fill="#111827" />
                  </svg>
                </div>
                <h3 className="card-title outfit-font">Linux Edition</h3>
                <p className="card-desc">
                  Includes pre-built packages for modern Debian and Ubuntu distributions. Fits standard sandboxed runtimes.
                </p>
              </div>
              <div>
                <a href="https://github.com/anshul-ab17/falar/releases" target="_blank" rel="noopener noreferrer">
                  <button className="btn-primary btn-card-action">View Linux Releases</button>
                </a>
                <a href="https://github.com/anshul-ab17/falar/releases" target="_blank" rel="noopener noreferrer" className="meta-link">
                  Download .deb or .AppImage
                </a>
              </div>
            </div>
          </div>

          {/* Release Notice Box */}
          <div className="release-note-box" style={{ maxWidth: "800px", margin: "40px auto 0 auto" }}>
            <span style={{ fontSize: "1.3rem" }}>ℹ️</span>
            <div>
              <strong>Releases & Assets Note:</strong>
              <p style={{ marginTop: "4px" }}>
                We are actively updating Falar binary configurations. Early builds and source bundles can be fetched directly from our official <a href="https://github.com/anshul-ab17/falar/releases" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", fontWeight: "600", textDecoration: "underline" }}>GitHub Releases Page</a>. Direct release paths like <code>Falar_0.1.0_x64-setup.exe</code> are generated dynamically upon tagging stable build releases.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Highlights (Mixpanel-Style Section) */}
        <section id="features" className="info-section" style={{ background: "var(--bg-secondary)", borderRadius: "32px", padding: "80px 40px", margin: "60px 0" }}>
          <div className="section-header">
            <span className="section-tag">Native Capabilities</span>
            <h2 className="section-heading outfit-font animate-font-hover">Engineered for Smooth Workflows</h2>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <h3 className="feature-item-title outfit-font">🗣️ Multi-Language Translation</h3>
              <p className="feature-item-desc" style={{ marginTop: "8px" }}>
                Auto-detects over 99 languages. Instantly translate non-English source audio into clean English transcripts during the native inference cycle.
              </p>
            </div>

            <div className="feature-item">
              <h3 className="feature-item-title outfit-font">🛑 Interrupt & Cancel Safely</h3>
              <p className="feature-item-desc" style={{ marginTop: "8px" }}>
                Features an active cancellation pipeline. Tap cancel in the client to immediately break the FFI loops, free CPU/GPU buffers, and halt model operations.
              </p>
            </div>

            <div className="feature-item">
              <h3 className="feature-item-title outfit-font">💾 Model Parameter Cache</h3>
              <p className="feature-item-desc" style={{ marginTop: "8px" }}>
                Choose between <code>tiny</code> (75MB), <code>base</code> (142MB), or <code>small</code> model weights inside Settings. Falar manages atomic downloads to prevent local file corruption.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section Accordions */}
        <section id="faq" className="faq-section">
          <div className="section-header">
            <span className="section-tag">FAQ</span>
            <h2 className="section-heading outfit-font animate-font-hover">Frequently Asked Questions</h2>
          </div>

          <div className="faq-list">
            {FAQ_ITEMS.map((item, index) => (
              <div 
                key={index} 
                className={`faq-item ${openFaqIndex === index ? "faq-item-active" : ""}`}
              >
                <button className="faq-question" onClick={() => toggleFaq(index)}>
                  <span>{item.question}</span>
                  <span className="faq-icon" style={{ fontSize: "1rem", fontWeight: "600" }}>{openFaqIndex === index ? "−" : "+"}</span>
                </button>
                <div className="faq-answer">
                  <div className="faq-answer-content">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Logo size={28} />
                <span className="logo" style={{ background: "linear-gradient(135deg, #111827, #374151)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Falar</span>
              </div>
              <p className="footer-desc">
                High-performance, local-first offline speech-to-text desktop application bridging React UI and native Rust bindings.
              </p>
            </div>
            
            <div>
              <h4 className="footer-col-title">Project</h4>
              <ul className="footer-links">
                <li><a href="#about" className="footer-link">About</a></li>
                <li><a href="#features" className="footer-link">Features</a></li>
                <li><a href="#download" className="footer-link">Downloads</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-col-title">Resources</h4>
              <ul className="footer-links">
                <li><a href="https://github.com/anshul-ab17/falar" target="_blank" rel="noopener noreferrer" className="footer-link">Documentation</a></li>
                <li><a href="https://github.com/anshul-ab17/falar/issues" target="_blank" rel="noopener noreferrer" className="footer-link">Report Issues</a></li>
                <li><a href="https://github.com/anshul-ab17/falar/releases" target="_blank" rel="noopener noreferrer" className="footer-link">Releases Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-col-title">Creator</h4>
              <ul className="footer-links">
                <li><a href="https://anshulbharat.com/" target="_blank" rel="noopener noreferrer" className="footer-link">Portfolio</a></li>
                <li><a href="https://github.com/anshul-ab17/" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a></li>
                <li><a href="https://www.linkedin.com/in/anshul-bt17/" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a></li>
                <li><a href="https://x.com/anshul_ab17" target="_blank" rel="noopener noreferrer" className="footer-link">X (Twitter)</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              © {new Date().getFullYear()} Falar Project. 
            </p>
            <div className="footer-socials" style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              {/* Portfolio Link */}
              <a href="https://anshulbharat.com/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Portfolio" style={{ display: "flex", alignItems: "center" }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </a>
              {/* GitHub Link */}
              <a href="https://github.com/anshul-ab17/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub" style={{ display: "flex", alignItems: "center" }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              {/* LinkedIn Link */}
              <a href="https://www.linkedin.com/in/anshul-bt17/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn" style={{ display: "flex", alignItems: "center" }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              {/* X Link */}
              <a href="https://x.com/anshul_ab17" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="X (Twitter)" style={{ display: "flex", alignItems: "center" }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
