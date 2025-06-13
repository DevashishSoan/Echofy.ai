import axios from 'axios';
import { 
  Voice, 
  GenerationOptions, 
  VoiceCloneRequest, 
  UsageStats,
  VoiceSettings 
} from '../types/elevenlabs';

class ElevenLabsService {
  private apiKey: string;
  private baseURL = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'Accept': 'application/json',
      'xi-api-key': this.apiKey,
    };
  }

  private getMultipartHeaders() {
    return {
      'Accept': 'application/json',
      'xi-api-key': this.apiKey,
      'Content-Type': 'multipart/form-data',
    };
  }

  // Get all available voices
  async getVoices(): Promise<Voice[]> {
    try {
      const response = await axios.get(`${this.baseURL}/voices`, {
        headers: this.getHeaders(),
      });
      return response.data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  // Get specific voice details
  async getVoice(voiceId: string): Promise<Voice> {
    try {
      const response = await axios.get(`${this.baseURL}/voices/${voiceId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching voice:', error);
      throw error;
    }
  }

  // Generate speech from text
  async generateSpeech(options: GenerationOptions): Promise<Blob> {
    try {
      const response = await axios.post(
        `${this.baseURL}/text-to-speech/${options.voice_id}`,
        {
          text: options.text,
          model_id: options.model_id || 'eleven_monolingual_v1',
          voice_settings: options.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true,
          },
        },
        {
          headers: this.getHeaders(),
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

  // Clone a voice
  async cloneVoice(request: VoiceCloneRequest): Promise<Voice> {
    try {
      const formData = new FormData();
      formData.append('name', request.name);
      if (request.description) {
        formData.append('description', request.description);
      }
      
      request.files.forEach((file, index) => {
        formData.append('files', file);
      });

      if (request.labels) {
        formData.append('labels', JSON.stringify(request.labels));
      }

      const response = await axios.post(`${this.baseURL}/voices/add`, formData, {
        headers: this.getMultipartHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error cloning voice:', error);
      throw error;
    }
  }

  // Delete a voice
  async deleteVoice(voiceId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/voices/${voiceId}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Error deleting voice:', error);
      throw error;
    }
  }

  // Get user subscription info
  async getUserInfo(): Promise<UsageStats> {
    try {
      const response = await axios.get(`${this.baseURL}/user`, {
        headers: this.getHeaders(),
      });
      return response.data.subscription;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  // Get voice settings
  async getVoiceSettings(voiceId: string): Promise<VoiceSettings> {
    try {
      const response = await axios.get(`${this.baseURL}/voices/${voiceId}/settings`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching voice settings:', error);
      throw error;
    }
  }

  // Update voice settings
  async updateVoiceSettings(voiceId: string, settings: VoiceSettings): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/voices/${voiceId}/settings/edit`, settings, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Error updating voice settings:', error);
      throw error;
    }
  }

  // Get generation history
  async getHistory(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/history`, {
        headers: this.getHeaders(),
      });
      return response.data.history;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  }

  // Download history item
  async downloadHistoryItem(historyItemId: string): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseURL}/history/${historyItemId}/audio`, {
        headers: this.getHeaders(),
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading history item:', error);
      throw error;
    }
  }
}

export default ElevenLabsService;