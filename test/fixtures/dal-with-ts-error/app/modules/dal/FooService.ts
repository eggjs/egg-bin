import { SingletonProto } from '@eggjs/tegg';
import { Foo } from './Foo';

@SingletonProto()
export class FooService {
  foo() {
    const foo = new Foo();
    foo.id = '233';
    foo.name = '233';
  }
}
