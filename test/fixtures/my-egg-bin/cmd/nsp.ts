import { DefineCommand } from '@artus-cli/artus-cli';
import { BaseCommand } from '../../../../src/index';

@DefineCommand({
  command: 'nsp',
  description: 'nsp check',
})
export class NspCommand extends BaseCommand {
  async run() {
    console.log('run nsp check at baseDir: %s, with %o', this.base, this.args);
  }
}
