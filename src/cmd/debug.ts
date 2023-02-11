import { DefineCommand, Command, Utils, Inject } from '@artus-cli/artus-cli';

@DefineCommand({
  command: 'debug',
  description: 'Alias to `egg-bin dev --inspect`',
})
export class DebugCommand extends Command {
  @Inject()
  utils: Utils;

  async run() {
    await this.utils.redirect([ 'dev', '--inspect' ]);
  }
}
