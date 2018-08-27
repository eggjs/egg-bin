/**
 * Only works in test/cov command with `espower-typescript`.
 *
 * Fix bug that error stack gives incorrect line number and column number in unit testing.
 *
 * ### Reason
 *
 * `espower-typescript` combines the sourceMap of `ts-node` and `power-assert` and return a new sourceMap
 *  for supporting `power-assert`. But `source-map-support` receives old sourceMap when handling the code because
 *  `ts-node` cache its sourceMap in `retrieveFile` method: https://github.com/TypeStrong/ts-node/blob/master/src/index.ts#L218
 *
 * ```typescript
 * // Install source map support and read from memory cache.
 * sourceMapSupport.install({
 *   environment: 'node',
 *   retrieveFile: function (path) {
 *       return memoryCache.outputs[path];
 *     }
 * });
 * ```
 *
 * ### Solution
 *
 * Overwriting the `retrieveFile` method of `source-map-support` in `egg-bin test` to return a correct sourceMap for code.
 *
 *
 * https://github.com/eggjs/egg-bin/pull/107
 * https://github.com/power-assert-js/espower-typescript/issues/54
 *
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
