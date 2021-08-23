const path = require('path');
const fs = require('fs');
const Constant = require('../../lib/Constant');
const { loadResources } = require('../../lib/utils');

module.exports = {
  // 获取manifest文件
  async assets(name) {
    const app = this.app;
    const config = app.config.builder;
    const { root, build, manifest } = config.dir;
    const fullPath = path.join(root, build, manifest);

    let resources = {};
    if (app.config.env === 'local') {
      resources = await new Promise(resolve => {
        app.messenger.once(Constant.EVENT_WEBPACK_MEMORY_MANIFEST, resolve);
        app.messenger.sendToAgent(Constant.EVENT_WEBPACK_MEMORY_MANIFEST, fullPath);
      });
    } else {
      resources = await loadResources(fs, fullPath);
    }

    const defaultResult = {
      styles: [],
      scripts: [],
    };

    const res = resources[name] || [];

    if (!res || !res.length) return defaultResult;

    return {
      styles: res.filter(row => /\.css$/.test(row)),
      scripts: res.filter(row => /\.js$/.test(row) && !/\.hot-update.js$/.test(row)),
    };
  },
};
