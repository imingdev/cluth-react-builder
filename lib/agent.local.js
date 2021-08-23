const express = require('express');
const portfinder = require('portfinder');
const Builder = require('./Builder');
const Constant = require('./Constant');
const { loadResources, empty } = require('./utils');

module.exports = agent => {

  const emit = (event, data = null) => agent.messenger.sendToApp(event, data);

  const on = (event, callback = empty) => agent.messenger.on(event, callback);

  on('egg-ready', async () => {
    const options = agent.config.builder;
    options.dev = agent.config.env === 'local';
    if (options.dev && options.publicPath === '/') {
      options.publicPath = '/react/builder/';
    }

    const builder = new Builder(options);

    let ready = false;
    // 获取一个可用端口
    const port = await portfinder.getPortPromise();
    const host = `http://127.0.0.1:${port}`;
    const publicPath = options.publicPath;

    // 获取webpack内存中的文件(manifest)
    on(Constant.EVENT_WEBPACK_MEMORY_MANIFEST, fullPath => {
      const resources = loadResources(builder.mfs, fullPath);
      emit(Constant.EVENT_WEBPACK_MEMORY_MANIFEST, resources);
    });
    // 构建状态是否已经就绪
    on(Constant.EVENT_WEBPACK_BUILD_READY, () => emit(Constant.EVENT_WEBPACK_BUILD_READY, ready));
    // 获取构建代理的配置
    on(Constant.EVENT_WEBPACK_BUILD_PROXY_CONFIG, () => emit(Constant.EVENT_WEBPACK_BUILD_PROXY_CONFIG, {
      host,
      publicPath,
    }));

    await builder.build();

    // 创建一个服务设置webpack中间件并启动
    express().use(builder.middleware).listen(port);

    agent.logger.info(`[agent] client started on ${host}`);

    ready = true;
  });

  agent.ready(() => {
    agent.messenger.setMaxListeners(Infinity);
  });
};
