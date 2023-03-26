import { debuglog } from 'node:util';
import { fork, ForkOptions, ChildProcess } from 'node:child_process';
import {
  DefineCommand,
  Option, Command,
  CommandContext,
  Inject,
  Utils,
} from '@artus-cli/artus-cli';

const debug = debuglog('egg-bin:base');

// only hook once and only when ever start any child.
const childs = new Set<ChildProcess>();
let hadHook = false;
function gracefull(proc: ChildProcess) {
  // save child ref
  childs.add(proc);

  // only hook once
  /* c8 ignore else */
  if (!hadHook) {
    hadHook = true;
    let signal: NodeJS.Signals;
    [ 'SIGINT', 'SIGQUIT', 'SIGTERM' ].forEach(event => {
      process.once(event, () => {
        signal = event as NodeJS.Signals;
        process.exit(0);
      });
    });

    process.once('exit', (code: number) => {
      for (const child of childs) {
        debug('process exit code: %o, kill child %o with %o', code, child.pid, signal);
        child.kill(signal);
      }
    });
  }
}

class ForkError extends Error {
  code: number | null;
  constructor(message: string, code: number | null) {
    super(message);
    this.code = code;
  }
}

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

  @Inject()
  ctx: CommandContext;

  @Inject()
  utils: Utils;

  // FIXME: should has a better way to init global args default value
  protected get base() {
    return this.ctx.args.base;
  }

  async run() {
    await this.utils.redirect([ '--help' ]);
  }

  protected async formatRequires() {
    const requires = this.require ?? [];
    const eggRequire = this.ctx.args.pkgEgg.require;
    if (Array.isArray(eggRequire)) {
      for (const r of eggRequire) {
        requires.push(r);
      }
    } else if (typeof eggRequire === 'string' && eggRequire) {
      requires.push(eggRequire);
    }
    return requires;
  }

  protected async forkNode(modulePath: string, args: string[], options: ForkOptions = {}) {
    if (this.dryRun) {
      console.log('dry run: $ %o', `${process.execPath} ${modulePath} ${args.join(' ')}`);
      return;
    }

    options = {
      stdio: 'inherit',
      env: this.ctx.env,
      cwd: this.base,
      ...options,
    };
    const proc = fork(modulePath, args, options);
    debug('Run fork pid: %o, `%s %s %s`',
      proc.pid, process.execPath, modulePath, args.join(' '));
    gracefull(proc);

    return new Promise<void>((resolve, reject) => {
      proc.once('exit', code => {
        debug('fork pid: %o exit code %o', proc.pid, code);
        childs.delete(proc);
        if (code !== 0) {
          const err = new ForkError(modulePath + ' ' + args.join(' ') + ' exit with code ' + code, code);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
