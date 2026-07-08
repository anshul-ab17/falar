use anyhow::{Result, anyhow};
use symphonia::core::{
    audio::GenericAudioBufferRef,
    codecs::{
        audio::{AudioDecoderOptions, CODEC_ID_NULL_AUDIO},
        CodecParameters,
    },
    errors::Error,
    formats::{FormatOptions, FormatReader, TrackType},
    formats::probe::Hint,
    io::MediaSourceStream,
    meta::MetadataOptions,
};

const TARGET_RATE: u32 = 16_000;

pub fn decode_audio_file(path: &str) -> Result<Vec<f32>> {
    let file = std::fs::File::open(path)?;
    let mss = MediaSourceStream::new(Box::new(file), Default::default());

    let mut hint = Hint::new();
    if let Some(ext) = std::path::Path::new(path).extension().and_then(|e| e.to_str()) {
        hint.with_extension(ext);
    }

    let mut format: Box<dyn FormatReader> = symphonia::default::get_probe()
        .probe(&hint, mss, FormatOptions::default(), MetadataOptions::default())?;

    let track = format
        .first_track_known_codec(TrackType::Audio)
        .ok_or_else(|| anyhow!("no audio track found"))?
        .clone();

    let audio_params = match track.codec_params.as_ref() {
        Some(CodecParameters::Audio(p)) => p.clone(),
        _ => return Err(anyhow!("track has no audio codec parameters")),
    };

    if audio_params.codec == CODEC_ID_NULL_AUDIO {
        return Err(anyhow!("unsupported audio codec"));
    }

    let sample_rate = audio_params.sample_rate.unwrap_or(44100);
    let track_id = track.id;

    let registry = symphonia::default::get_codecs();
    let decoder_reg = registry
        .get_audio_decoder(audio_params.codec)
        .ok_or_else(|| anyhow!("no decoder for codec {:?}", audio_params.codec))?;
    let mut decoder = (decoder_reg.factory)(&audio_params, &AudioDecoderOptions::default())?;

    let mut samples = Vec::<f32>::new();

    loop {
        let packet = match format.next_packet() {
            Ok(Some(p)) => p,
            Ok(None) => break,
            Err(Error::ResetRequired) => {
                decoder.reset();
                continue;
            }
            Err(e) => return Err(e.into()),
        };

        if packet.track_id != track_id {
            continue;
        }

        let decoded: GenericAudioBufferRef<'_> = match decoder.decode(&packet) {
            Ok(d) => d,
            Err(_) => continue,
        };

        let n_ch = decoded.num_planes();
        let mut interleaved = Vec::<f32>::new();
        decoded.copy_to_vec_interleaved(&mut interleaved);

        if n_ch <= 1 {
            samples.extend_from_slice(&interleaved);
        } else {
            // mix down to mono
            samples.extend(
                interleaved
                    .chunks_exact(n_ch)
                    .map(|frame| frame.iter().sum::<f32>() / n_ch as f32),
            );
        }
    }

    Ok(resample_linear(samples, sample_rate))
}

fn resample_linear(input: Vec<f32>, from_rate: u32) -> Vec<f32> {
    if from_rate == TARGET_RATE {
        return input;
    }
    let ratio = from_rate as f64 / TARGET_RATE as f64;
    let out_len = (input.len() as f64 / ratio) as usize;
    let last = input.len().saturating_sub(1);
    (0..out_len)
        .map(|i| {
            let pos = i as f64 * ratio;
            let lo = pos as usize;
            let hi = (lo + 1).min(last);
            let frac = (pos - lo as f64) as f32;
            input[lo] * (1.0 - frac) + input[hi] * frac
        })
        .collect()
}
