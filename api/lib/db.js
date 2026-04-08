const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = uri ? new MongoClient(uri) : null;

let clientPromise = global._mongoClientPromise;

if (!clientPromise && client) {
  clientPromise = client.connect();
  global._mongoClientPromise = clientPromise;
}

async function getDb() {
  const c = await clientPromise;
  return c.db('cybershield');
}

async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}

module.exports = { getDb, getCollection, clientPromise };