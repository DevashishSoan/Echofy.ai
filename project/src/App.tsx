import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';
import RecorderPage from './pages/RecorderPage';
import TranscriptionsPage from './pages/TranscriptionsPage';
import SettingsPage from './pages/SettingsPage';
import TextToSpeechPage from './pages/TextToSpeechPage';
import VoiceCloningPage from './pages/VoiceCloningPage';
import LibraryPage from './pages/LibraryPage';
import LanguageCenterPage from './pages/LanguageCenterPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recorder"
          element={
            <ProtectedRoute>
              <RecorderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transcriptions"
          element={
            <ProtectedRoute>
              <TranscriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/text-to-speech"
          element={
            <ProtectedRoute>
              <TextToSpeechPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/voice-cloning"
          element={
            <ProtectedRoute>
              <VoiceCloningPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <LibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/language-center"
          element={
            <ProtectedRoute>
              <LanguageCenterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;