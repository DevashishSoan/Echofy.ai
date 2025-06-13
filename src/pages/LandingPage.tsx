import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Volume2, Globe, Wand2, Zap, Shield, Clock, Users } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Mic,
      title: 'Real-time Transcription',
      description: 'Convert speech to text instantly with 99% accuracy across 20+ languages'
    },
    {
      icon: Volume2,
      title: 'AI Voice Generation',
      description: 'Create natural-sounding speech with professional-grade AI voices'
    },
    {
      icon: Wand2,
      title: 'Voice Cloning',
      description: 'Clone any voice from audio samples and create custom AI personas'
    },
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description: 'Work seamlessly across English, Spanish, French, German, and 16+ more languages'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process audio in real-time with enterprise-grade performance'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and never shared. Complete privacy guaranteed'
    }
  ];

  const useCases = [
    {
      title: 'Content Creators',
      description: 'Generate voiceovers, transcribe videos, and create multilingual content',
      icon: '🎬'
    },
    {
      title: 'Students & Researchers',
      description: 'Transcribe lectures, interviews, and research materials instantly',
      icon: '📚'
    },
    {
      title: 'Business Professionals',
      description: 'Convert meetings to text, create presentations with AI voices',
      icon: '💼'
    },
    {
      title: 'Podcasters',
      description: 'Generate transcripts, create voice intros, and reach global audiences',
      icon: '🎙️'
    }
  ];

  const languages = [
    { name: 'English', flag: '🇺🇸' },
    { name: 'Spanish', flag: '🇪🇸' },
    { name: 'French', flag: '🇫🇷' },
    { name: 'German', flag: '🇩🇪' },
    { name: 'Italian', flag: '🇮🇹' },
    { name: 'Portuguese', flag: '🇵🇹' },
    { name: 'Japanese', flag: '🇯🇵' },
    { name: 'Korean', flag: '🇰🇷' },
    { name: 'Chinese', flag: '🇨🇳' },
    { name: 'Arabic', flag: '🇸🇦' },
    { name: 'Hindi', flag: '🇮🇳' },
    { name: 'Russian', flag: '🇷🇺' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Mic className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-800">Echofy.ai</span>
            <span className="text-sm text-gray-500 hidden sm:block">Voice AI Platform</span>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/signin')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105"
            >
              Get Started Free
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              The Complete
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600"> Voice AI </span>
              Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Transform speech to text, generate AI voices, clone any voice, and work across 20+ languages. 
              Everything you need for voice AI in one powerful platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 transform hover:scale-105 transition-all shadow-lg"
              >
                Start Free Today
              </button>
              <button
                onClick={() => navigate('/signin')}
                className="px-8 py-4 bg-white text-gray-700 text-lg rounded-lg border border-gray-300 hover:border-gray-400 transition-all"
              >
                Watch Demo
              </button>
            </div>

            {/* Language Showcase */}
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Supported Languages</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {languages.map((lang, index) => (
                  <div key={index} className="flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="text-2xl mb-1">{lang.flag}</span>
                    <span className="text-xs text-gray-600">{lang.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Voice AI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From transcription to voice generation, we've built the most comprehensive voice AI platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <feature.icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect for Every Use Case
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're creating content, studying, or running a business, Echofy.ai adapts to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">20+</div>
              <div className="text-blue-100">Languages Supported</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-blue-100">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-blue-100">AI Voices</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Voice Workflow?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators, students, and professionals who trust Echofy.ai for their voice AI needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 transform hover:scale-105 transition-all"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="px-8 py-4 bg-transparent text-white text-lg rounded-lg border border-gray-600 hover:border-gray-400 transition-all"
            >
              Sign In
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mic className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white">Echofy.ai</span>
              </div>
              <p className="text-gray-400">
                The complete voice AI platform for transcription, generation, and cloning.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-sm">
                <li>Voice Transcription</li>
                <li>Text-to-Speech</li>
                <li>Voice Cloning</li>
                <li>Multi-Language</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Use Cases</h4>
              <ul className="space-y-2 text-sm">
                <li>Content Creation</li>
                <li>Education</li>
                <li>Business</li>
                <li>Podcasting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Contact Us</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Echofy.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;