import { debuglog } from 'node:util';
import path from 'node:path';
import {
  Inject, ApplicationLifecycle, LifecycleHook, LifecycleHookUnit,
  Program, CommandContext,
} from '@artus-cli/artus-cli';
import { addNodeOptionsToEnv, readPackageJSON, hasTsConfig } from '../utils';

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
      },
      tscompiler: {
        description: 'ts compiler, like ts-node/register, ts-node/register/transpile-only, @swc-node/register, esbuild-register etc',
        type: 'string',
        alias: 'tsc',
      },
    });

    this.program.use(async (ctx: CommandContext, next) => {
      if (!ctx.args.base) {
        ctx.args.base = ctx.cwd;
      }
      if (!path.isAbsolute(ctx.args.base)) {
        ctx.args.base = path.join(ctx.cwd, ctx.args.base);
      }
      debug('baseDir: %o', ctx.args.base);
      const pkg = await readPackageJSON(ctx.args.base);
      const tscompiler = ctx.args.tscompiler ?? ctx.env.TS_COMPILER ?? pkg.egg?.tscompiler;
      if (ctx.args.typescript === undefined) {
        // try to ready EGG_TYPESCRIPT env first, only accept 'true' or 'false' string
        if (ctx.env.EGG_TYPESCRIPT === 'false') {
          ctx.args.typescript = false;
          debug('detect typescript=%o from EGG_TYPESCRIPT=%o', false, ctx.env.EGG_TYPESCRIPT);
        } else if (ctx.env.EGG_TYPESCRIPT === 'true') {
          ctx.args.typescript = true;
          debug('detect typescript=%o from EGG_TYPESCRIPT=%o', true, ctx.env.EGG_TYPESCRIPT);
        } else if (typeof pkg.egg?.typescript === 'boolean') {
          // read `egg.typescript` from package.json if not pass argv
          ctx.args.typescript = pkg.egg.typescript;
          debug('detect typescript=%o from pkg.egg.typescript=%o', true, pkg.egg.typescript);
        } else if (pkg.dependencies?.typescript) {
          // auto detect pkg.dependencies.typescript or pkg.devDependencies.typescript
          ctx.args.typescript = true;
          debug('detect typescript=%o from pkg.dependencies.typescript=%o', true, pkg.dependencies.typescript);
        } else if (pkg.devDependencies?.typescript) {
          ctx.args.typescript = true;
          debug('detect typescript=%o from pkg.devDependencies.typescript=%o', true, pkg.devDependencies.typescript);
        } else if (await hasTsConfig(ctx.args.base)) {
          // tsconfig.json exists
          ctx.args.typescript = true;
          debug('detect typescript=%o cause tsconfig.json exists', true);
        } else if (tscompiler) {
          ctx.args.typescript = true;
          debug('detect typescript=%o from --tscompiler=%o', true, tscompiler);
        }
      }

      if (ctx.args.typescript) {
        const findPaths = [ path.dirname(__dirname) ];
        if (tscompiler) {
          // try app baseDir first on custom tscompiler
          findPaths.unshift(ctx.args.base);
        }
        ctx.args.tscompiler = tscompiler ?? 'ts-node/register';
        const tsNodeRegister = require.resolve(ctx.args.tscompiler, {
          paths: findPaths,
        });
        // should require tsNodeRegister on current process, let it can require *.ts files
        // e.g.: dev command will execute egg loader to find configs and plugins
        require(tsNodeRegister);
        // let child process auto require ts-node too
        addNodeOptionsToEnv(`--require ${tsNodeRegister}`, ctx.env);
        // tell egg loader to load ts file
        // see https://github.com/eggjs/egg-core/blob/master/lib/loader/egg_loader.js#L443
        ctx.env.EGG_TYPESCRIPT = 'true';
        // set current process.env.EGG_TYPESCRIPT too
        process.env.EGG_TYPESCRIPT = 'true';
        // load files from tsconfig on startup
        ctx.env.TS_NODE_FILES = process.env.TS_NODE_FILES ?? 'true';
        // keep same logic with egg-core, test cmd load files need it
        // see https://github.com/eggjs/egg-core/blob/master/lib/loader/egg_loader.js#L49
        addNodeOptionsToEnv(`--require ${require.resolve('tsconfig-paths/register')}`, ctx.env);
        debug('set NODE_OPTIONS: %o', ctx.env.NODE_OPTIONS);
      }
      await next();
    });
  }
}
