import { Table, Column, ColumnType } from '@eggjs/tegg/dal';

@Table({
  comment: 'foo table',
})
export class Bar {
  @Column({
    type: ColumnType.INT,
  }, {
    primaryKey: true,
  })
  id: number;

  @Column({
    type: ColumnType.VARCHAR,
    length: 100,
  })
  name: string;
}
