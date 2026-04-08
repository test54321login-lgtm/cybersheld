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
    
    const users = await getCollection('users');
    const user = await users.findOne({ email });
    
    if (!user) {
      return res.status(401).setHeader(headers).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      return res.status(401).setHeader(headers).json({ error: 'Invalid credentials' });
    }
    
    const token = createToken({ userId: user._id.toString(), email });
    
    return res.status(200).setHeader(headers).json({ token, email });
  } catch (error) {
    return res.status(500).setHeader(headers).json({ error: 'Server error' });
  }
};