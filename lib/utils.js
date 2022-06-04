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

  getNodeTestCommandAndArgs() {
    if (parseInt(process.version.split('.')[0].substring(1)) < 18) {
      // using user land test module
      // https://github.com/nodejs/node-core-test
      return {
        command: require.resolve('test/bin/node--test'),
        args: [],
      };
    }
    return {
      command: process.execPath,
      args: [ '--test' ],
    };
  },

  get defaultExcludes() {
    return [
      'example/',
      'examples/',
      'mocks**/',
      'docs/',
      // https://github.com/JaKXz/test-exclude/blob/620a7be412d4fc2070d50f0f63e3228314066fc9/index.js#L73
      'test/**',
      'test{,-*}.js',
      '**/*.test.js',
      '**/__tests__/**',
      '**/node_modules/**',
    ];
  },
};
