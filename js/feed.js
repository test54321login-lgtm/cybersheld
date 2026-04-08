const { apiFetch } = window.utils;

let currentFilter = 'All';

async function loadFeed(category = 'All') {
  currentFilter = category;
  const url = category === 'All' ? '/api/feed' : `/api/feed?category=${category}`;

  try {
    const data = await apiFetch(url);
    renderFeed(data.feed);
  } catch (err) {
    console.error('Failed to load feed:', err);
  }
}

function renderFeed(feed) {
  const container = document.getElementById('feedGrid');
  if (!container) return;

  if (!feed || feed.length === 0) {
    container.innerHTML = '<div class="empty-state">No items found</div>';
    return;
  }

  container.innerHTML = feed.map(item => `
    <div class="tip-card">
      <span class="tip-tag ${item.category.toLowerCase()}">${item.category}</span>
      <h3>${item.title}</h3>
      <p>${item.content}</p>
      <div class="tip-date">${new Date(item.date).toLocaleDateString()}</div>
    </div>
  `).join('');
}

function setFilter(category) {
  currentFilter = category;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === category);
  });
  loadFeed(category);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('feedGrid')) {
    loadFeed();

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => setFilter(btn.textContent));
    });
  }
});