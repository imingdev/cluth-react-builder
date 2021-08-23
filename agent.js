module.exports = agent => {
  if (agent.config.env === 'local') return require('./lib/agent.local')(agent);
};
