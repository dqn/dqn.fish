module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ["./src/**/*.html", "./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        "theme-color": "#2775cf",
      },
      height: {
        "60vh": "60vh",
      },
    },
  },
  variants: {
    margin: ["first"],
  },
  plugins: [],
};
