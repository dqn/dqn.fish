const { createSecureHeaders } = require('next-secure-headers');

module.exports = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: createSecureHeaders({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: "'self'",
              connectSrc: ["'self'", 'https://www.google-analytics.com'],
              scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
              scriptSrcElem: [
                "'self'",
                'https://www.googletagmanager.com',
                "'unsafe-inline'",
              ],
              styleSrc: ["'self'", "'unsafe-inline'"],
            },
          },
          referrerPolicy: ['same-origin', 'strict-origin-when-cross-origin'],
        }),
      },
    ];
  },
};
