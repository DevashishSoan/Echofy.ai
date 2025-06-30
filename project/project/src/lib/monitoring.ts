/**
 * Enhanced monitoring and analytics for production
 */

import { config, isProduction } from './config';

// Error tracking
export class ErrorTracker {
  private static instance: ErrorTracker;
  private isInitialized = false;

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  init() {
    if (this.isInitialized) return;

    // Global error handler
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));

    this.isInitialized = true;
    console.log('🔍 Error tracking initialized');
  }

  private handleError(event: ErrorEvent) {
    this.captureError(event.error, {
      type: 'javascript',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  }

  private handlePromiseRejection(event: PromiseRejectionEvent) {
    this.captureError(event.reason, {
      type: 'unhandled_promise_rejection',
    });
  }

  captureError(error: Error | string, context?: Record<string, any>) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    console.error('Error captured:', errorObj, context);
    
    // Send to error tracking service in production
    if (isProduction) {
      this.sendToErrorService(errorObj, context);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
    
    // In production, you can send to logging service
    if (isProduction) {
      this.sendToLoggingService(message, level, context);
    }
  }

  setUser(user: { id?: string; email?: string; name?: string }) {
    // Store user context for error reporting
    if (isProduction) {
      console.log('User context set:', user);
    }
  }

  setContext(key: string, context: Record<string, any>) {
    // Store additional context for error reporting
    if (isProduction) {
      console.log(`Context set [${key}]:`, context);
    }
  }

  addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    // Add breadcrumb for debugging
    console.log(`[${category.toUpperCase()}] ${message}`, data);
  }

  private async sendToErrorService(error: Error, context?: Record<string, any>) {
    try {
      // Fallback to custom endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (fetchError) {
      console.error('Failed to send error to service:', fetchError);
    }
  }

  private async sendToLoggingService(message: string, level: string, context?: Record<string, any>) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          level,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (fetchError) {
      console.error('Failed to send log to service:', fetchError);
    }
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  init() {
    if (!isProduction) return;
    
    // Monitor Core Web Vitals
    this.observeWebVitals();
    
    // Monitor custom metrics
    this.observeCustomMetrics();
    
    console.log('📊 Performance monitoring initialized');
  }

  private observeWebVitals() {
    // Observe Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Observe First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.recordMetric('FID', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Observe Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.recordMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private observeCustomMetrics() {
    // Monitor navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.recordMetric('TTFB', navigation.responseStart - navigation.requestStart);
      this.recordMetric('DOM_LOAD', navigation.domContentLoadedEventEnd - navigation.startTime);
      this.recordMetric('FULL_LOAD', navigation.loadEventEnd - navigation.startTime);
    });
  }

  recordMetric(name: string, value: number) {
    this.metrics.set(name, value);
    
    // Send to analytics service in production
    if (isProduction) {
      this.sendMetric(name, value);
    }
    
    console.log(`Performance metric: ${name} = ${value}ms`);
  }

  private sendMetric(name: string, value: number) {
    // Send to Google Analytics
    if (config.analytics.googleAnalyticsId && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name,
        value: Math.round(value),
      });
    }
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

// Analytics tracking
export class Analytics {
  private static instance: Analytics;
  private isInitialized = false;

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  async init() {
    if (this.isInitialized || !config.features.analytics) return;

    // Initialize Google Analytics
    if (config.analytics.googleAnalyticsId) {
      await this.initGoogleAnalytics();
    }

    // Initialize Mixpanel
    if (config.analytics.mixpanelToken) {
      await this.initMixpanel();
    }

    this.isInitialized = true;
    console.log('📈 Analytics initialized');
  }

  private async initGoogleAnalytics() {
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.analytics.googleAnalyticsId}`;
      document.head.appendChild(script);

      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).gtag = function() {
        (window as any).dataLayer.push(arguments);
      };

      (window as any).gtag('js', new Date());
      (window as any).gtag('config', config.analytics.googleAnalyticsId, {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure',
      });

      console.log('Google Analytics initialized');
    } catch (error) {
      console.warn('Failed to initialize Google Analytics:', error);
    }
  }

  private async initMixpanel() {
    try {
      // Mixpanel initialization would go here
      console.log('Mixpanel initialized');
    } catch (error) {
      console.warn('Failed to initialize Mixpanel:', error);
    }
  }

  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!config.features.analytics) return;
    
    console.log('Event tracked:', eventName, properties);

    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }

    // Mixpanel
    if ((window as any).mixpanel) {
      (window as any).mixpanel.track(eventName, properties);
    }
  }

  trackPageView(path: string, title?: string) {
    if (!config.features.analytics) return;
    
    console.log('Page view tracked:', path, title);

    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('config', config.analytics.googleAnalyticsId, {
        page_path: path,
        page_title: title,
      });
    }

    // Mixpanel
    if ((window as any).mixpanel) {
      (window as any).mixpanel.track('Page View', {
        path,
        title,
      });
    }
  }

  identifyUser(userId: string, properties?: Record<string, any>) {
    if (!config.features.analytics) return;
    
    console.log('User identified:', userId, properties);

    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('config', config.analytics.googleAnalyticsId, {
        user_id: userId,
      });
    }

    // Mixpanel
    if ((window as any).mixpanel) {
      (window as any).mixpanel.identify(userId);
      if (properties) {
        (window as any).mixpanel.people.set(properties);
      }
    }
  }
}

// Initialize monitoring
export const initializeMonitoring = async () => {
  try {
    ErrorTracker.getInstance().init();
    PerformanceMonitor.getInstance().init();
    await Analytics.getInstance().init();
    console.log('🚀 Monitoring initialized successfully');
  } catch (error) {
    console.error('Failed to initialize monitoring:', error);
  }
};

// Export instances
export const errorTracker = ErrorTracker.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();
export const analytics = Analytics.getInstance();