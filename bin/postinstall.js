#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// node posintall.js <egg-ts-helper/dist/bin>
const etsBinName = process.argv[2] || 'egg-ts-helper/dist/bin';

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
      require(etsBinName);
    }
  }
}
