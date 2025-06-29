# Echofy.ai API Documentation

## 🌐 Overview

The Echofy.ai API provides programmatic access to voice transcription, text-to-speech, and voice cloning capabilities.

## 🔐 Authentication

All API requests require authentication using Supabase JWT tokens.

```typescript
// Get auth token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Use in requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

## 📋 Base URL

```
Production: https://api.echofy.ai/v1
Staging: https://staging-api.echofy.ai/v1
```

## 🎙️ Voice Transcription API

### Start Transcription Session

```http
POST /transcription/sessions
```

**Request Body:**
```json
{
  "language": "en-US",
  "settings": {
    "continuous": true,
    "interimResults": true,
    "maxAlternatives": 1
  }
}
```

**Response:**
```json
{
  "sessionId": "session_123",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Upload Audio for Transcription

```http
POST /transcription/sessions/{sessionId}/audio
Content-Type: multipart/form-data
```

**Request:**
```typescript
const formData = new FormData();
formData.append('audio', audioBlob, 'audio.wav');

fetch(`/transcription/sessions/${sessionId}/audio`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**Response:**
```json
{
  "transcriptionId": "trans_456",
  "text": "Hello, this is a test transcription.",
  "confidence": 0.95,
  "language": "en-US",
  "duration": 3.2,
  "timestamps": [
    { "word": "Hello", "start": 0.0, "end": 0.5 },
    { "word": "this", "start": 0.6, "end": 0.8 }
  ]
}
```

### Get Transcription Results

```http
GET /transcription/{transcriptionId}
```

**Response:**
```json
{
  "id": "trans_456",
  "text": "Hello, this is a test transcription.",
  "confidence": 0.95,
  "language": "en-US",
  "duration": 3.2,
  "status": "completed",
  "createdAt": "2024-01-01T00:00:00Z",
  "segments": [
    {
      "text": "Hello, this is a test transcription.",
      "start": 0.0,
      "end": 3.2,
      "confidence": 0.95
    }
  ]
}
```

## 🔊 Text-to-Speech API

### Generate Speech

```http
POST /tts/generate
```

**Request Body:**
```json
{
  "text": "Hello, this is a test message.",
  "voiceId": "voice_123",
  "settings": {
    "stability": 0.5,
    "similarityBoost": 0.5,
    "style": 0.0,
    "useSpeakerBoost": true
  },
  "outputFormat": "mp3"
}
```

**Response:**
```json
{
  "audioId": "audio_789",
  "audioUrl": "https://cdn.echofy.ai/audio/audio_789.mp3",
  "duration": 2.1,
  "characterCount": 29,
  "status": "completed"
}
```

### List Available Voices

```http
GET /tts/voices
```

**Query Parameters:**
- `language` (optional): Filter by language code
- `category` (optional): Filter by voice category
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
{
  "voices": [
    {
      "id": "voice_123",
      "name": "Sarah",
      "description": "Young American female voice",
      "language": "en-US",
      "category": "premade",
      "labels": {
        "gender": "female",
        "age": "young",
        "accent": "american"
      },
      "previewUrl": "https://cdn.echofy.ai/previews/voice_123.mp3"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 50
}
```

## 👥 Voice Cloning API

### Create Voice Clone

```http
POST /voice-cloning/voices
Content-Type: multipart/form-data
```

**Request:**
```typescript
const formData = new FormData();
formData.append('name', 'My Custom Voice');
formData.append('description', 'A custom voice clone');
formData.append('samples', audioFile1);
formData.append('samples', audioFile2);
formData.append('samples', audioFile3);
```

**Response:**
```json
{
  "voiceId": "custom_voice_456",
  "name": "My Custom Voice",
  "description": "A custom voice clone",
  "status": "training",
  "progress": 0,
  "estimatedCompletion": "2024-01-01T00:15:00Z"
}
```

### Get Voice Clone Status

```http
GET /voice-cloning/voices/{voiceId}
```

**Response:**
```json
{
  "voiceId": "custom_voice_456",
  "name": "My Custom Voice",
  "description": "A custom voice clone",
  "status": "completed",
  "progress": 100,
  "createdAt": "2024-01-01T00:00:00Z",
  "completedAt": "2024-01-01T00:12:34Z",
  "sampleCount": 3,
  "quality": "high"
}
```

## 📊 Analytics API

### Get Usage Statistics

```http
GET /analytics/usage
```

**Query Parameters:**
- `startDate`: Start date (ISO 8601)
- `endDate`: End date (ISO 8601)
- `granularity`: `day`, `week`, `month`

**Response:**
```json
{
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "usage": {
    "transcriptionMinutes": 120.5,
    "ttsCharacters": 15000,
    "voiceClones": 2,
    "apiCalls": 450
  },
  "limits": {
    "transcriptionMinutes": 300,
    "ttsCharacters": 50000,
    "voiceClones": 5,
    "apiCalls": 1000
  }
}
```

## 🔧 Webhooks

### Configure Webhooks

```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/echofy",
  "events": [
    "transcription.completed",
    "tts.generated",
    "voice_clone.completed"
  ],
  "secret": "your_webhook_secret"
}
```

### Webhook Events

#### Transcription Completed
```json
{
  "event": "transcription.completed",
  "data": {
    "transcriptionId": "trans_456",
    "text": "Transcribed text here",
    "confidence": 0.95,
    "duration": 3.2
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### TTS Generated
```json
{
  "event": "tts.generated",
  "data": {
    "audioId": "audio_789",
    "audioUrl": "https://cdn.echofy.ai/audio/audio_789.mp3",
    "text": "Generated text",
    "voiceId": "voice_123"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 📝 Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "language",
      "reason": "Unsupported language code"
    }
  },
  "requestId": "req_123456"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `AUTHENTICATION_REQUIRED` | Missing or invalid authentication |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INVALID_REQUEST` | Malformed request |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `QUOTA_EXCEEDED` | Usage quota exceeded |
| `PROCESSING_ERROR` | Error during processing |

## 📊 Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| `/transcription/*` | 100 requests/minute |
| `/tts/*` | 50 requests/minute |
| `/voice-cloning/*` | 10 requests/minute |
| `/analytics/*` | 60 requests/minute |

## 🔍 SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @echofy/sdk
```

```typescript
import { EchofyClient } from '@echofy/sdk';

const client = new EchofyClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.echofy.ai/v1'
});

// Transcribe audio
const transcription = await client.transcription.create({
  audio: audioBlob,
  language: 'en-US'
});

// Generate speech
const audio = await client.tts.generate({
  text: 'Hello world',
  voiceId: 'voice_123'
});
```

### Python
```bash
pip install echofy-python
```

```python
from echofy import EchofyClient

client = EchofyClient(api_key='your_api_key')

# Transcribe audio
transcription = client.transcription.create(
    audio=audio_file,
    language='en-US'
)

# Generate speech
audio = client.tts.generate(
    text='Hello world',
    voice_id='voice_123'
)
```

## 🧪 Testing

### Test Environment
```
Base URL: https://api-test.echofy.ai/v1
```

### Test API Keys
Contact support for test API keys that don't count against quotas.

## 📞 Support

- **API Documentation**: [docs.echofy.ai/api](https://docs.echofy.ai/api)
- **Status Page**: [status.echofy.ai](https://status.echofy.ai)
- **Support Email**: api-support@echofy.ai
- **Discord**: [discord.gg/echofy-dev](https://discord.gg/echofy-dev)