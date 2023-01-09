export default function(app) {
  const { router, controller } = app;

  console.info(app.custom.test.abc);
  router.get('/', controller.home.index);
}
