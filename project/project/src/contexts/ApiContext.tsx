import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { config } from '../lib/config';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
  preview_url?: string;
  labels: Record<string, string>;
}

interface ApiContextType {
  elevenLabsApiKey: string | null;
  setElevenLabsApiKey: (key: string) => void;
  voices: Voice[];
  loadVoices: () => Promise<void>;
  generateSpeech: (text: string, voiceId: string, settings?: any) => Promise<Blob>;
  usage: {
    charactersUsed: number;
    charactersLimit: number;
  };
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// Secure API key management
class SecureStorage {
  private static readonly API_KEY_PREFIX = 'echofy_api_';
  
  static setApiKey(service: string, key: string): void {
    try {
      // In production, encrypt the API key before storing
      const encrypted = btoa(key); // Basic encoding - use proper encryption in production
      localStorage.setItem(`${this.API_KEY_PREFIX}${service}`, encrypted);
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw new Error('Failed to store API key securely');
    }
  }
  
  static getApiKey(service: string): string | null {
    try {
      const encrypted = localStorage.getItem(`${this.API_KEY_PREFIX}${service}`);
      return encrypted ? atob(encrypted) : null;
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      return null;
    }
  }
  
  static removeApiKey(service: string): void {
    try {
      localStorage.removeItem(`${this.API_KEY_PREFIX}${service}`);
    } catch (error) {
      console.error('Failed to remove API key:', error);
    }
  }
  
  static validateApiKey(key: string): boolean {
    // Basic validation - enhance based on service requirements
    return key.length > 10 && /^[a-zA-Z0-9_-]+$/.test(key);
  }
}

// ElevenLabs API service
class ElevenLabsService {
  private static readonly BASE_URL = 'https://api.elevenlabs.io/v1';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000;
  
  static async makeRequest(
    endpoint: string, 
    apiKey: string, 
    options: RequestInit = {},
    retryCount = 0
  ): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
      console.log(`Making ElevenLabs API request to: ${this.BASE_URL}${endpoint}`);
      
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      console.log(`ElevenLabs API response status: ${response.status}`);
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.RETRY_DELAY * Math.pow(2, retryCount);
        
        if (retryCount < this.MAX_RETRIES) {
          console.log(`Rate limited, retrying after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(endpoint, apiKey, options, retryCount + 1);
        }
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText };
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Invalid API key. Please check your ElevenLabs API key.');
          case 403:
            throw new Error('Access forbidden. Please check your API key permissions.');
          case 404:
            throw new Error('Resource not found. Please check the voice ID.');
          case 422:
            throw new Error(errorData.detail || 'Invalid request parameters.');
          default:
            throw new Error(errorData.detail || `API Error: ${response.status}`);
        }
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please check your connection and try again.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }
  
  static async getVoices(apiKey: string): Promise<Voice[]> {
    try {
      const response = await this.makeRequest('/voices', apiKey);
      const data = await response.json();
      console.log('Voices loaded successfully:', data.voices?.length || 0);
      return data.voices || [];
    } catch (error) {
      console.error('Failed to load voices:', error);
      throw error;
    }
  }
  
  static async generateSpeech(
    text: string, 
    voiceId: string, 
    apiKey: string, 
    settings: any = {}
  ): Promise<Blob> {
    if (!text.trim()) {
      throw new Error('Text cannot be empty');
    }
    
    if (text.length > 5000) {
      throw new Error('Text is too long. Maximum 5000 characters allowed.');
    }
    
    console.log(`Generating speech for voice: ${voiceId}, text length: ${text.length}`);
    
    const response = await this.makeRequest(`/text-to-speech/${voiceId}`, apiKey, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: Math.max(0, Math.min(1, settings.stability || 0.5)),
          similarity_boost: Math.max(0, Math.min(1, settings.similarity_boost || 0.5)),
          style: Math.max(0, Math.min(1, settings.style || 0.0)),
          use_speaker_boost: Boolean(settings.use_speaker_boost)
        }
      })
    });
    
    const audioBlob = await response.blob();
    console.log('Speech generated successfully, blob size:', audioBlob.size);
    return audioBlob;
  }
  
  static async getUsage(apiKey: string): Promise<{ charactersUsed: number; charactersLimit: number }> {
    try {
      const response = await this.makeRequest('/user/subscription', apiKey);
      const data = await response.json();
      
      return {
        charactersUsed: data.character_count || 0,
        charactersLimit: data.character_limit || 10000
      };
    } catch (error) {
      console.warn('Failed to get usage data:', error);
      // Return default values if usage endpoint fails
      return {
        charactersUsed: 0,
        charactersLimit: 10000
      };
    }
  }
}

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elevenLabsApiKey, setElevenLabsApiKeyState] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [usage, setUsage] = useState({
    charactersUsed: 0,
    charactersLimit: 10000
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Initialize API key from environment or secure storage
  useEffect(() => {
    // First check environment variable
    const envApiKey = config.elevenlabs.apiKey;
    if (envApiKey && SecureStorage.validateApiKey(envApiKey)) {
      console.log('ElevenLabs API key loaded from environment');
      setElevenLabsApiKeyState(envApiKey);
      return;
    }

    // Fallback to secure storage
    const savedKey = SecureStorage.getApiKey('elevenlabs');
    if (savedKey && SecureStorage.validateApiKey(savedKey)) {
      console.log('ElevenLabs API key loaded from storage');
      setElevenLabsApiKeyState(savedKey);
    } else {
      console.log('No valid ElevenLabs API key found');
    }
  }, []);

  const setElevenLabsApiKey = useCallback((key: string) => {
    setError(null);
    
    if (!key.trim()) {
      setError('API key cannot be empty');
      return;
    }
    
    if (!SecureStorage.validateApiKey(key)) {
      setError('Invalid API key format');
      return;
    }
    
    try {
      SecureStorage.setApiKey('elevenlabs', key);
      setElevenLabsApiKeyState(key);
      console.log('ElevenLabs API key saved successfully');
    } catch (error) {
      setError('Failed to save API key securely');
    }
  }, []);

  const loadVoices = useCallback(async () => {
    if (!elevenLabsApiKey) {
      setError('ElevenLabs API key is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading voices from ElevenLabs...');
      const voicesData = await ElevenLabsService.getVoices(elevenLabsApiKey);
      setVoices(voicesData);
      
      // Also load usage data
      try {
        const usageData = await ElevenLabsService.getUsage(elevenLabsApiKey);
        setUsage(usageData);
      } catch (usageError) {
        console.warn('Failed to load usage data:', usageError);
        // Continue without usage data
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load voices';
      console.error('Voice loading error:', errorMessage);
      setError(errorMessage);
      
      // Fallback to mock voices for demo
      console.log('Using fallback mock voices');
      setVoices([
        {
          voice_id: 'rachel',
          name: 'Rachel',
          category: 'premade',
          description: 'Young American female',
          labels: { accent: 'american', age: 'young', gender: 'female' }
        },
        {
          voice_id: 'drew',
          name: 'Drew',
          category: 'premade',
          description: 'Middle aged American male',
          labels: { accent: 'american', age: 'middle_aged', gender: 'male' }
        },
        {
          voice_id: 'clyde',
          name: 'Clyde',
          category: 'premade',
          description: 'Middle aged American male',
          labels: { accent: 'american', age: 'middle_aged', gender: 'male' }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [elevenLabsApiKey]);

  const generateSpeech = useCallback(async (
    text: string, 
    voiceId: string, 
    settings: any = {}
  ): Promise<Blob> => {
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    setError(null);

    try {
      const audioBlob = await ElevenLabsService.generateSpeech(text, voiceId, elevenLabsApiKey, settings);
      
      // Update usage
      setUsage(prev => ({
        ...prev,
        charactersUsed: prev.charactersUsed + text.length
      }));
      
      return audioBlob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate speech';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [elevenLabsApiKey]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ApiContext.Provider value={{
      elevenLabsApiKey,
      setElevenLabsApiKey,
      voices,
      loadVoices,
      generateSpeech,
      usage,
      isLoading,
      error,
      clearError
    }}>
      {children}
    </ApiContext.Provider>
  );
};