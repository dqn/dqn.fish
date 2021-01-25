const { createSecureHeaders } = require("next-secure-headers");

module.exports = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: createSecureHeaders({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: "'self'",
              connectSrc: [
                "'self'",
                "https://www.google-analytics.com",
                "https://vitals.vercel-analytics.com",
                "https://vitals.vercel-insights.com",
              ],
              scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
              scriptSrcElem: [
                "'self'",
                "https://www.googletagmanager.com",
                "'unsafe-inline'",
              ],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["https://i.gyazo.com"],
            },
          },
          referrerPolicy: ["same-origin", "strict-origin-when-cross-origin"],
        }),
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};
