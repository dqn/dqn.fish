module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ['./src/**/*.html', './src/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        'theme-color': '#368ae9',
      },
      height: {
        '60vh': '60vh',
      },
    },
  },
  variants: {
    margin: ['first'],
  },
  plugins: [],
};
