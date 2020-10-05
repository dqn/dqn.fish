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
    },
  },
  variants: {},
  plugins: [],
};
