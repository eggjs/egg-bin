#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const runscript = require('runscript');

// node posintall.js </path/to/egg-ts-helper/dist/bin> <framework-package-name>
const etsBinFile = process.argv[2] || require.resolve('egg-ts-helper/dist/bin');
const frameworkPackageName = process.argv[3] || 'egg';

// try to use INIT_CWD env https://docs.npmjs.com/cli/v9/commands/npm-run-script
// npm_rootpath is npminstall
const npmRunRoot = process.env.INIT_CWD || process.env.npm_rootpath;
if (npmRunRoot) {
  const pkgFile = path.join(npmRunRoot, 'package.json');
  if (fs.existsSync(pkgFile)) {
    const pkg = require(pkgFile);
    if (!pkg.egg || !pkg.egg.typescript) return;
    // ignore eggModule and framework
    // framework package.json:
    // "egg": {
    //   "isFramework": true,
    //   "typescript": true
    // }
    if (pkg.eggModule) return;
    if (pkg.egg.isFramework) return;
    // ignore when the current app don't has a framework dependencies
    if (!pkg.dependencies || !pkg.dependencies[frameworkPackageName]) return;
    // set ETS_CWD
    process.env.ETS_CWD = npmRunRoot;
    // https://github.com/eggjs/egg-ts-helper/pull/104
    process.env.ETS_SCRIPT_FRAMEWORK = frameworkPackageName;
    console.log('[egg-bin:postinstall] run %s on %s', etsBinFile, npmRunRoot);
    runscript(`node ${etsBinFile}`);
  }
}
