import React, { useState } from 'react';
import { 
  Library, 
  Search, 
  Filter, 
  Play, 
  Download, 
  Trash2, 
  Edit,
  Calendar,
  Clock,
  FileText,
  Volume2,
  Mic,
  Users
} from 'lucide-react';

interface LibraryItem {
  id: string;
  name: string;
  type: 'transcription' | 'tts' | 'voice-clone';
  createdAt: Date;
  duration?: number;
  size: string;
  language: string;
  status: 'completed' | 'processing' | 'failed';
}

const MyLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  // Mock data
  const libraryItems: LibraryItem[] = [
    {
      id: '1',
      name: 'Meeting Notes - Q4 Planning',
      type: 'transcription',
      createdAt: new Date('2024-01-15'),
      duration: 1800,
      size: '2.3 MB',
      language: 'English',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Product Demo Narration',
      type: 'tts',
      createdAt: new Date('2024-01-14'),
      duration: 120,
      size: '1.8 MB',
      language: 'English',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Custom Voice - Sarah',
      type: 'voice-clone',
      createdAt: new Date('2024-01-13'),
      size: '15.2 MB',
      language: 'English',
      status: 'processing'
    },
    {
      id: '4',
      name: 'Podcast Interview Transcript',
      type: 'transcription',
      createdAt: new Date('2024-01-12'),
      duration: 3600,
      size: '4.1 MB',
      language: 'English',
      status: 'completed'
    },
    {
      id: '5',
      name: 'Spanish Tutorial Audio',
      type: 'tts',
      createdAt: new Date('2024-01-11'),
      duration: 300,
      size: '2.7 MB',
      language: 'Spanish',
      status: 'completed'
    }
  ];

  const filteredItems = libraryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'date':
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transcription':
        return <Mic className="w-5 h-5 text-blue-600" />;
      case 'tts':
        return <Volume2 className="w-5 h-5 text-purple-600" />;
      case 'voice-clone':
        return <Users className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'transcription':
        return 'Transcription';
      case 'tts':
        return 'Text-to-Speech';
      case 'voice-clone':
        return 'Voice Clone';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Completed</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Processing</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Failed</span>;
      default:
        return null;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
        <p className="text-gray-600 mt-1">Manage your voice projects and files</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">{libraryItems.length}</p>
            </div>
            <Library className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transcriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {libraryItems.filter(item => item.type === 'transcription').length}
              </p>
            </div>
            <Mic className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">TTS Files</p>
              <p className="text-2xl font-bold text-gray-900">
                {libraryItems.filter(item => item.type === 'tts').length}
              </p>
            </div>
            <Volume2 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Voice Clones</p>
              <p className="text-2xl font-bold text-gray-900">
                {libraryItems.filter(item => item.type === 'voice-clone').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter by Type */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="transcription">Transcriptions</option>
              <option value="tts">Text-to-Speech</option>
              <option value="voice-clone">Voice Clones</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {sortedItems.length === 0 ? (
          <div className="text-center py-12">
            <Library className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start creating voice projects to see them here'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getTypeLabel(item.type)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.language}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-sm text-gray-900">
                        {item.duration && (
                          <>
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{formatDuration(item.duration)}</span>
                          </>
                        )}
                        {!item.duration && <span>-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {item.status === 'completed' && (
                          <>
                            <button className="text-gray-400 hover:text-gray-600 p-1">
                              <Play className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 p-1">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 p-1">
                              <Edit className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="text-gray-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <span className="text-2xl font-bold">Echofy.ai</span>
          </div>
          <div className="text-center text-gray-400 mb-4">
            <p>&copy; 2024 Echofy.ai. All rights reserved.</p>
          </div>
          <div className="flex justify-center">
            <a href="https://bolt.new" target="_blank" rel="noopener noreferrer">
              <img
                src="/assets/logotext_poweredby_360w.png"
                alt="Built with Bolt.new"
                style={{ maxWidth: '150px', display: 'block', margin: '0 auto' }}
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MyLibrary;