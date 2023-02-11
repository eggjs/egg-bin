#!/usr/bin/env node

import path from 'node:path';
import { start } from '@artus-cli/artus-cli';

start({ baseDir: path.dirname(__dirname) });
