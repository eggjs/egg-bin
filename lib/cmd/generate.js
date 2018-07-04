'use strict';

const debug = require('debug')('egg-bin');
const Command = require('../command');
const path = require('path');
const utils = require('egg-utils');

class GenerateCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin generate [dir] [options]';

    this.options = {
      baseDir: {
        description: 'directory of application, default to `process.cwd()`',
        type: 'string',
      },
      env: {
        description: 'server env',
        type: 'string',
        default: 'prod',
      },
      framework: {
        description: 'specify framework that can be absolute path or npm package',
        type: 'string',
      },
    };
  }

  get description() {
    return 'Run generators';
  }

  * run(context) {
    const { cwd, argv } = context;

    /* istanbul ignore next */
    let baseDir = argv._[0] || argv.baseDir || cwd;
    /* istanbul ignore next */
    if (!path.isAbsolute(baseDir)) baseDir = path.join(cwd, baseDir);

    const framework = utils.getFrameworkPath({
      framework: argv.framework,
      baseDir,
    });

    const options = {
      baseDir,
      framework,
      env: argv.env,
      argv,
    };

    // [ { path, type }]
    options.loadUnit = utils.getLoadUnits(options);
    options.config = utils.getConfig(options);
    options.plugins = utils.getPlugins(options);

    // load generators
    for (const item of options.loadUnit) {
      // TODO: check pkg.egg.generator
      // const pkg = require(path.join(dir, 'package.json'));
      const bin = resolveModule(path.join(item.path, 'generator'));
      if (!bin) continue;

      // Initialize
      debug('exec generator: %s', bin);
      try {
        const Generator = require(bin);
        const instance = new Generator(options);
        // TODO: pass ctx?
        yield instance.generate();
      } catch (err) {
        console.warn('exec %s fail', bin, err);
      }
    }
  }
}

function resolveModule(filepath) {
  try {
    return require.resolve(filepath);
  } catch (e) {
    return undefined;
  }
}

module.exports = GenerateCommand;
