import {
  ResultSet,
  SQLiteDatabase,
  Transaction,
} from "react-native-sqlite-storage";

export interface QueryParams {
  sqlite: SQLiteDatabase;
  tx?: Transaction;
  sql: string;
  params: any[];
}

export class Query<T> {
  private sqlite!: SQLiteDatabase;
  private tx?: Transaction;
  private sql!: string;
  private params!: any[];

  public constructor(data: QueryParams) {
    Object.assign(this, data);
  }

  private executeNewTransaction<U>(cb: (resultSet: ResultSet) => U) {
    return new Promise<U>((resolve, reject) => {
      this.sqlite.transaction(async (tx) => {
        tx.executeSql(
          this.sql,
          this.params,
          (_, resultSet) => {
            resolve(cb(resultSet));
          },
          (err: any) => reject(new Error(err.message))
        );
      });
    });
  }

  private executeExistingTransaction<U>(cb: (resultSet: ResultSet) => U) {
    if (!this.tx) {
      throw new Error("no existing transaction");
    }
    return new Promise<U>((resolve, reject) =>
      this.tx!.executeSql(
        this.sql,
        this.params,
        (_, resultSet) => resolve(cb(resultSet)),
        (err: any) => reject(new Error(err.message))
      )
    );
  }

  private execute<U>(cb: (resultSet: ResultSet) => U) {
    return this.tx
      ? this.executeExistingTransaction(cb)
      : this.executeNewTransaction(cb);
  }

  public insert(): Promise<number> {
    return this.execute((resultSet) => resultSet.insertId);
  }

  public async update(): Promise<number> {
    return this.execute((resultSet) => resultSet.rowsAffected);
  }

  public async one(): Promise<T | undefined> {
    return this.execute((resultSet) => resultSet.rows.item(0));
  }

  public async all(): Promise<T[]> {
    return this.execute((resultSet) => {
      const result: T[] = [];
      for (let i = 0; i < resultSet.rows.length; ++i) {
        result.push(resultSet.rows.item(i));
      }
      return result;
    });
  }

  public async exec(): Promise<void> {
    await this.one();
  }
}
