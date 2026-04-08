require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const uri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'cybershield-secret-key';

let client;
async function connectDb() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
  }
  return client;
}

async function getCollection(name) {
  const c = await connectDb();
  return c.db('cybershield').collection(name);
}

function corsHeaders(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

app.use(corsHeaders);

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const users = await getCollection('users');
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
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const users = await getCollection('users');
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id.toString(), email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Quiz routes
app.post('/api/quiz/submit', async (req, res) => {
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
    const { score, total } = req.body;
    if (typeof score !== 'number' || typeof total !== 'number') {
      return res.status(400).json({ error: 'Score and total required' });
    }

    const quizHistory = await getCollection('quiz_history');
    await quizHistory.insertOne({
      userId: decoded.userId,
      score,
      total,
      takenAt: new Date()
    });

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/quiz/history', async (req, res) => {
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
    const quizHistory = await getCollection('quiz_history');
    const history = await quizHistory
      .find({ userId: decoded.userId })
      .sort({ takenAt: -1 })
      .limit(10)
      .toArray();

    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Checklist routes
app.get('/api/checklist/get', async (req, res) => {
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
    const checklist = await getCollection('checklist_progress');
    const progress = await checklist.findOne({ userId: decoded.userId });
    res.json({ completed: progress?.completed || [] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/checklist/update', async (req, res) => {
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

    const checklist = await getCollection('checklist_progress');
    await checklist.updateOne(
      { userId: decoded.userId },
      { $set: { completed, updatedAt: new Date() } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Feed route
const defaultFeed = [
  { title: "Use Strong, Unique Passwords", category: "Tips", content: "Create passwords with at least 12 characters mixing letters, numbers, and symbols. Use a password manager.", date: "2024-01-15" },
  { title: "Beware of Phishing Emails", category: "Awareness", content: "Check sender addresses carefully. Hover over links before clicking. When in doubt, contact the sender directly.", date: "2024-01-20" },
  { title: "Enable Two-Factor Authentication", category: "Tips", content: "Add an extra security layer. Even if your password is compromised, attackers can't access your account.", date: "2024-02-01" },
  { title: "Ransomware Attacks Surge", category: "News", content: "New ransomware variants target businesses worldwide. Backup your data regularly and offline.", date: "2024-02-10" },
  { title: "Update Software Regularly", category: "Tips", content: "Keep your OS, browsers, and apps updated. Updates patch critical security vulnerabilities.", date: "2024-02-15" },
  { title: "Public Wi-Fi Risks", category: "Awareness", content: "Avoid sensitive transactions on public networks. Use a VPN for added security.", date: "2024-02-20" },
  { title: "Social Engineering Tactics", category: "Awareness", content: "Attackers manipulate you through trust. Verify requests through official channels.", date: "2024-03-01" },
  { title: "New Malware Strain Detected", category: "News", content: "Security researchers discovered new info-stealer targeting financial apps. Stay vigilant.", date: "2024-03-10" },
  { title: "Secure Your Home Network", category: "Tips", content: "Change default router passwords, use WPA3 encryption, and keep firmware updated.", date: "2024-03-15" },
  { title: "Data Privacy Matters", category: "Awareness", content: "Limit personal info shared online. Review privacy settings on social media.", date: "2024-03-20" }
];

app.get('/api/feed', (req, res) => {
  const category = req.query.category;
  let feed = defaultFeed;
  if (category && category !== 'All') {
    feed = feed.filter(item => item.category === category);
  }
  res.json({ feed });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});