import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let database: Db | null = null;

export async function getDb(): Promise<Db> {
  if (database) return database;
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/keno_express_api';
  client = new MongoClient(uri);
  await client.connect();
  const dbNameFromUri = () => {
    try {
      const url = new URL(uri);
      const pathname = url.pathname.replace(/^\//, '');
      return pathname || 'keno_express_api';
    } catch {
      return 'keno_express_api';
    }
  };
  database = client.db(dbNameFromUri());
  return database;
}
