const debug = require('util').debuglog('egg-bin:lib:start-cluster');

debug('argv: %o', process.argv);
let optionsJSONString = process.argv[2];
if (process.platform === 'win32' && optionsJSONString.startsWith('\'')) {
  // '{"baseDir":" => {"baseDir":
  optionsJSONString = optionsJSONString.startsWith(1, optionsJSONString.length - 1);
}
const options = JSON.parse(optionsJSONString);
debug('start cluster options: %o', options);
require(options.framework).startCluster(options);
