'use strict';


module.exports = app => {
  app.logger.info('###', require('./test.ts').default.name);
};
