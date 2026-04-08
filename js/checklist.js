const { apiFetch, authGuard, getToken } = window.utils;

const checklistItems = [
  "Use strong, unique passwords for each account",
  "Enable two-factor authentication (2FA) on important accounts",
  "Keep software and operating systems updated",
  "Use a reputable antivirus and keep it updated",
  "Backup important files regularly",
  "Be cautious of emails from unknown senders",
  "Verify links before clicking - hover to preview",
  "Use a password manager",
  "Secure your home Wi-Fi network",
  "Log out of accounts when using public computers",
  "Review privacy settings on social media",
  "Use a VPN on public Wi-Fi",
  "Shred sensitive documents",
  "Be aware of social engineering attacks",
  "Regularly review account statements"
];

let completed = [];

async function loadProgress() {
  if (!getToken()) return;

  try {
    const data = await apiFetch('/api/checklist/get');
    completed = data.completed || [];
    renderChecklist();
  } catch (err) {
    console.error('Failed to load progress:', err);
  }
}

async function saveProgress() {
  if (!getToken()) return;

  try {
    await apiFetch('/api/checklist/update', {
      method: 'POST',
      body: JSON.stringify({ completed })
    });
  } catch (err) {
    console.error('Failed to save progress:', err);
  }
}

function toggleItem(index) {
  if (completed.includes(index)) {
    completed = completed.filter(i => i !== index);
  } else {
    completed.push(index);
  }
  renderChecklist();
  saveProgress();
}

function renderChecklist() {
  const container = document.getElementById('checklistItems');
  if (!container) return;

  container.innerHTML = checklistItems.map((item, i) => `
    <div class="checklist-item ${completed.includes(i) ? 'checked' : ''}">
      <input type="checkbox" ${completed.includes(i) ? 'checked' : ''} 
             onchange="toggleItem(${i})" id="item-${i}">
      <label for="item-${i}">${item}</label>
    </div>
  `).join('');

  const progress = (completed.length / checklistItems.length) * 100;
  document.getElementById('progressBar').style.width = `${progress}%`;
  document.getElementById('progressText').textContent = `${completed.length}/${checklistItems.length} completed`;
}

function testPasswordStrength() {
  const password = document.getElementById('passwordInput').value;
  const result = document.getElementById('passwordResult');

  if (!password) {
    result.className = 'password-strength';
    result.textContent = 'Enter a password';
    return;
  }

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) {
    result.className = 'password-strength weak';
    result.textContent = 'Weak';
  } else if (strength <= 3) {
    result.className = 'password-strength medium';
    result.textContent = 'Medium';
  } else {
    result.className = 'password-strength strong';
    result.textContent = 'Strong';
  }
}

const phishingEmails = [
  {
    from: "support@amaz0n-security.com",
    subject: "Urgent: Your account has been compromised!",
    body: "Dear Customer, We detected suspicious activity. Click here immediately to verify your identity or your account will be locked.",
    flags: [
      "Suspicious sender domain (amaz0n instead of amazon)",
      "Urgency tactics",
      "Generic greeting (Dear Customer)",
      "Threat of account lock"
    ]
  },
  {
    from: "IT-Department@c0mpany.net",
    subject: "Password Reset Required",
    body: "Your password expires in 24 hours. Click below to reset now to maintain access.",
    flags: [
      "Unusual sender domain",
      "Creating false urgency",
      "Requesting password action"
    ]
  },
  {
    from: "bank-alerts@secure-bank.com",
    subject: "You have a new message",
    body: "Dear Valued Customer, A new secure message is waiting. Login to view: [suspicious-link.com]",
    flags: [
      "Impersonating bank",
      "Suspicious link",
      "Generic greeting"
    ]
  }
];

function revealPhishing(index) {
  const sample = document.querySelectorAll('.phishing-sample')[index];
  sample.classList.toggle('revealed');
  const btn = sample.querySelector('.phishing-toggle');
  btn.textContent = sample.classList.contains('revealed') ? 'Hide Red Flags' : 'Reveal Red Flags';

  if (sample.classList.contains('revealed')) {
    const flagsEl = sample.querySelector('.phishing-red-flags');
    flagsEl.innerHTML = phishingEmails[index].flags.map(f => `<div>⚠️ ${f}</div>`).join('');
  }
}

function renderPhishingSamples() {
  const container = document.getElementById('phishingSamples');
  if (!container) return;

  container.innerHTML = phishingEmails.map((email, i) => `
    <div class="phishing-sample">
      <p><strong>From:</strong> ${email.from}</p>
      <p><strong>Subject:</strong> ${email.subject}</p>
      <p>${email.body}</p>
      <div class="phishing-red-flags"></div>
      <button class="phishing-toggle" onclick="revealPhishing(${i})">Reveal Red Flags</button>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const checklistContainer = document.getElementById('checklistItems');
  if (checklistContainer) {
    authGuard();
    loadProgress();
  }

  const passwordInput = document.getElementById('passwordInput');
  if (passwordInput) {
    passwordInput.addEventListener('input', testPasswordStrength);
  }

  renderPhishingSamples();
});