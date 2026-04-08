const { getCollection } = require('../lib/db');
const { verifyToken, corsHeaders } = require('../lib/auth');

module.exports = async function handler(req, res) {
  const headers = corsHeaders();
  
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader(headers).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).setHeader(headers).json({ error: 'Method not allowed' });
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).setHeader(headers).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).setHeader(headers).json({ error: 'Invalid token' });
  }
  
  try {
    const checklist = await getCollection('checklist_progress');
    const progress = await checklist.findOne({ userId: decoded.userId });
    
    return res.status(200).setHeader(headers).json({ completed: progress?.completed || [] });
  } catch (error) {
    return res.status(500).setHeader(headers).json({ error: 'Server error' });
  }
};