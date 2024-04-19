const path = require('node:path');
const Command = require('../../command');

class DalGenCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin dal gen';

    this.options = {
      baseDir: {
        description: 'directory of application, default to `process.cwd()`',
        type: 'string',
      },
      teggPkgName: {
        description: 'tegg package name',
        type: 'string',
        default: '@eggjs/tegg',
      },
      teggDalPkgName: {
        description: 'tegg dal package name',
        type: 'string',
        default: '@eggjs/tegg/dal',
      },
    };
    this.genBin = path.join(__dirname, '../../dal-gen');
  }

  async run(context) {
    let ModuleConfigUtil;
    try {
      const commonUtilHelper = require('@eggjs/tegg/helper');
      ModuleConfigUtil = commonUtilHelper.ModuleConfigUtil;
    } catch {
      console.error('should install @eggjs/tegg first');
      process.exit(1);
    }


    const { cwd, argv } = context;
    const baseDir = argv.baseDir || cwd;

    const options = {
      execArgv: context.execArgv,
      env: {
        ...context.env,
        // Dal table class modified may cause ts error, so we use transpile only
        TS_NODE_TRANSPILE_ONLY: 'true',
      },
      cwd: baseDir,
    };

    const moduleReferences = ModuleConfigUtil.readModuleReference(baseDir, {});
    console.log('[egg-bin] dal gen get modules %j', moduleReferences);
    for (const moduleReference of moduleReferences) {
      await this.helper.forkNode(this.genBin, [
        moduleReference.path,
        moduleReference.name,
        argv.teggPkgName,
        argv.teggDalPkgName,
      ], options);
    }
  }
}

module.exports = DalGenCommand;
