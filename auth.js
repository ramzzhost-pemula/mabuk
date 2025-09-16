// User database (in a real app, this would be on a server)
let users = {
    'vip': { password: 'vip123', type: 'vip' },
    'owner': { password: 'owner123', type: 'owner' },
    'reseller': { password: 'reseller123', type: 'reseller' },
    'classic': { password: 'classic123', type: 'classic' }
};

// Check if user is logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser && window.location.pathname.endsWith('dashboard.html')) {
        window.location.href = 'index.html';
    }
}

// Login function
function login(username, password) {
    if (users[username] && users[username].password === password) {
        localStorage.setItem('currentUser', JSON.stringify({
            username: username,
            type: users[username].type
        }));
        return true;
    }
    return false;
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize login form
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (login(username, password)) {
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('error').textContent = 'Invalid username or password';
            }
        });
    }
}

// Initialize logout button
function initLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Initialize auth system
function initAuth() {
    checkAuth();
    initLoginForm();
    initLogoutButton();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);