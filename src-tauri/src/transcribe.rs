use std::sync::{Arc, Mutex};
use anyhow::Result;
use tauri::{AppHandle, Emitter};
use serde::Serialize;
use whisper_rs::{WhisperContext, WhisperContextParameters, FullParams, SamplingStrategy};

#[derive(Serialize, Clone)]
pub struct Segment {
    pub start: f32,
    pub end: f32,
    pub text: String,
}

#[derive(Serialize, Clone)]
pub struct TranscribeDone {
    pub full_text: String,
    pub language: String,
}

pub struct CancelToken(pub Arc<Mutex<bool>>);

impl CancelToken {
    pub fn new() -> Self { Self(Arc::new(Mutex::new(false))) }
    pub fn cancel(&self) { *self.0.lock().unwrap() = true; }
    pub fn is_cancelled(&self) -> bool { *self.0.lock().unwrap() }
    pub fn reset(&self) { *self.0.lock().unwrap() = false; }
}

pub fn run_transcription(
    app: AppHandle,
    model_path: String,
    pcm: Vec<f32>,
    language: Option<String>,
    translate: bool,
    cancel: Arc<Mutex<bool>>,
) -> Result<()> {
    let ctx = WhisperContext::new_with_params(&model_path, WhisperContextParameters::default())?;
    let mut state = ctx.create_state()?;

    let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
    params.set_print_progress(false);
    params.set_print_realtime(false);
    params.set_print_timestamps(false);
    params.set_translate(translate);

    if let Some(ref lang) = language {
        params.set_language(Some(lang));
    } else {
        params.set_language(Some("auto"));
    }

    let app_seg = app.clone();
    params.set_segment_callback_safe(move |data: whisper_rs::SegmentCallbackData| {
        let seg = Segment {
            start: data.start_timestamp as f32 / 100.0,
            end: data.end_timestamp as f32 / 100.0,
            text: data.text.clone(),
        };
        let _ = app_seg.emit("transcribe://segment", seg);
    });

    state.full(params, &pcm)?;

    if *cancel.lock().unwrap() {
        return Ok(());
    }

    let n = state.full_n_segments();
    let mut full_text = String::new();
    for i in 0..n {
        if let Some(seg) = state.get_segment(i) {
            full_text.push_str(&seg.to_string());
        }
    }

    let lang_id = state.full_lang_id_from_state();
    let language = if lang_id >= 0 {
        whisper_rs::get_lang_str(lang_id)
            .unwrap_or("unknown")
            .to_string()
    } else {
        "unknown".to_string()
    };

    app.emit("transcribe://done", TranscribeDone { full_text, language })?;
    Ok(())
}
