const path = require('path');

const builderConfig = {
  dev: false,
  env: {},
  publicPath: '/',
  alias: {},
  watch: {
    aggregateTimeout: 1000,
  },
  babel: {
    babelrc: false,
    cacheDirectory: undefined,
    plugins: undefined,
    presets: undefined,
  },
  // config, {isDev, isClient, isServer}
  extend: config => config,
  filenames: {
    // { isDev, isClient, isServer }
    app: ({ isDev }) => (isDev ? '[name].js' : 'js/[contenthash:8].js'),
    chunk: ({ isDev }) => (isDev ? '[name].js' : 'js/[contenthash:8].js'),
    css: ({ isDev }) => (isDev ? '[name].css' : 'css/[contenthash:8].css'),
    img: ({ isDev }) => (isDev ? '[path][name].[ext]' : 'images/[contenthash:8].[ext]'),
    font: ({ isDev }) => (isDev ? '[path][name].[ext]' : 'fonts/[contenthash:8].[ext]'),
    video: ({ isDev }) => (isDev ? '[path][name].[ext]' : 'videos/[contenthash:8].[ext]'),
    cssModulesName: ({ isDev }) => (isDev ? '[name]__[local]--[hash:base64:5]' : '_[hash:base64:10]'),
  },
  pattern: '**/index.{js,jsx}',
  dir: {
    root: process.cwd(),
    src: 'client',
    page: 'pages',
    build: 'dist',
    manifest: 'manifest.json',
    server: 'server/views',
    static: 'static',
  },
  useEslint: false,
  globals: {
    id: 'app-main',
    context: 'window.__INITIAL_STATE__',
  },
};


module.exports = app => ({
  keys: app.name,
  view: {
    root: [
      path.join(builderConfig.dir.root, builderConfig.dir.build, builderConfig.dir.server),
      path.join(app.baseDir, 'app/view'),
    ].join(','),
    mapping: {
      '.js': 'react',
    },
    defaultViewEngine: 'react',
    defaultExtension: '.js',
  },
  builder: builderConfig,
  static: {
    prefix: '/',
    dirs: [{
      prefix: '/static',
      dir: path.join(builderConfig.dir.root, builderConfig.dir.build, builderConfig.dir.static),
    }],
  },
});

