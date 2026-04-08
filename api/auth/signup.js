const bcrypt = require('bcryptjs');
const { getCollection } = require('../lib/db');
const { createToken, corsHeaders } = require('../lib/auth');

module.exports = async function handler(req, res) {
  const headers = corsHeaders();
  
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader(headers).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).setHeader(headers).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).setHeader(headers).json({ error: 'Email and password required' });
    }
    
    if (password.length < 6) {
      return res.status(400).setHeader(headers).json({ error: 'Password must be at least 6 characters' });
    }
    
    const users = await getCollection('users');
    const existing = await users.findOne({ email });
    
    if (existing) {
      return res.status(400).setHeader(headers).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ email, password: hashedPassword, createdAt: new Date() });
    
    const token = createToken({ userId: result.insertedId.toString(), email });
    
    return res.status(201).setHeader(headers).json({ token, email });
  } catch (error) {
    return res.status(500).setHeader(headers).json({ error: 'Server error' });
  }
};