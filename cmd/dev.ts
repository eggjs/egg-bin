import { DefineCommand, Context, Option, Options, Command, Middleware } from '@artus-cli/artus-cli';

@DefineCommand({
  command: 'dev [baseDir]',
  description: 'Run the development server',
  alias: [ 'd' ],
})
@Middleware(async (ctx: Context, next) => {
  console.info('egg-bin dev command prerun');
  console.log(ctx.input.params);
  await next();
  console.info('egg-bin dev command postrun');
})
export class DevCommand extends Command {
  @Option({
    description: 'whether enable typescript support, will load tscompiler on startup',
    alias: 'ts',
    default: undefined,
  })
  typescript: boolean;

  @Option({
    alias: 'p',
    default: 3000,
    description: 'Start A Server',
  })
  port: number;

  @Option({
    default: false,
    description: 'Debug with node-inspector',
  })
  inspect: boolean;

  @Option('Built-in flags in node')
  nodeFlags: string;

  @Option()
  baseDir: string;

  @Options()
  args: any;

  async run() {
    console.info('port', this.port);
    console.info('inspect', this.inspect);
    console.info('nodeFlags', this.nodeFlags);
    console.info('baseDir', this.baseDir);
    console.log(this.args);
    return {
      command: 'dev',
      args: this.args,
    };
  }
}
