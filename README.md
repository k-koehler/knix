# Example

```typescript
import { Client } from "knix";
import SQLite from "react-native-sqlite-storage";

async function func() {
  const client = new Client(await SQLite.openDatabase({ name: ":memory:" }));
  await client
    .query(
      "CREATE TABLE IF NOT EXISTS example (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)"
    )
    .exec();
  const id = await client
    .query("INSERT INTO example (data) VALUES (?)", ["test"])
    .insert();
  const data = await client
    .query<{ id: number; data: string }>("SELECT * FROM example WHERE id = ?", [
      id,
    ])
    .one();
  console.log(data); // {id:1, data:"test"}
  const rowsAffected = await client
    .query("UPDATE example SET data = ?", ["test1"])
    .update();
  console.log(rowsAffected); // 1
  await client.transaction(async (tx) => {
    await tx.query("INSERT INTO example (data) VALUES (?)", ["a"]).insert();
    await tx.query("INSERT INTO example (data) VALUES (?)", ["b"]).insert();
    await tx.query("INSERT INTO example (data) VALUES (?)", ["c"]).insert();
  });
  const all = await client.query("SELECT * FROM example").all();
  console.log(all); // [{id:1, data:"test"},{id:2, data:"a"},{id:3, data:"b"},{id:4, data:"c"}]}
}
```
