const fs = require('fs');
const Constant = require('../../lib/Constant');

module.exports = () => {
  return async (ctx, next) => {
    const app = ctx.app;

    const ready = await new Promise(resolve => {
      app.messenger.once(Constant.EVENT_WEBPACK_BUILD_READY, resolve);
      app.messenger.sendToAgent(Constant.EVENT_WEBPACK_BUILD_READY, null);
    });

    if (ready) {
      await next();
    } else {
      ctx.body = fs.readFileSync(require.resolve('../../lib/template/loading.html'), 'utf8');
    }
  };
};
