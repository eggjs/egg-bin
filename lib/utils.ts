export function addNodeOptionsToEnv(options: string, env: Record<string, any>) {
  if (env.NODE_OPTIONS) {
    if (!env.NODE_OPTIONS.includes(options)) {
      env.NODE_OPTIONS = `${env.NODE_OPTIONS} ${options}`;
    }
  } else {
    env.NODE_OPTIONS = options;
  }
}
