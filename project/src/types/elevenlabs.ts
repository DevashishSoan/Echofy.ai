export interface Voice {
  voice_id: string;
  name: string;
  samples: VoiceSample[];
  category: string;
  fine_tuning: {
    language: string;
    is_allowed_to_fine_tune: boolean;
    finetuning_requested: boolean;
    finetuning_state: string;
    verification_attempts: any[];
    verification_failures: string[];
    verification_attempts_count: number;
    slice_ids: string[];
    manual_verification: any;
    manual_verification_requested: boolean;
  };
  labels: Record<string, string>;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings: VoiceSettings;
  sharing: any;
  high_quality_base_model_ids: string[];
  safety_control: any;
  voice_verification: any;
  permission_on_resource: any;
}

export interface VoiceSample {
  sample_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  hash: string;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface GenerationOptions {
  voice_id: string;
  text: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
  pronunciation_dictionary_locators?: any[];
  seed?: number;
  previous_text?: string;
  next_text?: string;
  previous_request_ids?: string[];
  next_request_ids?: string[];
}

export interface VoiceCloneRequest {
  name: string;
  description?: string;
  files: File[];
  labels?: Record<string, string>;
}

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
  voices: string[];
}

export interface TranscriptionResult {
  id: string;
  text: string;
  language: string;
  confidence: number;
  speakers?: Speaker[];
  timestamps?: Timestamp[];
  translation?: Record<string, string>;
}

export interface Speaker {
  id: string;
  name: string;
  segments: SpeakerSegment[];
}

export interface SpeakerSegment {
  start: number;
  end: number;
  text: string;
  confidence: number;
}

export interface Timestamp {
  start: number;
  end: number;
  text: string;
}

export interface AudioGeneration {
  id: string;
  text: string;
  voice_id: string;
  voice_name: string;
  language: string;
  audio_url: string;
  created_at: string;
  settings: VoiceSettings;
  duration: number;
  file_size: number;
}

export interface UsageStats {
  character_count: number;
  character_limit: number;
  can_extend_character_limit: boolean;
  allowed_to_extend_character_limit: boolean;
  next_character_count_reset_unix: number;
  voice_limit: number;
  voice_count: number;
  professional_voice_limit: number;
  can_extend_voice_limit: boolean;
  can_use_instant_voice_cloning: boolean;
  can_use_professional_voice_cloning: boolean;
  currency: string;
  status: string;
}