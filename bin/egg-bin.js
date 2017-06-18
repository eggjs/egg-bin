#!/usr/bin/env node

'use strict';

process.env.DEBUG = 'coffee*';
const Command = require('..');

new Command().start();
