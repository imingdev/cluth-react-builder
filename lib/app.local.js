module.exports = app => {
  app.config.coreMiddleware.unshift('loading', 'proxy');

  app.ready(() => {
    app.messenger.setMaxListeners(Infinity);
  });
};
