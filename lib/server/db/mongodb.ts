/**
 * SISMP — MongoDB Connection Client Helper
 * Singleton connection manager for MongoDB Atlas in Next.js App Router.
 */
import { MongoClient, Db } from 'mongodb';

const uri = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb+srv://kittukurchaniya07_db_user:Y6mCSiIrhculF82C@cohort.wldi601.mongodb.net/sismp?retryWrites=true&w=majority';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDatabase(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db('sismp');
}

export default clientPromise;
