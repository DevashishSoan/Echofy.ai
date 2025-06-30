import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables missing:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'echofy-ai@1.0.0'
    }
  }
});

// Enhanced error handling for Supabase operations
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase ${operation} error:`, error);
  
  if (error?.code === 'PGRST116') {
    return 'No data found';
  }
  
  if (error?.code === '23505') {
    return 'This record already exists';
  }
  
  if (error?.code === '42501') {
    return 'Permission denied. Please check your authentication.';
  }
  
  if (error?.message?.includes('JWT')) {
    return 'Session expired. Please sign in again.';
  }
  
  return error?.message || `Failed to ${operation}`;
};

// Database types with enhanced error handling
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          plan: 'free' | 'pro' | 'enterprise';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          plan?: 'free' | 'pro' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          plan?: 'free' | 'pro' | 'enterprise';
          updated_at?: string;
        };
      };
      transcriptions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          language: string;
          duration: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          language: string;
          duration?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          language?: string;
          duration?: number;
        };
      };
      voice_generations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          text: string;
          voice_id: string;
          voice_name: string;
          language: string;
          audio_url: string;
          settings: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          text: string;
          voice_id: string;
          voice_name: string;
          language: string;
          audio_url: string;
          settings?: any;
          created_at?: string;
        };
        Update: {
          title?: string;
          text?: string;
          voice_id?: string;
          voice_name?: string;
          language?: string;
          audio_url?: string;
          settings?: any;
        };
      };
    };
  };
}

// Connection health check
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};