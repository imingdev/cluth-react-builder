const proxy = require('koa-server-http-proxy');
const Constant = require('../../lib/Constant');

module.exports = () => {
  return async (ctx, next) => {
    const app = ctx.app;

    const proxyConfig = await new Promise(resolve => {
      app.messenger.once(Constant.EVENT_WEBPACK_BUILD_PROXY_CONFIG, resolve);
      app.messenger.sendToAgent(Constant.EVENT_WEBPACK_BUILD_PROXY_CONFIG, null);
    });

    if (proxyConfig) {
      const middleware = proxy(proxyConfig.publicPath, {
        target: proxyConfig.host,
        logLevel: 'silent',
      });

      return await middleware(ctx, next);
    }

    await next();
  };
};
