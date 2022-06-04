const path = require('path');
const changed = require('jest-changed-files');

module.exports = {
  async getChangedTestFiles(dir) {
    const res = await changed.getChangedFilesForRoots([ dir ]);
    const changedFiles = res.changedFiles;
    const files = [];
    for (const file of changedFiles) {
      // only find ${dir}/test/**/*.test.(js|ts)
      if (file.startsWith(path.join(dir, 'test')) && file.match(/\.test\.(js|ts)$/)) {
        files.push(file);
      }
    }
    return files;
  },
};
