const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

let clientPromise = global._mongoClientPromise;

if (uri && !clientPromise) {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
  global._mongoClientPromise = clientPromise;
}

async function getDb() {
  if (!clientPromise) {
    throw new Error('MONGODB_URI not configured');
  }
  const c = await clientPromise;
  return c.db('cybershield');
}

async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}

module.exports = { getDb, getCollection, clientPromise };