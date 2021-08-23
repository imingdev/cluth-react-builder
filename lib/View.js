const path = require('path');
const React = require('react');
const ReactDomServer = require('react-dom/server');
const { Helmet } = require('react-helmet');

module.exports = class View {
  constructor(ctx) {
    this.ctx = ctx;
    this.app = ctx.app;

    this.config = ctx.app.config.builder;

    this.cache = {};

    this.resolve = this.resolve.bind(this);
    this.requireReactComponent = this.requireReactComponent.bind(this);
    this.createReactElement = this.createReactElement.bind(this);
    this.renderReactToString = this.renderReactToString.bind(this);
    this.renderReactToStaticMarkup = this.renderReactToStaticMarkup.bind(this);
    this.render = this.render.bind(this);
    this.renderString = this.renderString.bind(this);
    this.getAssets = this.getAssets.bind(this);
  }

  resolve(...p) {
    return path.join.apply(path, [ this.config.dir.root ].concat(p));
  }

  // 加载react组件
  requireReactComponent(_path) {
    const { config, resolve, cache } = this;
    const { dev, dir } = config;
    const fullPath = resolve(dir.build, dir.server, _path);

    let component = cache[fullPath] || require(fullPath);
    if (!component) {
      component = require(fullPath);
      if (!dev) this.cache[fullPath] = component;
    }

    const { default: Component, getServerSideProps } = component;
    if (dev) delete require.cache[fullPath];

    return { Component, getServerSideProps };
  }

  // 创建react元素
  createReactElement(component, opt) {
    return React.createElement(component, opt);
  }

  // 将react组件str
  renderReactToString(component, opt) {
    return ReactDomServer.renderToString(this.createReactElement(component, opt));
  }

  // 将react组件渲染
  renderReactToStaticMarkup(component, opt) {
    return ReactDomServer.renderToStaticMarkup(this.createReactElement(component, opt));
  }

  // 获取资源
  getAssets(name) {
    const { ctx } = this;
    const assets = ctx.helper.assets.bind(ctx);

    return assets(name.replace(new RegExp(`${path.extname(name)}$`), ''));
  }

  async render(fullPath, ctx, { name, locals }) {
    const { requireReactComponent, renderReactToString, renderReactToStaticMarkup, config, getAssets } = this;
    // Get assets
    const { scripts: pageScripts, styles: pageStyles } = await getAssets(name);
    // Document
    const { Component: Document } = requireReactComponent('_document.js');
    // App
    const { Component: App } = requireReactComponent('_app.js');
    // Component
    const { Component } = requireReactComponent(name);

    // body
    const body = renderReactToString(App, {
      pageProps: locals,
      Component,
    });

    // helmet
    const helmet = Helmet.renderStatic();

    // document(body, pageScripts, pageStyles, state, helmet, context, id)
    const content = renderReactToStaticMarkup(Document, {
      body,
      pageScripts,
      pageStyles,
      state: locals,
      helmet,
      context: config.globals.context,
      id: config.globals.id,
    });

    return Promise.resolve(`<!doctype html>${content}`);
  }

  renderString() {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject('not implemented yet!');
  }
};
