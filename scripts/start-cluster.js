const debug = require('util').debuglog('egg-bin:lib:start-cluster');

debug('argv: %o', process.argv);
const options = JSON.parse(process.argv[2]);
debug('start cluster options: %o', options);
require(options.framework).startCluster(options);
