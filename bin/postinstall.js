#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// try to use INIT_CWD env https://docs.npmjs.com/cli/v9/commands/npm-run-script
// npm_rootpath is npminstall
const npmRunRoot = process.env.INIT_CWD || process.env.npm_rootpath;
if (npmRunRoot) {
  const pkgFile = path.join(npmRunRoot, 'package.json');
  if (fs.existsSync(pkgFile)) {
    const pkg = require(pkgFile);
    if (pkg.egg && pkg.egg.typescript) {
      require('egg-ts-helper/dist/bin');
    }
  }
}
