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
              connectSrc: "'self'",
              scriptSrc: ["'self'", "'unsafe-eval'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
            },
          },
          referrerPolicy: ['same-origin', 'strict-origin-when-cross-origin'],
        }),
      },
    ];
  },
};
