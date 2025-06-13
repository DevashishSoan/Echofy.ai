import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Trash2, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Transcription {
  id: string;
  title: string;
  content: string;
  word_count: number;
  created_at: string;
}

const TranscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const fetchTranscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTranscriptions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transcription?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('transcriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTranscriptions(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert('Error deleting transcription');
    }
  };

  const handleDownload = (transcription: Transcription) => {
    const element = document.createElement('a');
    const file = new Blob([transcription.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${transcription.title}-${new Date(transcription.created_at).toLocaleDateString()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading transcriptions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">My Transcriptions</h1>
            <p className="text-gray-600">Manage your saved transcriptions</p>
          </div>

          {error && (
            <div className="p-6 bg-red-50 text-red-700">
              Error loading transcriptions: {error}
            </div>
          )}

          {transcriptions.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              No transcriptions yet. Start recording to create one!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transcriptions.map((transcription) => (
                <div key={transcription.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-6 w-6 text-blue-500 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {transcription.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(transcription.created_at).toLocaleDateString()} • {transcription.word_count} words
                        </p>
                        <p className="mt-2 text-gray-600 line-clamp-2">
                          {transcription.content.substring(0, 150)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDownload(transcription)}
                        className="p-2 text-gray-500 hover:text-blue-500"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(transcription.id)}
                        className="p-2 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptionsPage;