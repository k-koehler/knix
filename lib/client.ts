import { SQLiteDatabase, Transaction } from "react-native-sqlite-storage";
import { Query } from "./query";

export interface IClient {
  query<T>(sql: string, params?: any[]): Query<T>;
}

export class TransactedClient implements IClient {
  private sqlite: SQLiteDatabase;
  private tx: Transaction;

  public constructor(sqlite: SQLiteDatabase, tx: Transaction) {
    this.sqlite = sqlite;
    this.tx = tx;
  }

  public query<T>(sql: string, params: any[] = []) {
    return new Query<T>({
      sqlite: this.sqlite,
      tx: this.tx,
      sql,
      params,
    });
  }
}

export class Client implements IClient {
  private sqlite: SQLiteDatabase;

  public constructor(sqlite: SQLiteDatabase) {
    this.sqlite = sqlite;
  }

  public query<T>(sql: string, params: any[] = []) {
    return new Query<T>({
      sqlite: this.sqlite,
      sql,
      params,
    });
  }

  public async transaction(cb: (client: TransactedClient) => Promise<unknown>) {
    await this.sqlite.transaction(async (tx) => {
      console.log("start");
      await cb(new TransactedClient(this.sqlite, tx));
      console.log("finish");
    });
  }
}
