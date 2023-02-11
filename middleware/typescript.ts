import { debuglog } from 'node:util';
import { Inject, ApplicationLifecycle, LifecycleHook, LifecycleHookUnit } from '@artus-cli/artus-cli';
import { Program, CommandContext } from '@artus-cli/artus-cli';

const debug = debuglog('egg-bin:midddleware:typescript');

@LifecycleHookUnit()
export default class implements ApplicationLifecycle {
  @Inject()
  private readonly program: Program;

  @LifecycleHook()
  async configDidLoad() {
    // add global options
    this.program.option({
      typescript: {
        description: 'whether enable typescript support',
        type: 'boolean',
        alias: 'ts',
        default: undefined,
      },
    });

    this.program.use(async (ctx: CommandContext, next) => {
      if (ctx.args.typescript === undefined) {
        const pkg = this.program.binInfo.pkgInfo;
        // try to ready EGG_TYPESCRIPT env first, only accept 'true' or 'false' string
        if (ctx.env.EGG_TYPESCRIPT === 'false') {
          ctx.args.typescript = false;
        } else if (ctx.env.EGG_TYPESCRIPT === 'true') {
          ctx.args.typescript = true;
        } else if (typeof pkg.egg?.typescript === 'boolean') {
          // read `egg.typescript` from package.json if not pass argv
          ctx.args.typescript = pkg.egg.typescript;
        } else if (pkg.dependencies?.typescript || pkg.devDependencies?.typescript) {
          // auto detect pkg.dependencies.typescript or pkg.devDependencies.typescript
          ctx.args.typescript = true;
        }
      }
      if (ctx.args.typescript) {
        const tsNodeRegister = require.resolve('ts-node/register');
        // should require argv.tscompiler on current process, let it can require *.ts files
        // e.g.: dev command will execute egg loader to find configs and plugins
        require(tsNodeRegister);
        // let child process auto require ts-node too
        const requireOptions = `--require ${tsNodeRegister}`;
        if (ctx.env.NODE_OPTIONS) {
          if (!ctx.env.NODE_OPTIONS.includes(requireOptions)) {
            ctx.env.NODE_OPTIONS = `${ctx.env.NODE_OPTIONS} ${requireOptions}`;
          }
        } else {
          ctx.env.NODE_OPTIONS = requireOptions;
        }
        debug('set NODE_OPTIONS: %o', ctx.env.NODE_OPTIONS);
        // tell egg loader to load ts file
        // see https://github.com/eggjs/egg-core/blob/master/lib/loader/egg_loader.js#L443
        ctx.env.EGG_TYPESCRIPT = 'true';
        // set current process.env.EGG_TYPESCRIPT too
        process.env.EGG_TYPESCRIPT = 'true';
        // load files from tsconfig on startup
        ctx.env.TS_NODE_FILES = process.env.TS_NODE_FILES || 'true';
      }
      await next(); 
    });
  }
}
