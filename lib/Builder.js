const pify = require('pify');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const fs = require('fs');
const MFS = require('memory-fs');
const getWebpackConfig = require('./webpack');

module.exports = class Builder {
  constructor(options) {
    this.options = options;
    this.webpackConfig = getWebpackConfig(options);

    // Initialize shared MFS for dev
    this.mfs = options.dev ? new MFS() : fs;

    this.build = this.build.bind(this);
    this.webpackCompile = this.webpackCompile.bind(this);
    this.webpackDev = this.webpackDev.bind(this);
    this.middleware = this.middleware.bind(this);
  }

  async build() {
    const { client, server } = this.webpackConfig;

    await Promise.all([ client, server ].map(c => this.webpackCompile(webpack(c))));
  }

  async webpackCompile(compiler) {
    const { options } = this;
    const { name } = compiler.options;

    if (options.dev) {
      // Client Build, watch is started by dev-middleware
      if (name === 'client') {
        return new Promise(resolve => {
          compiler.hooks.done.tap('cluth-dev', () => resolve());
          return this.webpackDev(compiler);
        });
      }

      // Server, build and watch for changes
      if (name === 'server') {
        return new Promise((resolve, reject) => {
          compiler.watch(options.watch, err => {
            if (err) return reject(err);

            resolve();
          });
        });
      }
    }

    compiler.run = pify(compiler.run);
    const stats = await compiler.run();

    if (stats.hasErrors()) {
      const error = new Error('cluth build error');
      error.stack = stats.toString('errors-only');
      throw error;
    }
  }

  webpackDev(compiler) {
    const { mfs, options } = this;
    // Create webpack dev middleware
    this.devMiddleware = pify(
      webpackDevMiddleware(compiler, {
        stats: false,
        outputFileSystem: mfs,
      })
    );
    // Create webpack hot middleware
    this.hotMiddleware = pify(
      webpackHotMiddleware(compiler, {
        log: false,
        heartbeat: 10000,
        path: `${options.publicPath}__cluth__/hmr`,
      })
    );
  }

  // dev middle
  async middleware(req, res, next) {
    const { devMiddleware, hotMiddleware } = this;
    if (devMiddleware) await devMiddleware(req, res);

    if (hotMiddleware) await hotMiddleware(req, res);

    next();
  }
};