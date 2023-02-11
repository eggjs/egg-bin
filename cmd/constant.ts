import { OptionProps } from '@artus-cli/artus-cli';

export const OPTIONS = {
  baseDir: {
    description: 'directory of application, default to `process.cwd()`',
    alias: 'base',
    default: process.cwd(),
  },
  require: {
    description: 'require the given module',
    alias: 'r',
    array: true,
    default: [],
  },
} satisfies Record<string, OptionProps>;
