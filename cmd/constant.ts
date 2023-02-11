import { OptionProps } from '@artus-cli/artus-cli';

export const OPTIONS = {
  require: {
    description: 'require the given module',
    alias: 'r',
    array: true,
    default: [],
  },
} satisfies Record<string, OptionProps>;
