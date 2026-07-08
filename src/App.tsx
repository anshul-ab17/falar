import { useState, useEffect, useRef, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { open, save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import "./App.css";

type ModelSize = "tiny" | "base" | "small";
type Status = "idle" | "downloading" | "transcribing" | "done" | "error";

interface Segment { start: number; end: number; text: string; }
interface ModelProgress { received: number; total: number; }
interface TranscribeDone { full_text: string; language: string; }

const MODEL_SIZES: ModelSize[] = ["tiny", "base", "small"];

function fmt(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function App() {
  const [model, setModel] = useState<ModelSize>("tiny");
  const [language, setLanguage] = useState("auto");
  const [translate, setTranslate] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("Ready");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [fullText, setFullText] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [modelPath, setModelPath] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Check if model already cached on mount and model change
  useEffect(() => {
    invoke<boolean>("model_cached", { size: model }).then((cached) => {
      if (cached) {
        invoke<{ cached: boolean; path: string }>("ensure_model", { size: model })
          .then((r) => setModelPath(r.path))
          .catch(() => {});
      } else {
        setModelPath(null);
      }
    });
  }, [model]);

  const ensureModel = useCallback(async (): Promise<string> => {
    if (modelPath) return modelPath;
    setStatus("downloading");
    setStatusMsg(`Downloading ${model} model…`);
    setProgress(0);
    const r = await invoke<{ cached: boolean; path: string }>("ensure_model", { size: model });
    setModelPath(r.path);
    return r.path;
  }, [model, modelPath]);

  const runTranscription = useCallback(async (source: string, pcmData?: number[]) => {
    let path: string;
    try {
      path = await ensureModel();
    } catch (e) {
      setStatus("error");
      setStatusMsg(`Download failed: ${e}`);
      return;
    }

    setStatus("transcribing");
    setStatusMsg("Transcribing…");
    setProgress(0);
    setSegments([]);
    setFullText("");
    setDetectedLang("");

    try {
      await invoke("transcribe", {
        source,
        pcmData: pcmData ?? null,
        modelPath: path,
        language: language === "auto" ? null : language,
        translate,
      });
    } catch (e) {
      setStatus("error");
      setStatusMsg(`Transcription failed: ${e}`);
    }
  }, [ensureModel, language, translate]);

  // Listen to Tauri events
  useEffect(() => {
    const unsubs: Promise<UnlistenFn>[] = [];

    unsubs.push(listen<ModelProgress>("model://progress", ({ payload }) => {
      const pct = payload.total > 0 ? (payload.received / payload.total) * 100 : 0;
      setProgress(pct);
      const mb = (payload.received / 1_048_576).toFixed(1);
      const total = payload.total > 0 ? `/ ${(payload.total / 1_048_576).toFixed(1)} MB` : "";
      setStatusMsg(`Downloading model… ${mb} MB ${total}`);
    }));

    unsubs.push(listen<Segment>("transcribe://segment", ({ payload }) => {
      setSegments((prev) => [...prev, payload]);
      setFullText((prev) => prev + payload.text);
      setStatusMsg(`Transcribing… ${fmt(payload.end)}`);
    }));

    unsubs.push(listen<TranscribeDone>("transcribe://done", ({ payload }) => {
      setFullText(payload.full_text);
      setDetectedLang(payload.language);
      setStatus("done");
      setStatusMsg(`Done · ${payload.language}`);
      setProgress(100);
    }));

    return () => { unsubs.forEach((p) => p.then((fn) => fn())); };
  }, []);

  // Drag-and-drop
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const over = (e: DragEvent) => { e.preventDefault(); el.classList.add("drag-over"); };
    const leave = () => el.classList.remove("drag-over");
    const drop = (e: DragEvent) => {
      e.preventDefault();
      el.classList.remove("drag-over");
      const file = e.dataTransfer?.files[0];
      if (file) runTranscription((file as any).path ?? "");
    };
    el.addEventListener("dragover", over);
    el.addEventListener("dragleave", leave);
    el.addEventListener("drop", drop);
    return () => {
      el.removeEventListener("dragover", over);
      el.removeEventListener("dragleave", leave);
      el.removeEventListener("drop", drop);
    };
  }, [runTranscription]);

  async function openFile() {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Audio/Video", extensions: ["mp3", "wav", "m4a", "ogg", "flac", "mp4", "mkv", "webm"] }],
    });
    if (selected) runTranscription(selected as string);
  }

  async function cancelTranscription() {
    await invoke("cancel");
    setStatus("idle");
    setStatusMsg("Cancelled");
  }

  async function copyTranscript() {
    await writeText(fullText);
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy"), 2000);
  }

  async function saveTxt() {
    const path = await save({ filters: [{ name: "Text", extensions: ["txt"] }] });
    if (path) await writeTextFile(path, fullText);
  }

  const isWorking = status === "downloading" || status === "transcribing";

  return (
    <div className="app">
      <header>
        <h1>Falar</h1>
        <p className="subtitle">Offline speech-to-text · 100% local · no API key</p>
      </header>

      <div className="controls">
        <label>
          Model
          <select value={model} onChange={(e) => setModel(e.target.value as ModelSize)} disabled={isWorking}>
            {MODEL_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label>
          Language
          <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={isWorking}>
            <option value="auto">Auto-detect</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
          </select>
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={translate} onChange={(e) => setTranslate(e.target.checked)} disabled={isWorking} />
          Translate to English
        </label>
      </div>

      <div ref={dropRef} className={`drop-zone${isWorking ? " disabled" : ""}`} onClick={!isWorking ? openFile : undefined}>
        <div className="drop-icon">🎙</div>
        <p>Drop audio / video here or <span className="link">click to browse</span></p>
        <p className="drop-hint">mp3 · wav · m4a · ogg · flac · mp4 · mkv · webm</p>
      </div>

      <div className="status-bar">
        <span className={`status-msg status-${status}`}>{statusMsg}</span>
        {isWorking && (
          <button className="btn-cancel" onClick={cancelTranscription}>Cancel</button>
        )}
      </div>

      {isWorking && (
        <div className="progress-wrap">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      {(fullText || segments.length > 0) && (
        <div className="transcript-panel">
          <div className="transcript-header">
            <span>Transcript{detectedLang ? ` · ${detectedLang}` : ""}</span>
            <div className="transcript-actions">
              <button onClick={copyTranscript}>{copyLabel}</button>
              <button onClick={saveTxt}>Save .txt</button>
            </div>
          </div>
          <textarea
            className="transcript"
            value={fullText}
            onChange={(e) => setFullText(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
