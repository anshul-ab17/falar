mod model;
mod audio;
mod transcribe;

use tauri::{AppHandle, State};
use serde::Serialize;

struct AppState {
    cancel: transcribe::CancelToken,
}

#[derive(Serialize)]
struct EnsureModelResult {
    cached: bool,
    path: String,
}

#[tauri::command]
async fn ensure_model(app: AppHandle, size: String) -> Result<EnsureModelResult, String> {
    let path = model::ensure_model(app, size)
        .await
        .map_err(|e| e.to_string())?;
    Ok(EnsureModelResult {
        cached: true,
        path: path.to_string_lossy().into_owned(),
    })
}

#[tauri::command]
async fn transcribe(
    app: AppHandle,
    state: State<'_, AppState>,
    source: String,       // file path OR "pcm" (pcm_data provided)
    pcm_data: Option<Vec<f32>>,
    model_path: String,
    language: Option<String>,
    translate: bool,
) -> Result<(), String> {
    state.cancel.reset();
    let cancel = state.cancel.0.clone();

    let app2 = app.clone();
    tokio::task::spawn_blocking(move || {
        let pcm = if source == "pcm" {
            pcm_data.ok_or_else(|| "pcm_data required when source == 'pcm'".to_string())?
        } else {
            audio::decode_audio_file(&source).map_err(|e| e.to_string())?
        };

        transcribe::run_transcription(app2, model_path, pcm, language, translate, cancel)
            .map_err(|e| e.to_string())
    }).await.map_err(|e| e.to_string())?
}

#[tauri::command]
fn cancel(state: State<'_, AppState>) {
    state.cancel.cancel();
}

#[tauri::command]
fn model_cached(app: AppHandle, size: String) -> bool {
    model::model_cached(&app, &size)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .manage(AppState {
            cancel: transcribe::CancelToken::new(),
        })
        .invoke_handler(tauri::generate_handler![
            ensure_model,
            transcribe,
            cancel,
            model_cached,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
