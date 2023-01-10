export default function() {
  const config = {} as any;

  config.keys = '123123';

  // biz config
  const bizConfig = {
    biz: {
      type: 'biz',
    },
  };

  return {
    ...config as {},
    ...bizConfig,
  };
}
