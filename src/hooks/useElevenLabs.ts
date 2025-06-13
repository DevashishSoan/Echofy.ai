import { useState, useEffect, useCallback } from 'react';
import ElevenLabsService from '../services/elevenlabs';
import { Voice, GenerationOptions, VoiceCloneRequest, UsageStats } from '../types/elevenlabs';

export const useElevenLabs = (apiKey?: string) => {
  const [service, setService] = useState<ElevenLabsService | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  useEffect(() => {
    if (apiKey) {
      setService(new ElevenLabsService(apiKey));
    } else {
      setService(null);
    }
  }, [apiKey]);

  const fetchVoices = useCallback(async () => {
    if (!service) return;
    
    setLoading(true);
    setError(null);
    try {
      const voicesData = await service.getVoices();
      setVoices(voicesData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch voices');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const fetchUsageStats = useCallback(async () => {
    if (!service) return;
    
    try {
      const stats = await service.getUserInfo();
      setUsageStats(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch usage stats');
    }
  }, [service]);

  const generateSpeech = useCallback(async (options: GenerationOptions): Promise<Blob | null> => {
    if (!service) return null;
    
    setLoading(true);
    setError(null);
    try {
      const audioBlob = await service.generateSpeech(options);
      await fetchUsageStats(); // Update usage stats after generation
      return audioBlob;
    } catch (err: any) {
      setError(err.message || 'Failed to generate speech');
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, fetchUsageStats]);

  const cloneVoice = useCallback(async (request: VoiceCloneRequest): Promise<Voice | null> => {
    if (!service) return null;
    
    setLoading(true);
    setError(null);
    try {
      const newVoice = await service.cloneVoice(request);
      await fetchVoices(); // Refresh voices list
      return newVoice;
    } catch (err: any) {
      setError(err.message || 'Failed to clone voice');
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, fetchVoices]);

  const deleteVoice = useCallback(async (voiceId: string): Promise<boolean> => {
    if (!service) return false;
    
    setLoading(true);
    setError(null);
    try {
      await service.deleteVoice(voiceId);
      await fetchVoices(); // Refresh voices list
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete voice');
      return false;
    } finally {
      setLoading(false);
    }
  }, [service, fetchVoices]);

  useEffect(() => {
    if (service) {
      fetchVoices();
      fetchUsageStats();
    }
  }, [service, fetchVoices, fetchUsageStats]);

  return {
    service,
    voices,
    loading,
    error,
    usageStats,
    generateSpeech,
    cloneVoice,
    deleteVoice,
    fetchVoices,
    fetchUsageStats,
    clearError: () => setError(null),
  };
};