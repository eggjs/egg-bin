'use strict';

const path = require('path');
const debug = require('debug')('egg-bin:debug');
const childprocess = require('childprocess');
const semver = require('semver');
const Command = require('./command');

class DebugCommand extends Command {
  constructor() {
    super();
    // you can change to your team npm cli
    this.npmCli = 'cnpm';
  }

  * run(cwd, args) {
    const eggPath = this.getFrameworkOrEggPath(cwd);
    args = yield this.helper.formatArgs(cwd, args, { eggPath });

    const options = {
      env: Object.assign({}, process.env),
    };

    options.env.NODE_ENV = options.env.NODE_ENV || 'development';
    options.env.EGG_DEBUG = 'true';

    yield this.helper.checkDeps();

    // https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V6.md#2016-07-06-version-630-current-fishrock123
    const hasInspector = semver.satisfies(process.versions.node, '>=6.3.0');
    debug('%s %s, hasInspector:%s, NODE_ENV:%s, cwd:%s',
      this.helper.serverBin, args.join(' '), hasInspector, options.env.NODE_ENV, process.cwd());

    if (hasInspector) {
      options.execArgv = [
        '--inspect',
      ];
    } else {
      // try to use iron-node@3 instead
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
    }

    this.helper.forkNode(this.helper.serverBin, args, options);
  }

  getFrameworkOrEggPath(cwd) {
    return this.utils.getFrameworkOrEggPath(cwd);
  }

  help() {
    return 'Debug mode start';
  }
}

module.exports = DebugCommand;
