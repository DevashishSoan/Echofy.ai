import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, User, Globe, Bell, Shield } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-600">Manage your account preferences</p>
          </div>

          <div className="p-6 space-y-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <User className="h-5 w-5" />
                <h2>Profile Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Globe className="h-5 w-5" />
                <h2>Language Settings</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Transcription Language
                </label>
                <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Bell className="h-5 w-5" />
                <h2>Notifications</h2>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-gray-700">Email notifications for completed transcriptions</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-gray-700">Browser notifications when recording starts/stops</span>
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Shield className="h-5 w-5" />
                <h2>Security</h2>
              </div>
              
              <div className="space-y-4">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Change Password
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                  Delete Account
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;