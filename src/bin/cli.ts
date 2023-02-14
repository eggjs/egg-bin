#!/usr/bin/env node

import path from 'node:path';
import { start } from '@artus-cli/artus-cli';

const isDist = path.basename(path.dirname(__dirname)) === 'dist';
const exclude = [ 'scripts', 'bin', 'test', 'coverage' ];
if (isDist) {
  exclude.push('src');
}

start({ exclude });
