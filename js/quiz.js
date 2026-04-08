const { apiFetch, showError, authGuard } = window.utils;

const questions = [
  {
    question: "What is phishing?",
    options: [
      "A type of fishing sport",
      "A social engineering attack to steal information",
      "A method to secure networks",
      "A type of antivirus software"
    ],
    correct: 1
  },
  {
    question: "Which of these is a sign of a phishing email?",
    options: [
      "Company logo in signature",
      "Urgent language demanding immediate action",
      "Proper grammar and spelling",
      "Sent during business hours"
    ],
    correct: 1
  },
  {
    question: "What does ransomware do?",
    options: [
      "Monitors your computer activity",
      "Encrypts files and demands payment",
      "Deletes temporary files",
      "Speeds up your computer"
    ],
    correct: 1
  },
  {
    question: "What is the safest way to use public Wi-Fi?",
    options: [
      "Share files with other users",
      "Access banking websites directly",
      "Use a VPN",
      "Download files quickly"
    ],
    correct: 2
  },
  {
    question: "What is two-factor authentication?",
    options: [
      "Using two passwords",
      "Logging in twice",
      "Using two different verification methods",
      "Having two accounts"
    ],
    correct: 2
  },
  {
    question: "Which password is strongest?",
    options: [
      "password123",
      "12345678",
      "Tr0ub4dor&3",
      "My dog's name"
    ],
    correct: 2
  },
  {
    question: "What is a trojan in cybersecurity?",
    options: [
      "A Greek letter",
      "Malware disguised as legitimate software",
      "A type of firewall",
      "A backup program"
    ],
    correct: 1
  },
  {
    question: "How should you respond to suspicious emails?",
    options: [
      "Click the link to check",
      "Reply with your information",
      "Report and delete without clicking",
      "Forward to friends"
    ],
    correct: 2
  },
  {
    question: "What is malware?",
    options: [
      "A type of email",
      "Malicious software designed to harm systems",
      "A security tool",
      "A network protocol"
    ],
    correct: 1
  },
  {
    question: "How often should you update software?",
    options: [
      "Never",
      "Only when prompted",
      "As soon as updates are available",
      "Once a year"
    ],
    correct: 2
  }
];

let currentQuestion = 0;
let score = 0;
let timer = null;
let timeLeft = 30;

function startQuiz() {
  currentQuestion = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  document.getElementById('quizStart').classList.add('hidden');
  document.getElementById('quizQuestions').classList.remove('hidden');

  const progress = ((currentQuestion) / questions.length) * 100;
  document.getElementById('progressBar').style.width = `${progress}%`;

  const q = questions[currentQuestion];
  document.getElementById('questionText').textContent = `Q${currentQuestion + 1}: ${q.question}`;

  const optionsEl = document.getElementById('quizOptions');
  optionsEl.innerHTML = '';

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.dataset.index = i;
    btn.addEventListener('click', () => selectAnswer(i));
    optionsEl.appendChild(btn);
  });

  timeLeft = 30;
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  const timerEl = document.getElementById('timer');
  timerEl.textContent = timeLeft;
  timerEl.classList.remove('warning');

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 10) {
      timerEl.classList.add('warning');
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      nextQuestion();
    }
  }, 1000);
}

function selectAnswer(index) {
  clearInterval(timer);
  const q = questions[currentQuestion];
  const options = document.querySelectorAll('.quiz-option');

  options.forEach((opt, i) => {
    opt.disabled = true;
    if (i === q.correct) {
      opt.classList.add('correct');
    }
    if (i === index && index !== q.correct) {
      opt.classList.add('wrong');
    }
  });

  if (index === q.correct) {
    score++;
  }

  setTimeout(nextQuestion, 1500);
}

function nextQuestion() {
  clearInterval(timer);
  currentQuestion++;

  if (currentQuestion >= questions.length) {
    showResults();
  } else {
    showQuestion();
  }
}

function showResults() {
  document.getElementById('quizQuestions').classList.add('hidden');
  document.getElementById('quizResults').classList.remove('hidden');

  document.getElementById('scoreText').textContent = `${score}/${questions.length}`;

  const pass = score >= 7;
  document.getElementById('passFail').textContent = pass ? 'PASSED' : 'FAILED';
  document.getElementById('passFail').style.color = pass ? 'var(--secondary)' : 'var(--danger)';

  if (getToken()) {
    saveScore(score, questions.length);
    loadHistory();
  }
}

async function saveScore(score, total) {
  try {
    await apiFetch('/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ score, total })
    });
  } catch (err) {
    console.error('Failed to save score:', err);
  }
}

async function loadHistory() {
  try {
    const data = await apiFetch('/api/quiz/history');
    const historyEl = document.getElementById('historyList');
    if (!historyEl) return;

    if (!data.history || data.history.length === 0) {
      historyEl.innerHTML = '<p>No quiz history yet.</p>';
      return;
    }

    historyEl.innerHTML = data.history.map(h => `
      <div class="history-item">
        <span class="history-score">${h.score}/${h.total}</span>
        <span class="history-date">${new Date(h.takenAt).toLocaleDateString()}</span>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load history:', err);
  }
}

function restartQuiz() {
  document.getElementById('quizResults').classList.add('hidden');
  startQuiz();
}

document.addEventListener('DOMContentLoaded', () => {
  const quizStart = document.getElementById('quizStart');
  if (quizStart) {
    if (!getToken()) {
      document.getElementById('authWarning').classList.remove('hidden');
    }
    authGuard();
    document.getElementById('startBtn').addEventListener('click', startQuiz);
  }

  const quizResults = document.getElementById('quizResults');
  if (quizResults) {
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) restartBtn.addEventListener('click', restartQuiz);
  }
});