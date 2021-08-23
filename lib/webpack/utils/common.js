const fs = require('fs');

exports.findPageFile = (filePath, extensions = [], defaultFilePath) => {
  for (let i = 0, { length } = extensions; i < length; i += 1) {
    const ext = extensions[i];
    const fullFilePath = `${filePath}.${ext}`;
    if (fs.existsSync(fullFilePath)) return fullFilePath;
  }

  return defaultFilePath;
};
