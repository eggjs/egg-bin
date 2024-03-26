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
      env: context.env,
    };

    const moduleReferences = ModuleConfigUtil.readModuleReference(baseDir, {});
    console.log('[egg-bin] dal gen get modules %j', moduleReferences);
    for (const moduleReference of moduleReferences) {
      await this.helper.forkNode(this.genBin, [
        moduleReference.path,
        moduleReference.name,
      ], options);
    }
  }
}

module.exports = DalGenCommand;
