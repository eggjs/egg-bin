'use strict';

module.exports = appInfo => {
  const config = exports = {};
  config.keys = appInfo.name;
  return config;
};

exports.test = '12345';
