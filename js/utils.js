window.utils = {
  getToken: () => localStorage.getItem('cybershield_token'),
  setToken: (token) => localStorage.setItem('cybershield_token', token),
  removeToken: () => localStorage.removeItem('cybershield_token'),
  
  authGuard: () => {
    if (!window.utils.getToken()) {
      window.location.href = 'login.html';
    }
  },
  
  showError: (message) => {
    const el = document.getElementById('message');
    if (el) {
      el.className = 'message error';
      el.textContent = message;
      el.classList.remove('hidden');
    }
  },
  
  showSuccess: (message) => {
    const el = document.getElementById('message');
    if (el) {
      el.className = 'message success';
      el.textContent = message;
      el.classList.remove('hidden');
    }
  },
  
  hideMessage: () => {
    const el = document.getElementById('message');
    if (el) {
      el.classList.add('hidden');
    }
  },
  
  apiFetch: async (url, options = {}) => {
    const token = window.utils.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  },
  
  formatDate: (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },
  
  getUrlParam: (name) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }
};