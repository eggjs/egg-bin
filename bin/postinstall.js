#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const runscript = require('runscript');

// node posintall.js </path/to/egg-ts-helper/dist/bin>
const etsBinFile = process.argv[2] || require.resolve('egg-ts-helper/dist/bin');

// try to use INIT_CWD env https://docs.npmjs.com/cli/v9/commands/npm-run-script
// npm_rootpath is npminstall
const npmRunRoot = process.env.INIT_CWD || process.env.npm_rootpath;
if (npmRunRoot) {
  const pkgFile = path.join(npmRunRoot, 'package.json');
  if (fs.existsSync(pkgFile)) {
    const pkg = require(pkgFile);
    // ignore eggModule
    if (!pkg.eggModule && pkg.egg && pkg.egg.typescript) {
      // set ETS_CWD
      process.env.ETS_CWD = npmRunRoot;
      console.log('[egg-bin:postinstall] run %s on %s', etsBinFile, npmRunRoot);
      runscript(`node ${etsBinFile}`);
    }
  }
}
