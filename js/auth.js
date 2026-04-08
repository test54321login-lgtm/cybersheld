document.addEventListener('DOMContentLoaded', () => {
  const { getToken, setToken, removeToken, apiFetch, showError, showSuccess, hideMessage } = window.utils;
  
  const loginTab = document.getElementById('loginTab');
  const signupTab = document.getElementById('signupTab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (getToken() && window.location.pathname.includes('login.html')) {
    window.location.href = 'index.html';
  }

  if (loginTab && signupTab) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
    });

    signupTab.addEventListener('click', () => {
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessage();

      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      if (!email || !password) {
        showError('Please fill in all fields');
        return;
      }

      try {
        const data = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        setToken(data.token);
        showSuccess('Login successful!');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      } catch (err) {
        showError(err.message);
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessage();

      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('signupConfirmPassword').value;

      if (!email || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
      }

      try {
        const data = await apiFetch('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        setToken(data.token);
        showSuccess('Account created!');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      } catch (err) {
        showError(err.message);
      }
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      removeToken();
      window.location.href = 'login.html';
    });
  }
});