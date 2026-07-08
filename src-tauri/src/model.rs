use std::path::PathBuf;
use anyhow::{Result, anyhow};
use reqwest::Client;
use futures_util::StreamExt;
use tauri::{AppHandle, Manager, Emitter};
use serde::Serialize;

const HF_BASE: &str = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main";

pub fn model_filename(size: &str) -> String {
    format!("ggml-{}.bin", size)
}

pub fn model_path(app: &AppHandle, size: &str) -> Result<PathBuf> {
    let dir = app.path().app_data_dir()?;
    std::fs::create_dir_all(&dir)?;
    Ok(dir.join(model_filename(size)))
}

pub fn model_cached(app: &AppHandle, size: &str) -> bool {
    model_path(app, size).map(|p| p.exists()).unwrap_or(false)
}

#[derive(Serialize, Clone)]
pub struct ModelProgress {
    pub received: u64,
    pub total: u64,
}

pub async fn ensure_model(app: AppHandle, size: String) -> Result<PathBuf> {
    let path = model_path(&app, &size)?;
    if path.exists() {
        return Ok(path);
    }

    let url = format!("{}/{}", HF_BASE, model_filename(&size));
    let client = Client::new();
    let response = client.get(&url).send().await?;
    if !response.status().is_success() {
        return Err(anyhow!("Model download failed: HTTP {}", response.status()));
    }

    let total = response.content_length().unwrap_or(0);
    let mut received: u64 = 0;
    let mut stream = response.bytes_stream();

    // Write to a temp file, rename on completion so a partial download is never used.
    let tmp = path.with_extension("bin.tmp");
    let mut file = tokio::fs::File::create(&tmp).await?;

    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        tokio::io::AsyncWriteExt::write_all(&mut file, &chunk).await?;
        received += chunk.len() as u64;
        let _ = app.emit("model://progress", ModelProgress { received, total });
    }

    tokio::fs::rename(&tmp, &path).await?;
    Ok(path)
}
