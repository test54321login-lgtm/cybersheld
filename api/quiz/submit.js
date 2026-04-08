const { getCollection } = require('../lib/db');
const { verifyToken, corsHeaders } = require('../lib/auth');

module.exports = async function handler(req, res) {
  const headers = corsHeaders();
  
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader(headers).end();
  }
  
  if (req.method !== 'POST') {
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
    const { score, total } = req.body;
    
    if (typeof score !== 'number' || typeof total !== 'number') {
      return res.status(400).setHeader(headers).json({ error: 'Score and total required' });
    }
    
    const quizHistory = await getCollection('quiz_history');
    await quizHistory.insertOne({
      userId: decoded.userId,
      score,
      total,
      takenAt: new Date()
    });
    
    return res.status(201).setHeader(headers).json({ success: true });
  } catch (error) {
    return res.status(500).setHeader(headers).json({ error: 'Server error' });
  }
};