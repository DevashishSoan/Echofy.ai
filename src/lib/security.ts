/**
 * Security utilities for production
 */

import { config, isProduction } from './config';

export class SecurityManager {
  private static instance: SecurityManager;

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  init() {
    this.setupCSP();
    this.setupSecurityHeaders();
    this.validateEnvironment();
  }

  private setupCSP() {
    if (!isProduction) return;

    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.elevenlabs.io https://*.supabase.co https://www.google-analytics.com",
      "media-src 'self' blob:",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);
  }

  private setupSecurityHeaders() {
    // These would typically be set by the server, but we can add some client-side protections
    if (isProduction) {
      // Prevent clickjacking
      if (window.self !== window.top) {
        // Fix: Assign string instead of Location object
        window.top!.location.href = window.self.location.href;
      }
    }
  }

  private validateEnvironment() {
    if (isProduction) {
      // Ensure we're running on HTTPS
      if (location.protocol !== 'https:') {
        console.warn('Application should be served over HTTPS in production');
      }

      // Check for development tools
      if (typeof window !== 'undefined') {
        const devtools = /./;
        devtools.toString = function() {
          console.warn('Developer tools detected');
          return 'devtools';
        };
        console.log('%c', devtools);
      }
    }
  }

  // Sanitize user input
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate API responses
  validateApiResponse(response: any): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    // Check for common XSS patterns
    const jsonString = JSON.stringify(response);
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    return !xssPatterns.some(pattern => pattern.test(jsonString));
  }

  // Rate limiting for API calls
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }
}

export const securityManager = SecurityManager.getInstance();