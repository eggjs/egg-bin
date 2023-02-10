import { DefineCommand, Command } from '@artus-cli/artus-cli';

@DefineCommand()
export class MainCommand extends Command {
  async run() {
    console.info('main');
  }
}
