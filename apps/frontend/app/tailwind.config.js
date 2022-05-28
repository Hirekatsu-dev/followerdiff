module.exports = {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
  prefix: 'tw-'
}
