'use strict';

const path = require('path');
const espowerSource = require('espower-source');
const minimatch = require('minimatch');
const sourceMapSupport = require('source-map-support');
const sourceCache = {};
const cwd = process.cwd();

espowerTypeScript({
  pattern: path.resolve(cwd, 'test/**/*.@(js|jsx|ts|tsx)'),
  extensions: [ 'js', 'jsx', 'ts', 'tsx' ],
});

function espowerTypeScript(options) {
  // install source-map-support again to correct the source-map
  sourceMapSupport.install({
    environment: 'node',
    retrieveFile: p => sourceCache[p],
  });

  options.extensions.forEach(ext => {
    espowerTsRegister(`.${ext}`, options);
  });
}

function espowerTsRegister(ext, options) {
  const originalExtension = require.extensions[ext];
  require.extensions[ext] = (module, filepath) => {
    if (!minimatch(filepath, options.pattern)) {
      return originalExtension(module, filepath);
    }
    const originalCompile = module._compile;
    module._compile = function(code, filepath) {
      const newSource = espowerSource(code, filepath, options);
      sourceCache[filepath] = newSource;
      return originalCompile.call(this, newSource, filepath);
    };
    return originalExtension(module, filepath);
  };
}
