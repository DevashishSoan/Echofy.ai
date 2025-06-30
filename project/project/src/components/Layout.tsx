import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Volume2, 
  Users, 
  Library, 
  Globe, 
  Settings, 
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: BarChart3 },
    { name: 'Voice Transcription', href: '/app/transcription', icon: Mic },
    { name: 'Text-to-Speech Studio', href: '/app/tts-studio', icon: Volume2 },
    { name: 'Voice Cloning Lab', href: '/app/voice-cloning', icon: Users },
    { name: 'My Library', href: '/app/library', icon: Library },
    { name: 'Language Center', href: '/app/languages', icon: Globe },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={closeSidebar}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300" />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-full max-w-xs transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Echofy.ai
            </span>
          </div>
          <button 
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-2 border-blue-700 transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-105'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.plan || 'free'} Plan</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Echofy.ai
              </span>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-2 border-blue-700 transform scale-105 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.plan || 'free'} Plan</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Search */}
            <div className="relative flex flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse">
                    3
                  </span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none transform transition-all duration-200 scale-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="py-2">
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <p className="text-sm text-gray-900">Transcription completed</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <p className="text-sm text-gray-900">Voice clone ready</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <p className="text-sm text-gray-900">New feature available</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-900">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none transform transition-all duration-200 scale-100">
                    <Link
                      to="/app/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/app/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;