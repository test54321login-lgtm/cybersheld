const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cybershield-secret-key';

let clientPromise = null;

async function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not configured');
  }
  if (!clientPromise) {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  try {
    const { completed } = req.body;
    
    if (!Array.isArray(completed)) {
      return res.status(400).json({ error: 'Completed array required' });
    }
    
    const client = await getMongoClient();
    const db = client.db('cybershield');
    const checklist = db.collection('checklist_progress');
    
    await checklist.updateOne(
      { userId: decoded.userId },
      { $set: { completed, updatedAt: new Date() } },
      { upsert: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Checklist update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};