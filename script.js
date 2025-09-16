// Sender database
let senders = [
    { id: 1, name: 'Sender 1', status: 'Connected', lastActive: '2 minutes ago' },
    { id: 2, name: 'Sender 2', status: 'Connected', lastActive: '5 minutes ago' }
];

// Pairing codes
let pairingCodes = {
    currentCode: generatePairingCode(),
    usedCodes: []
};

// Initialize dashboard
function initDashboard() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Display user info
    document.getElementById('usernameDisplay').textContent = currentUser.username;
    const userTypeBadge = document.getElementById('userTypeBadge');
    userTypeBadge.textContent = currentUser.type.toUpperCase();
    userTypeBadge.classList.add(currentUser.type);
    
    // Setup menu navigation
    setupMenuNavigation();
    
    // Show/hide menu items based on user type
    setupUserPermissions(currentUser.type);
    
    // Populate user type dropdown
    setupUserTypeDropdown(currentUser.type);
    
    // Initialize pairing code
    document.getElementById('pairingCode').textContent = pairingCodes.currentCode;
    
    // Setup refresh pairing code button
    document.getElementById('refreshPairingCode').addEventListener('click', function(e) {
        e.preventDefault();
        pairingCodes.currentCode = generatePairingCode();
        document.getElementById('pairingCode').textContent = pairingCodes.currentCode;
    });
    
    // Render initial data
    renderSenders();
    renderUsers();
    
    // Initialize forms
    initTargetForm();
    initAddUserForm();
}

// Generate random pairing code
function generatePairingCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Setup menu navigation
function setupMenuNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    const sections = document.querySelectorAll('.content > div');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all menu items
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.classList.add('hidden'));
            
            // Show selected section
            const sectionId = this.getAttribute('data-section') + 'Section';
            document.getElementById(sectionId).classList.remove('hidden');
        });
    });
}

// Setup user permissions
function setupUserPermissions(userType) {
    if (userType === 'classic') {
        document.getElementById('usersMenuItem').style.display = 'none';
        document.getElementById('pairingMenuItem').style.display = 'none';
    } else if (userType === 'reseller') {
        document.getElementById('pairingMenuItem').style.display = 'none';
    }
}

// Setup user type dropdown
function setupUserTypeDropdown(userType) {
    const userTypeSelect = document.getElementById('userType');
    
    if (userType === 'vip') {
        userTypeSelect.innerHTML = `
            <option value="vip">VIP</option>
            <option value="owner">Owner</option>
            <option value="reseller">Reseller</option>
            <option value="classic">Classic</option>
        `;
    } else if (userType === 'owner') {
        userTypeSelect.innerHTML = `
            <option value="reseller">Reseller</option>
            <option value="classic">Classic</option>
        `;
    } else if (userType === 'reseller') {
        userTypeSelect.innerHTML = `
            <option value="classic">Classic</option>
        `;
    }
}

// Render senders list
function renderSenders() {
    const sendersList = document.getElementById('sendersList');
    sendersList.innerHTML = '';
    
    senders.forEach(sender => {
        const senderItem = document.createElement('div');
        senderItem.className = 'sender-item';
        senderItem.innerHTML = `
            <div>
                <h3>${sender.name}</h3>
                <p>Status: ${sender.status} | Last active: ${sender.lastActive}</p>
            </div>
            <div class="sender-actions">
                <button data-id="${sender.id}">Remove</button>
            </div>
        `;
        sendersList.appendChild(senderItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.sender-actions button').forEach(button => {
        button.addEventListener('click', function() {
            const senderId = parseInt(this.getAttribute('data-id'));
            senders = senders.filter(sender => sender.id !== senderId);
            renderSenders();
        });
    });
}

// Render users list
function renderUsers() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    Object.entries(users).forEach(([username, userData]) => {
        // Don't show current user in the list
        if (username === currentUser.username) return;
        
        // Filter based on user permissions
        if (currentUser.type === 'reseller' && userData.type !== 'classic') return;
        if (currentUser.type === 'owner' && userData.type === 'vip') return;
        
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div>
                <h3>${username}</h3>
                <span class="user-type-badge ${userData.type}">${userData.type.toUpperCase()}</span>
            </div>
            <div class="user-actions">
                <button data-username="${username}">Delete</button>
            </div>
        `;
        usersList.appendChild(userItem);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.user-actions button').forEach(button => {
        button.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            delete users[username];
            renderUsers();
        });
    });
}

// Initialize target form
function initTargetForm() {
    const targetForm = document.getElementById('targetForm');
    if (!targetForm) return;
    
    targetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const targetNumber = document.getElementById('targetNumber').value;
        const attackType = document.getElementById('attackType').value;
        
        // Validate target number
        if (!targetNumber.match(/^[0-9]+$/)) {
            showAttackStatus('Invalid target number. Please enter only digits.', 'error');
            return;
        }
        
        // Select a random sender
        if (senders.length === 0) {
            showAttackStatus('No senders available. Please pair a sender first.', 'error');
            return;
        }
        
        const randomSender = senders[Math.floor(Math.random() * senders.length)];
        
        // Execute the attack
        executeAttack(targetNumber, attackType, randomSender);
        
        // Reset form
        this.reset();
    });
}

// Show attack status
function showAttackStatus(message, type = 'success') {
    const statusElement = document.getElementById('attackStatus');
    statusElement.textContent = message;
    statusElement.style.backgroundColor = type === 'success' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)';
    statusElement.style.borderColor = type === 'success' ? '#00ff00' : '#ff0000';
    statusElement.style.color = type === 'success' ? '#00ff00' : '#ff0000';
    
    // Hide after 5 seconds
    setTimeout(() => {
        statusElement.textContent = '';
        statusElement.style.backgroundColor = '';
        statusElement.style.borderColor = '';
        statusElement.style.color = '';
    }, 5000);
}

// Initialize add user form
function initAddUserForm() {
    const addUserForm = document.getElementById('addUserForm');
    if (!addUserForm) return;
    
    addUserForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const type = document.getElementById('userType').value;
        
        // Validate username
        if (users[username]) {
            alert('Username already exists');
            return;
        }
        
        // Add new user
        users[username] = { password, type };
        
        // Render updated list
        renderUsers();
        
        // Reset form
        this.reset();
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('dashboard.html')) {
        initDashboard();
    }
});