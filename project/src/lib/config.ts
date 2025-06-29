/**
 * Production configuration and environment validation
 */

interface Config {
  supabase: {
    url: string;
    anonKey: string;
  };
  elevenlabs: {
    apiKey?: string;
  };
  app: {
    url: string;
    environment: 'development' | 'staging' | 'production';
  };
  analytics: {
    googleAnalyticsId?: string;
    mixpanelToken?: string;
  };
  monitoring: {
    sentryDsn?: string;
  };
  features: {
    voiceCloning: boolean;
    teamFeatures: boolean;
    analytics: boolean;
  };
}

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

// Validate required environment variables
const validateEnvironment = (): void => {
  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

// Validate environment on module load
validateEnvironment();

export const config: Config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  elevenlabs: {
    apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
  },
  app: {
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    environment: (import.meta.env.NODE_ENV as Config['app']['environment']) || 'development',
  },
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    mixpanelToken: import.meta.env.VITE_MIXPANEL_TOKEN,
  },
  monitoring: {
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  },
  features: {
    voiceCloning: import.meta.env.VITE_ENABLE_VOICE_CLONING === 'true',
    teamFeatures: import.meta.env.VITE_ENABLE_TEAM_FEATURES === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
};

export const isProduction = config.app.environment === 'production';
export const isDevelopment = config.app.environment === 'development';
export const isStaging = config.app.environment === 'staging';