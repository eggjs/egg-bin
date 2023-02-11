import { DefineCommand, Command, Utils, Inject } from '@artus-cli/artus-cli';

@DefineCommand()
export class MainCommand extends Command {
  @Inject()
  utils: Utils;

  async run() {
    await this.utils.redirect([ '--help' ]);
  }
}
