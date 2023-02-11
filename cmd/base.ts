import { debuglog } from 'node:util';
import {
  Options, Option, Command,
  CommandContext,
  Inject,
} from '@artus-cli/artus-cli';
import runscript from 'runscript';

const debug = debuglog('egg-bin:base');

export abstract class BaseCommand extends Command {
  @Option({
    description: 'whether show full command script only, default is false',
    alias: 'd',
    type: 'boolean',
    default: false,
  })
  dryRun: boolean;

  @Option({
    description: 'require the given module',
    alias: 'r',
    array: true,
    default: [],
  })
  require: string[];

  @Options()
  args: any;

  @Inject()
  ctx: CommandContext;

  protected async runNodeCmd(nodeCmd: string) {
    const cmd = `node ${nodeCmd}`;
    debug('%s', cmd);
    if (this.dryRun) {
      console.log('dry run: $ %o', cmd);
      return;
    }
    await runscript(cmd, {
      env: this.ctx.env,
      cwd: this.args.base,
    });
  }
}
