const View = require('./lib/View');

module.exports = app => {
  app.view.use('react', View);

  if (app.config.env === 'local') return require('./lib/app.local')(app);

  return require('./lib/app.default')(app);
};
