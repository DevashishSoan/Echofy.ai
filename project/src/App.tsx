import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ApiProvider } from './contexts/ApiContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import VoiceTranscription from './pages/VoiceTranscription';
import TextToSpeechStudio from './pages/TextToSpeechStudio';
import VoiceCloningLab from './pages/VoiceCloningLab';
import MyLibrary from './pages/MyLibrary';
import LanguageCenter from './pages/LanguageCenter';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ApiProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route 
                  path="/app" 
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="transcription" element={<VoiceTranscription />} />
                  <Route path="tts-studio" element={<TextToSpeechStudio />} />
                  <Route path="voice-cloning" element={<VoiceCloningLab />} />
                  <Route path="library" element={<MyLibrary />} />
                  <Route path="languages" element={<LanguageCenter />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </Router>
          </ApiProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;