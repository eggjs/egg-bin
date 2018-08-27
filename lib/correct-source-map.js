/**
 * Using to correct sourceMap, only works in test/cov command.
 * See the issue: https://github.com/power-assert-js/espower-typescript/issues/54
 */

'use strict';

const sourceMapSupport = require('source-map-support');
const cacheMap = {};
const extensions = [ '.ts', '.tsx' ];

sourceMapSupport.install({
  environment: 'node',
  retrieveFile(path) {
    return cacheMap[path];
  },
});

for (const ext of extensions) {
  const originalExtension = require.extensions[ext];
  require.extensions[ext] = (module, filePath) => {
    const originalCompile = module._compile;
    module._compile = function(code, filePath) {
      cacheMap[filePath] = code;
      return originalCompile.call(this, code, filePath);
    };
    return originalExtension(module, filePath);
  };
}
