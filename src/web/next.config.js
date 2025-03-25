/**
 * NextJS Configuration for Organization Configuration Management Tool
 * 
 * This file configures NextJS settings, environment variables, security headers,
 * and other options for the application.
 */

/**
 * Define security headers for the application
 * 
 * @returns {Array} Array of security header objects
 */
const securityHeaders = () => {
  return [
    // Content Security Policy (CSP)
    {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts and eval for development
        "style-src 'self' 'unsafe-inline'", // Allow inline styles for shadcn components
        "img-src 'self' data: https:", // Allow images from HTTPS sources
        "font-src 'self'",
        "connect-src 'self'", // Allow API requests to same origin
        "frame-ancestors 'none'", // Don't allow the page to be framed
        "form-action 'self'", // Forms can only submit to same origin
        "base-uri 'self'", // Restrict base URI
        "object-src 'none'", // Don't allow <object>, <embed> or <applet>
      ].join('; '),
    },
    // X-XSS-Protection header
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block',
    },
    // X-Frame-Options header
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    // X-Content-Type-Options header
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    // Referrer-Policy header
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    // Permissions-Policy header
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    },
  ];
};

/**
 * NextJS configuration object
 */
const nextConfig = {
  // Enable React strict mode for development best practices
  reactStrictMode: true,
  
  // Use SWC minification for better performance
  swcMinify: true,
  
  // Environment variables to expose to the client
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  },
  
  // Configure HTTP headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders(),
      },
    ];
  },
  
  // Disable X-Powered-By header
  poweredByHeader: false,
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;