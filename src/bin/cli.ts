#!/usr/bin/env node

import { start } from '@artus-cli/artus-cli';

const isBuildJavascriptFile = __filename.endsWith('.js');
const exclude = [ 'scripts', 'bin', 'test', 'coverage' ];
if (isBuildJavascriptFile) {
  exclude.push('*.ts');
} else {
  exclude.push('dist');
}

start({ exclude });
