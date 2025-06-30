# 🎙️ Echofy.ai - Professional Voice AI Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

![Built with Bolt.new](public/assets/logotext_poweredby_360w.png)

> **This app is proudly built with [Bolt.new](https://bolt.new).**
> 
> The "Built with Bolt.new" badge appears in the footer of every page, centered at the bottom of the app UI and links to https://bolt.new.

> **Transform speech to text, text to speech, and clone voices with professional-grade AI. Support for 20+ languages and 100+ premium voices.**

## 🌟 Features

### 🎯 Core Features
- **Real-time Voice Transcription** - Convert speech to text in 20+ languages
- **Text-to-Speech Studio** - Generate professional speech with 100+ AI voices
- **Voice Cloning Lab** - Create custom voices from audio samples
- **Multi-language Support** - Transcribe and generate speech in multiple languages
- **Cloud Sync** - Secure cloud storage and synchronization
- **Team Collaboration** - Shared workspaces and team management

### 🔧 Technical Features
- **Real-time Processing** - Instant transcription and speech generation
- **Enterprise Security** - End-to-end encryption and secure data handling
- **API Integration** - RESTful APIs for third-party integrations
- **Export Options** - Multiple formats (TXT, DOCX, PDF, SRT, VTT)
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account and project
- **ElevenLabs** API key (for TTS features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/echofy-ai.git
   cd echofy-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   ```bash
   # Run Supabase migrations
   npx supabase db push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 Documentation

### 📚 User Guides
- [Getting Started Guide](./docs/user-guides/getting-started.md)
- [Voice Transcription Tutorial](./docs/user-guides/transcription.md)
- [Text-to-Speech Guide](./docs/user-guides/text-to-speech.md)
- [Voice Cloning Tutorial](./docs/user-guides/voice-cloning.md)

### 🔧 Developer Documentation
- [API Documentation](./docs/api/README.md)
- [Architecture Overview](./docs/development/architecture.md)
- [Component Library](./docs/development/components.md)
- [Database Schema](./docs/development/database.md)

### 🚀 Deployment
- [Production Deployment](./docs/deployment/production.md)
- [Environment Configuration](./docs/deployment/environment.md)
- [Monitoring Setup](./docs/deployment/monitoring.md)

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Test Structure
```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── utils/         # Test utilities
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Voice AI**: ElevenLabs API, Web Speech API
- **Icons**: Lucide React
- **Testing**: Vitest, React Testing Library, Playwright

### Project Structure
```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, API, Language)
├── pages/         # Page components
├── lib/           # Utility libraries
├── types/         # TypeScript type definitions
└── styles/        # Global styles
```

## 🔐 Security

### Security Features
- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row Level Security (RLS)
- **Data Encryption**: End-to-end encryption for sensitive data
- **API Security**: Rate limiting and request validation
- **CORS**: Properly configured cross-origin requests

### Security Best Practices
- Environment variables for sensitive data
- Secure API key management
- Input validation and sanitization
- Regular security audits

## 📊 Performance

### Performance Features
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Browser and CDN caching strategies
- **Image Optimization**: Responsive images and lazy loading

### Performance Monitoring
- Real-time performance metrics
- Error tracking and reporting
- User experience monitoring
- Core Web Vitals tracking

## 🌍 Deployment

### Production Deployment
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Netlify
npm run deploy
```

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs API key | ❌ |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

## 📝 API Documentation

### Authentication
```typescript
// Sign up
const { user, error } = await signup(email, password, name);

// Sign in
const { user, error } = await login(email, password);

// Sign out
await logout();
```

### Voice Transcription
```typescript
// Start transcription
const recorder = new VoiceRecorder({
  language: 'en-US',
  continuous: true
});

recorder.start();
```

### Text-to-Speech
```typescript
// Generate speech
const audioBlob = await generateSpeech(text, voiceId, settings);
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the provided migrations
3. Configure RLS policies
4. Set up authentication providers

### ElevenLabs Setup
1. Create an ElevenLabs account
2. Generate an API key
3. Configure in app settings
4. Test voice generation

## 📈 Monitoring & Analytics

### Error Tracking
- Real-time error monitoring
- Performance tracking
- User behavior analytics
- Custom event tracking

### Metrics Dashboard
- User engagement metrics
- Feature usage statistics
- Performance benchmarks
- Error rate monitoring

## 🆘 Troubleshooting

### Common Issues

**Authentication Issues**
```bash
# Clear browser storage
localStorage.clear();
sessionStorage.clear();

# Check Supabase configuration
npm run check:supabase
```

**Voice Recognition Not Working**
- Ensure HTTPS connection
- Check microphone permissions
- Verify browser compatibility
- Test with different browsers

**API Errors**
- Verify API keys
- Check network connectivity
- Review rate limits
- Check service status

## 📞 Support

- **Documentation**: [docs.echofy.ai](https://docs.echofy.ai)
- **Community**: [Discord](https://discord.gg/echofy)
- **Issues**: [GitHub Issues](https://github.com/your-org/echofy-ai/issues)
- **Email**: support@echofy.ai

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ElevenLabs](https://elevenlabs.io) for voice AI technology
- [Supabase](https://supabase.com) for backend infrastructure
- [Lucide](https://lucide.dev) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com) for styling system

---

**Made with ❤️ by the Echofy.ai Team**
