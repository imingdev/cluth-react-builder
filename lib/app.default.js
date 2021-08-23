const path = require('path');
const fs = require('fs');

module.exports = app => {
  app.ready(async () => {
    const options = app.config.builder;
    options.dev = false;

    if (!fs.existsSync(path.join(options.dir.root, options.dir.build, options.dir.manifest))) {
      // 构建目录不存在先构建
      const Builder = require('./Builder');
      const builder = new Builder(options);
      await builder.build();
    }
  });
};
