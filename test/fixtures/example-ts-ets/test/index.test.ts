import { strict as assert } from 'assert';
import db from 'app/service/db';

describe('test', () => {
  it('should import work', () => {
    assert(db);
  });
});
