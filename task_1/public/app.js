// App State Management
let currentToken = localStorage.getItem('auth_token') || null;
let currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null');

// Initialize App on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  if (currentToken && currentUser) {
    updateUIForAuthenticatedUser();
    switchTab('dashboard');
  } else {
    switchTab('register');
  }
});

/**
 * Switch Navigation Tab View
 */
function switchTab(tabName) {
  const tabs = ['register', 'login', 'dashboard', 'admin'];
  tabs.forEach(tab => {
    const btn = document.getElementById(`nav-${tab}`);
    const view = document.getElementById(`view-${tab}`);
    if (btn) btn.classList.remove('active');
    if (view) view.classList.remove('active');
  });

  const activeBtn = document.getElementById(`nav-${tabName}`);
  const activeView = document.getElementById(`view-${tabName}`);

  if (activeBtn) activeBtn.classList.add('active');
  if (activeView) activeView.classList.add('active');

  // Trigger tab specific data loading
  if (tabName === 'dashboard' && currentToken) {
    updateTokenDisplay();
    fetchDashboardData();
  } else if (tabName === 'admin' && currentToken) {
    fetchAdminUsers();
  }
}

/**
 * Display Toast Alert Message
 */
function showAlert(message, isError = false) {
  const container = document.getElementById('alert-container');
  const msgEl = document.getElementById('alert-message');

  msgEl.textContent = message;
  msgEl.className = `alert-message ${isError ? 'alert-error' : 'alert-success'}`;
  container.classList.remove('hidden');

  setTimeout(() => {
    container.classList.add('hidden');
  }, 4500);
}

/**
 * Handle User Registration
 */
async function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showAlert(data.message || 'Registration failed.', true);
      return;
    }

    // Store session token and user
    saveSession(data.token, data.user);
    showAlert(`Welcome, ${data.user.username}! Account created successfully.`);
    document.getElementById('register-form').reset();
    switchTab('dashboard');

  } catch (err) {
    showAlert('Network error connecting to server.', true);
  }
}

/**
 * Handle User Login
 */
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showAlert(data.message || 'Authentication failed. Please check credentials.', true);
      return;
    }

    saveSession(data.token, data.user);
    showAlert(`Welcome back, ${data.user.username}! Login successful.`);
    document.getElementById('login-form').reset();
    switchTab('dashboard');

  } catch (err) {
    showAlert('Network error connecting to server.', true);
  }
}

/**
 * Save Session Data
 */
function saveSession(token, user) {
  currentToken = token;
  currentUser = user;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
  updateUIForAuthenticatedUser();
}

/**
 * Logout Action
 */
function handleLogout() {
  currentToken = null;
  currentUser = null;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');

  document.getElementById('nav-dashboard').classList.add('hidden');
  document.getElementById('nav-admin').classList.add('hidden');
  document.getElementById('nav-logout').classList.add('hidden');
  document.getElementById('user-status-bar').classList.add('hidden');

  showAlert('You have been logged out.');
  switchTab('login');
}

/**
 * Update Navbar and Header User State
 */
function updateUIForAuthenticatedUser() {
  if (!currentUser) return;

  document.getElementById('nav-dashboard').classList.remove('hidden');
  document.getElementById('nav-admin').classList.remove('hidden');
  document.getElementById('nav-logout').classList.remove('hidden');

  const statusBar = document.getElementById('user-status-bar');
  statusBar.classList.remove('hidden');

  document.getElementById('logged-user-name').textContent = currentUser.username;
  document.getElementById('logged-user-email').textContent = currentUser.email;

  const roleBadge = document.getElementById('logged-user-role');
  const isAdm = currentUser.role === 'admin';
  roleBadge.textContent = currentUser.role.toUpperCase();
  roleBadge.className = `badge ${isAdm ? 'badge-admin' : 'badge-user'}`;
}

/**
 * Decode JWT token payload on client
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * Update JWT token inspector display
 */
function updateTokenDisplay() {
  if (!currentToken) return;

  const rawEl = document.getElementById('raw-jwt-display');
  const decodedEl = document.getElementById('decoded-jwt-display');

  rawEl.value = currentToken;
  const decoded = parseJwt(currentToken);
  decodedEl.textContent = JSON.stringify(decoded, null, 2);
}

/**
 * Fetch Protected Dashboard Route Data
 */
async function fetchDashboardData() {
  if (!currentToken) return;

  try {
    const res = await fetch('/api/user/dashboard', {
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });

    const data = await res.json();
    const jsonEl = document.getElementById('dashboard-json');
    const respContainer = document.getElementById('dashboard-response');

    jsonEl.textContent = JSON.stringify(data, null, 2);
    respContainer.classList.remove('hidden');

  } catch (err) {
    showAlert('Error requesting protected dashboard route.', true);
  }
}

/**
 * Fetch Admin Registered Users (RBAC Protected)
 */
async function fetchAdminUsers() {
  if (!currentToken) return;

  const accessDeniedBox = document.getElementById('admin-access-denied');
  const adminContent = document.getElementById('admin-content');

  if (currentUser.role !== 'admin') {
    accessDeniedBox.classList.remove('hidden');
    adminContent.classList.add('hidden');
    document.getElementById('denied-role-name').textContent = currentUser.role.toUpperCase();
    return;
  }

  accessDeniedBox.classList.add('hidden');
  adminContent.classList.remove('hidden');

  try {
    const res = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showAlert(data.message || 'Access to Admin API denied.', true);
      return;
    }

    document.getElementById('total-users-count').textContent = `Total Registered Users: ${data.count}`;
    const tbody = document.getElementById('admin-users-tbody');
    tbody.innerHTML = '';

    data.users.forEach(u => {
      const tr = document.createElement('tr');
      const isAdm = u.role === 'admin';
      const isSelf = u.id === currentUser.id;

      tr.innerHTML = `
        <td>#${u.id}</td>
        <td><strong>${escapeHtml(u.username)}</strong> ${isSelf ? '(You)' : ''}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="badge ${isAdm ? 'badge-admin' : 'badge-user'}">${u.role.toUpperCase()}</span></td>
        <td>${new Date(u.created_at).toLocaleString()}</td>
        <td>
          ${isSelf ? '<span class="text-muted">N/A</span>' : `<button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})">Delete</button>`}
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    showAlert('Failed to fetch admin user list.', true);
  }
}

/**
 * Delete User Action (Admin Only)
 */
async function deleteUser(userId) {
  if (!confirm(`Are you sure you want to delete user #${userId}?`)) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showAlert(data.message || 'Failed to delete user.', true);
      return;
    }

    showAlert(data.message);
    fetchAdminUsers();

  } catch (err) {
    showAlert('Error requesting user deletion.', true);
  }
}

/**
 * Helper: Quick Preset Demo Users
 */
async function createDemoUser(role) {
  const timestamp = Date.now().toString().slice(-4);
  const username = `${role}_demo_${timestamp}`;
  const email = `${role}_${timestamp}@example.com`;
  const password = 'Password123!';

  document.getElementById('reg-username').value = username;
  document.getElementById('reg-email').value = email;
  document.getElementById('reg-password').value = password;
  document.getElementById('reg-role').value = role;

  switchTab('register');
  showAlert(`Pre-filled ${role.toUpperCase()} demo credentials. Click "Sign Up & Register" to proceed!`);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
