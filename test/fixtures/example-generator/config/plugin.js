'use strict';

const path = require('path');

exports.test = {
  path: path.join(__dirname, '../plugin/test'),
};

exports.skipError = {
  path: path.join(__dirname, '../plugin/skip-error'),
};
