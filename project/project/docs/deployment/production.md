# Production Deployment Guide

This guide covers deploying Echofy.ai to production environments.

## 🚀 Deployment Options

### Recommended: Netlify
- **Automatic deployments** from Git
- **Built-in CDN** and edge functions
- **Custom domains** and SSL certificates
- **Environment variable** management

### Alternative: Vercel
- Similar features to Netlify
- Excellent Next.js integration
- Global edge network

### Self-hosted: Docker
- Full control over infrastructure
- Custom server configurations
- Kubernetes deployment options

## 📋 Pre-deployment Checklist

### Environment Setup
- [ ] Production Supabase project configured
- [ ] Environment variables set
- [ ] Domain name configured
- [ ] SSL certificate ready
- [ ] CDN configured

### Security
- [ ] Security headers configured
- [ ] CORS policies set
- [ ] API rate limiting enabled
- [ ] Authentication properly configured
- [ ] Sensitive data encrypted

### Performance
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Caching strategies implemented
- [ ] Performance monitoring setup

### Monitoring
- [ ] Error tracking configured
- [ ] Analytics setup
- [ ] Uptime monitoring enabled
- [ ] Performance metrics tracked

## 🔧 Netlify Deployment

### 1. Build Configuration
Create `netlify.toml`:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Environment Variables
Set in Netlify dashboard:
```
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_key
```

### 3. Deploy Commands
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
npm run deploy
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## ⚙️ Environment Configuration

### Production Environment Variables
```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=your_sentry_dsn
VITE_MIXPANEL_TOKEN=your_mixpanel_token
```

### Security Headers
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
```

## 📊 Monitoring Setup

### Error Tracking (Sentry)
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Analytics (Google Analytics)
```typescript
import { gtag } from 'ga-gtag';

gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
  page_title: document.title,
  page_location: window.location.href,
});
```

### Performance Monitoring
```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

## 🚨 Rollback Strategy

### Automatic Rollback
```bash
# Rollback to previous deployment
netlify rollback

# Rollback to specific deployment
netlify rollback --site-id=SITE_ID --deploy-id=DEPLOY_ID
```

### Manual Rollback
1. Identify stable deployment
2. Revert Git commits
3. Trigger new deployment
4. Verify functionality

## 📈 Performance Optimization

### Bundle Analysis
```bash
npm run analyze
```

### Code Splitting
```typescript
// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
```

### Caching Strategy
```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 🔍 Health Checks

### Application Health
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

### Database Health
```typescript
// Check Supabase connection
const healthCheck = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
};
```

## 📋 Post-deployment Tasks

### Verification
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] Database connections active
- [ ] Monitoring systems active

### Performance Testing
- [ ] Load testing completed
- [ ] Performance metrics baseline
- [ ] Error rates acceptable
- [ ] Response times optimal

### Documentation
- [ ] Deployment notes updated
- [ ] Runbook updated
- [ ] Team notified
- [ ] Changelog updated

## 🆘 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Environment Variable Issues**
```bash
# Verify environment variables
echo $VITE_SUPABASE_URL
netlify env:list
```

**Performance Issues**
```bash
# Analyze bundle size
npm run analyze

# Check for memory leaks
npm run build -- --analyze
```

### Support Contacts
- **DevOps Team**: devops@echofy.ai
- **On-call Engineer**: +1-555-0123
- **Status Page**: status.echofy.ai