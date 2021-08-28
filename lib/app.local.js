const fs = require('fs');
const httpProxy = require('koa-server-http-proxy');
const Constant = require('./Constant');

module.exports = app => {
  // webpack build loading
  app.use(async (ctx, next) => {
    const ready = await new Promise(resolve => {
      app.messenger.once(Constant.EVENT_WEBPACK_BUILD_READY, resolve);
      app.messenger.sendToAgent(Constant.EVENT_WEBPACK_BUILD_READY, null);
    });

    if (ready) {
      await next();
    } else {
      ctx.body = fs.readFileSync(require.resolve('./template/loading.html'), 'utf8');
    }
  });

  app.ready(() => {
    app.messenger.setMaxListeners(Infinity);
    // 代理构建服务器，必须放置ready事件中，不然会代理全部导致404
    app.use(async (ctx, next) => {
      const port = await new Promise(resolve => {
        app.messenger.once(Constant.EVENT_WEBPACK_BUILD_PROXY_PORT, resolve);
        app.messenger.sendToAgent(Constant.EVENT_WEBPACK_BUILD_PROXY_PORT, null);
      });

      if (port) {
        const middleware = httpProxy({
          target: `http://127.0.0.1:${port}`,
          logLevel: 'silent',
        });

        return await middleware(ctx, next);
      }

      await next();
    });
  });
};
