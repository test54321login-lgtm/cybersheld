const fs = require('fs');
const pathModule = require('path');

const feed = require('./api/feed/index.js');
const login = require('./api/auth/login.js');
const signup = require('./api/auth/signup.js');
const submitQuiz = require('./api/quiz/submit.js');
const quizHistory = require('./api/quiz/history.js');
const getChecklist = require('./api/checklist/get.js');
const updateChecklist = require('./api/checklist/update.js');

const staticFiles = [
  'index.html',
  'login.html',
  'signup.html',
  'feed.html',
  'quiz.html',
  'checklist.html'
];

module.exports = (req, res) => {
  const urlPath = req.url || '';

  if (urlPath.startsWith('/api/feed')) {
    return feed(req, res);
  }
  if (urlPath.startsWith('/api/auth/login')) {
    return login(req, res);
  }
  if (urlPath.startsWith('/api/auth/signup')) {
    return signup(req, res);
  }
  if (urlPath.startsWith('/api/quiz/submit')) {
    return submitQuiz(req, res);
  }
  if (urlPath.startsWith('/api/quiz/history')) {
    return quizHistory(req, res);
  }
  if (urlPath.startsWith('/api/checklist/get')) {
    return getChecklist(req, res);
  }
  if (urlPath.startsWith('/api/checklist/update')) {
    return updateChecklist(req, res);
  }

  const staticPath = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = pathModule.join(__dirname, staticPath);
  
  if (staticFiles.includes(urlPath) || staticFiles.includes(urlPath.replace(/^\//, ''))) {
    const content = fs.readFileSync(filePath);
    const ext = pathModule.extname(filePath);
    const contentType = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : 'text/plain';
    res.setHeader('Content-Type', contentType);
    return res.send(content);
  }

  res.status(404).json({ error: 'Not found' });
};
