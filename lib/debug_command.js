'use strict';

const path = require('path');
const debug = require('debug')('egg-bin:debug');
const childprocess = require('childprocess');
const Command = require('./command');

class DebugCommand extends Command {
  constructor() {
    super();
    // you can change to your team npm cli
    this.npmCli = 'cnpm';
  }

  * run(cwd, args) {
    args.push('--baseDir');
    args.push(cwd);
    args.push('--cluster');
    args.push('1');

    const eggPath = this.getFrameworkOrEggPath(cwd);
    if (eggPath) {
      args.push(`--eggPath=${eggPath}`);
    }

    const options = {
      env: process.env,
    };

    options.env.NODE_ENV = options.env.NODE_ENV || 'development';
    options.env.EGG_DEBUG = 'true';

    debug('%s %s %j', this.helper.serverBin, args.join(' '), options.env.NODE_ENV);
    yield this.helper.checkDeps();

    // auto download iron-node at the first time
    yield this.helper.getIronNodeBin(this.npmCli, cwd);

    childprocess.inject(function(modulePath, args, opt) {
      // this function will be toString() and save to tmp file
      const cluster = require('cluster');
      const originSetupMaster = cluster.setupMaster;
      /* istanbul ignore next */
      cluster.setupMaster = function(settings) {
        if (!settings) return;
        const args = settings.args || [];
        args.unshift(settings.exec);
        settings.args = args;
        settings.exec = process.env.IRON_NODE_PATH;
        originSetupMaster.call(cluster, settings);
      };
      return [ modulePath, args, opt ];
    });

    // iron-node should be installed in cwd,
    // resolve after iron-node installed
    options.env.IRON_NODE_PATH = require.resolve(path.join(process.cwd(), 'node_modules/iron-node/bin/run.js'));
    this.helper.forkNode(this.helper.serverBin, args, options);
  }

  help() {
    return 'Debug mode start';
  }

  getFrameworkOrEggPath(cwd) {
    return this.utils.getFrameworkOrEggPath(cwd);
  }
}

module.exports = DebugCommand;
