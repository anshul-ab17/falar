# Falar — Offline Speech-to-Text Desktop App

**Falar** is a high-performance, local-first speech-to-text desktop application powered by OpenAI's Whisper model. It decodes audio and video containers, resamples audio streams, and executes deep-learning inference entirely on your local machine—with **zero API keys, zero network tracking, and 100% privacy**.

The application is built inside a **Tauri 2** container bridging a **Vite + React + TypeScript** webview UI to a native **Rust core** wrapping C++ **whisper.cpp** binaries.

---

## Key Features

*   **100% Offline Processing**: Models download once and cache locally in the app data directory. Transcriptions require no internet connection.
*   **Multi-Container Audio Decoding**: Powered by a native pure-Rust decoding pipeline (via `symphonia`) supporting `.mp3`, `.wav`, `.m4a`, `.ogg`, `.flac`, `.mp4`, `.mkv`, and `.webm`.
*   **Real-time Segment Streaming**: Transcribed segments stream directly into an editable text dashboard as they finish decoding, using Tauri's asynchronous IPC events.
*   **Local Target Translation**: Supports auto-detecting over 99 languages or translating speech directly to English during inference.
*   **Bailout & Abort Support**: Features an active cancellation pipeline that stops Whisper inference and releases CPU/GPU resources immediately when cancelled.
*   **Model Options**: Select between `tiny` (75 MB), `base` (142 MB), or `small` model parameters directly inside the settings panel.

---

## Native Architecture & Tech Stack

*   **Frontend Webview**: React 19 + TypeScript + Vite. Connects to backend commands via `@tauri-apps/api/core` and receives data channels through `@tauri-apps/api/event`.
*   **IPC Bridge**: Tauri v2 plugins handle dialogue triggers (`@tauri-apps/plugin-dialog`), filesystem access (`@tauri-apps/plugin-fs`), and clipboard management (`@tauri-apps/plugin-clipboard-manager`).
*   **Rust Core**:
    *   `src-tauri/src/lib.rs`: Commands dispatcher, cancellation hooks, and shared app state.
    *   `src-tauri/src/audio.rs`: Symphonia track probes, mono down-mixing, and a linear resampler scaling samples to 16 kHz.
    *   `src-tauri/src/transcribe.rs`: FFI bindings executing `whisper-rs` in a `tokio::task::spawn_blocking` pool.
    *   `src-tauri/src/model.rs`: Reqwest atomic model downloader (renames `.bin.tmp` to `.bin` upon complete download to prevent corruption).

---

## Directory Modules

```
falar/
  src/                 # React UI + Tauri Event subscribers
    App.tsx            # Main layout containing drop zones and transcript boxes
    App.css            # Dark theme styles
  src-tauri/
    tauri.conf.json    # Application package config & capability declarations
    src/
      lib.rs           # Tauri command bindings & orchestrator
      audio.rs         # Symphonia container decoders & resamplers
      model.rs         # Model cache manager & downloader
      transcribe.rs    # whisper-rs inference & callbacks
```

---

## Compile & Run Instructions

### Prerequisites
Before building Falar, ensure you have the following toolchains installed:
1.  **Node.js** (v18+) & **npm**
2.  **Rustup** (Stable Cargo toolchain)
3.  **CMake** & C/C++ Compiler (for compiling `whisper.cpp` bindings)
4.  *Windows ONLY*: **LLVM/libclang** (required for bindgen). Set your environment paths to target LLVM (baked into [src-tauri/.cargo/config.toml](file:///C:/Users/atuly/Documents/Projects/falar%20(whisper)/falar/src-tauri/.cargo/config.toml)).

### Launch Developer Server
```bash
# Install packages
npm install

# Start Tauri hot-reloaded dev window
npm run tauri dev
```

### Compile Production Build
```bash
# Generate platform-specific native installers
npm run tauri build
```
Compiled bundles (e.g. `.msi` / `.exe` on Windows, `.dmg` on macOS, `.deb` / `.AppImage` on Linux) will output to `src-tauri/target/release/bundle/`.

---
