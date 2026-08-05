import { Db, MongoClient } from "mongodb";

export interface DatabaseConnection {
  client: MongoClient;
  db: Db;
}

export async function connectToDatabase(uri: string, dbName: string): Promise<DatabaseConnection> {
  const client = new MongoClient(uri);
  await client.connect();
  return { client, db: client.db(dbName) };
}
