const bcrypt = require('bcryptjs');
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
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const client = await getMongoClient();
    const db = client.db('cybershield');
    const users = db.collection('users');
    
    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ email, password: hashedPassword, createdAt: new Date() });
    
    const token = jwt.sign({ userId: result.insertedId.toString(), email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ token, email });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};