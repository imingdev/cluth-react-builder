/**
 * load client resources
 * @param _fs fs|mfs
 * @param fullPath  file full path
 * @return {{}}
 */
exports.loadResources = (_fs, fullPath) => {
  let result = {};

  try {
    if (_fs.existsSync(fullPath)) {
      const contents = _fs.readFileSync(fullPath, 'utf-8');

      result = JSON.parse(contents) || {};
    }
  } catch (err) {
    result = {};
  }

  return result;
};

/**
 * 空函数
 */
exports.empty = () => {};
