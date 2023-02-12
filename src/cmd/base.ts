import { debuglog } from 'node:util';
import {
  DefineCommand,
  Options, Option, Command,
  CommandContext,
  Inject,
  Utils,
} from '@artus-cli/artus-cli';
import runscript from 'runscript';

const debug = debuglog('egg-bin:base');

@DefineCommand()
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

  @Inject()
  utils: Utils;

  // FIXME: should has a better way to init global args default value
  protected get base() {
    return this.ctx.args.base;
  }
  protected get pkg() {
    return this.ctx.args.pkg;
  }

  async run() {
    await this.utils.redirect([ '--help' ]);
  }

  protected async formatRequires() {
    const pkg = this.pkg;
    const requires = this.require ?? [];
    const eggRequire = pkg.egg?.require;
    if (Array.isArray(eggRequire)) {
      for (const r of eggRequire) {
        requires.push(r);
      }
    } else if (typeof eggRequire === 'string' && eggRequire) {
      requires.push(eggRequire);
    }
    return requires;
  }

  protected async runNodeCmd(nodeCmd: string, nodeRequires?: string[]) {
    const parts = [
      'node',
    ];
    if (nodeRequires) {
      for (const r of nodeRequires) {
        parts.push('--require');
        parts.push(`'${r}'`);
      }
    }
    parts.push(nodeCmd);
    const cmd = parts.join(' ');
    debug('runscript: %o', cmd);
    if (this.dryRun) {
      console.log('dry run: $ %o', cmd);
      return;
    }
    await runscript(cmd, {
      env: this.ctx.env,
      cwd: this.base,
    });
  }
}
