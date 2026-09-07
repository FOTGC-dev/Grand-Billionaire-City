// Initialize First Owner (Theophilus - Level 8 Controller / Owner)
(function initOwnerAccount() {
    const users = JSON.parse(localStorage.getItem('gbc_registered_users') || '[]');
    if (!users.some(u => u.username === 'Theophilus')) {
        users.push({ username: 'Theophilus', email: 'otheophilus92@gmail.com', pass: '631111pw', level: 8, role: 'Level 8: Owner' });
        localStorage.setItem('gbc_registered_users', JSON.stringify(users));
    }
    const staff = JSON.parse(localStorage.getItem('gbc_approved_staff') || '[]');
    if (!staff.some(s => s.name === 'Theophilus')) {
        staff.push({ name: 'Theophilus', email: 'otheophilus92@gmail.com', pass: '631111pw', level: '8', role: 'Level 8: Owner' });
        localStorage.setItem('gbc_approved_staff', JSON.stringify(staff));
    }
})();

// Default Store / Homepage Items
const defaultStoreData = {
    coins: [
        { id: 'c1', title: "1 GC COIN", price: "1 GC", tag: "INSTANT", desc: "$0.27 • ₦400" },
        { id: 'c2', title: "5 GC COIN", price: "5 GC", tag: "POPULAR", desc: "$1.35 • ₦2,000" }
    ],
    vehicles: [
        { id: 'v1', title: "Porsche 911 Turbo S", price: "34 GC", tag: "STOCK 5", desc: "Game Value: 75M" }
    ],
    properties: [
        { id: 'p1', title: "Vinwood Mansion", price: "17 GC", tag: "ESTATE", desc: "Hillside luxury property" }
    ]
};

function getStoreData() {
    const saved = localStorage.getItem('gbc_store_data_categorized');
    return saved ? JSON.parse(saved) : defaultStoreData;
}

// User Portal Authentication
function handleUserLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    const users = JSON.parse(localStorage.getItem('gbc_registered_users') || '[]');
    const found = users.find(u => (u.username === identifier || u.email === identifier) && u.pass === pass);
    if (found) {
        sessionStorage.setItem('gbc_logged_in_user', found.username);
        window.location.href = 'index.php';
    } else {
        alert('Invalid credentials!');
    }
}

function handleUserRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUser').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;

    const users = JSON.parse(localStorage.getItem('gbc_registered_users') || '[]');
    if(users.some(u => u.username === username)) {
        alert('Username already exists.');
        return;
    }
    users.push({ username, email, pass });
    localStorage.setItem('gbc_registered_users', JSON.stringify(users));
    sessionStorage.setItem('gbc_logged_in_user', username);
    alert('Account created successfully!');
    window.location.href = 'index.php';
}

function userLogout() {
    sessionStorage.removeItem('gbc_logged_in_user');
    window.location.href = 'index.php';
}

function checkIndexAuth() {
    const user = sessionStorage.getItem('gbc_logged_in_user');
    if (user) {
        document.getElementById('loggedOutView').style.display = 'none';
        document.getElementById('loggedInView').style.display = 'block';
        document.getElementById('displayUsername').innerText = user;
        const profileNav = document.getElementById('profileLinkNav');
        if(profileNav) profileNav.style.display = 'inline-block';
    }
}

// Render Marketplace Storefront
function renderMarketplaceStorefront() {
    const grid = document.getElementById('liveMarketplaceGrid');
    if(!grid) return;
    const data = getStoreData();
    grid.innerHTML = '';

    for (const category in data) {
        data[category].forEach(item => {
            const card = document.createElement('div');
            card.style.background = '#111';
            card.style.border = '1px solid var(--card-border)';
            card.style.borderRadius = '8px';
            card.style.padding = '15px';
            card.innerHTML = `
                <span style="background: var(--accent-gold); color: black; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${item.tag || category.toUpperCase()}</span>
                <h4 style="color: white; margin: 10px 0 5px 0;">${item.title}</h4>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 10px;">${item.desc}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <span style="color: var(--accent-gold); font-weight: bold;">${item.price}</span>
                    <button class="btn-primary" style="width: auto; padding: 6px 14px; font-size: 0.8rem;" onclick="alert('Proceeding to checkout for ${item.title}')">BUY NOW</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}

// Secret Staff Portal Authentication
function handleStaffLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('staffUser').value;
    const pass = document.getElementById('staffPass').value;

    if (identifier === 'Theophilus' && pass === '631111pw') {
        sessionStorage.setItem('gbc_logged_in_user', 'Theophilus');
        window.location.href = 'panel.php';
        return;
    }

    const staffList = JSON.parse(localStorage.getItem('gbc_approved_staff') || '[]');
    const staffMember = staffList.find(s => s.name === identifier && s.pass === pass);
    
    if (staffMember) {
        sessionStorage.setItem('gbc_logged_in_user', staffMember.name);
        window.location.href = 'panel.php';
    } else {
        alert('Invalid staff credentials or account awaiting Level 8 Owner approval.');
    }
}

function handleStaffApplication(e) {
    e.preventDefault();
    const name = document.getElementById('appUser').value;
    const email = document.getElementById('appEmail').value;
    const pass = document.getElementById('appPass').value;
    const reason = document.getElementById('appReason').value;

    const pending = JSON.parse(localStorage.getItem('gbc_pending_staff') || '[]');
    pending.push({ name, email, pass, reason, date: new Date().toLocaleString() });
    localStorage.setItem('gbc_pending_staff', JSON.stringify(pending));
    
    alert('Application submitted! A Level 8 Owner must review and approve your account.');
    document.getElementById('staffApplyForm').reset();
}

// Panel Initialization & Level Permissions
function initializeStaffPanel(username) {
    const staffList = JSON.parse(localStorage.getItem('gbc_approved_staff') || '[]');
    const currentStaff = staffList.find(s => s.name === username) || { level: '1', role: 'Level 1: Support' };
    const userLevel = parseInt(currentStaff.level || '1');

    document.getElementById('welcomeUserBanner').innerText = `${username} (${currentStaff.role || 'Level 1 Support'})`;

    // Progressive Tab Exposure
    if (userLevel >= 2) document.getElementById('tabOrdersBtn').style.display = 'block';
    if (userLevel >= 4) document.getElementById('tabHomepageBtn').style.display = 'block';
    if (userLevel >= 5) document.getElementById('tabPlayersBtn').style.display = 'block';
    if (userLevel >= 6) document.getElementById('tabAdminsBtn').style.display = 'block';
    if (userLevel >= 7) document.getElementById('tabBankBtn').style.display = 'block';
    if (userLevel >= 8) document.getElementById('tabStaffApprovalBtn').style.display = 'block';

    // Load data for allowed sections
    if (userLevel >= 4) loadHomepageItemsManager();
    if (userLevel >= 5) loadPlayersDirectory();
    if (userLevel >= 6) loadAdminsDirectory();
    if (userLevel >= 7) loadBankSettings();
    if (userLevel >= 8) loadStaffManagementUI();
}

function switchPanelTab(tabName, btnEl) {
    document.querySelectorAll('.panel-section').forEach(sec => sec.style.display = 'none');
    document.querySelectorAll('.tab-selector .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`panelTab-${tabName}`).style.display = 'block';
    if(btnEl) btnEl.classList.add('active');
}

// Level 4+: Homepage / Store Content Management & Deletion
function loadHomepageItemsManager() {
    const container = document.getElementById('homepageItemsContainer');
    if(!container) return;
    const data = getStoreData();
    container.innerHTML = '';

    for (const category in data) {
        data[category].forEach((item, index) => {
            const card = document.createElement('div');
            card.style.background = '#0a0a0a';
            card.style.border = '1px solid var(--card-border)';
            card.style.padding = '12px';
            card.style.borderRadius = '8px';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';
            card.style.marginBottom = '8px';

            card.innerHTML = `
                <div>
                    <span style="color: var(--accent-gold); font-size: 0.75rem; text-transform: uppercase;">[${category}]</span>
                    <strong style="display: block; color: white;">${item.title}</strong>
                    <small style="color: var(--text-muted);">${item.price} - ${item.desc}</small>
                </div>
                <button class="btn-primary" style="width: auto; padding: 6px 12px; background: #c0392b;" onclick="deleteHomepageItem('${category}', ${index})">DELETE</button>
            `;
            container.appendChild(card);
        });
    }
}

function handleAddHomepageItem(e) {
    e.preventDefault();
    const category = document.getElementById('itemCategorySelect').value;
    const title = document.getElementById('itemTitleInput').value;
    const price = document.getElementById('itemPriceInput').value;
    const tag = document.getElementById('itemTagInput').value;
    const desc = document.getElementById('itemDescInput').value;

    const data = getStoreData();
    if(!data[category]) data[category] = [];
    data[category].push({ id: 'item_' + Date.now(), title, price, tag, desc });
    
    localStorage.setItem('gbc_store_data_categorized', JSON.stringify(data));
    alert('Homepage/Store item added successfully!');
    document.getElementById('addItemForm').reset();
    loadHomepageItemsManager();
}

function deleteHomepageItem(category, index) {
    if(!confirm('Are you sure you want to delete this item from the home page?')) return;
    const data = getStoreData();
    if(data[category]) {
        data[category].splice(index, 1);
        localStorage.setItem('gbc_store_data_categorized', JSON.stringify(data));
        loadHomepageItemsManager();
        alert('Item deleted successfully!');
    }
}

// Level 8: Staff Approval & Rank Assignment
function loadStaffManagementUI() {
    const pendingContainer = document.getElementById('pendingStaffContainer');
    const activeContainer = document.getElementById('activeStaffContainer');
    if(!pendingContainer || !activeContainer) return;

    const pending = JSON.parse(localStorage.getItem('gbc_pending_staff') || '[]');
    pendingContainer.innerHTML = pending.length === 0 ? '<p style="color: var(--text-muted);">No pending applications.</p>' : '';
    pending.forEach((p, idx) => {
        const box = document.createElement('div');
        box.style.background = '#0a0a0a'; box.style.border = '1px solid var(--card-border)'; box.style.padding = '12px'; box.style.borderRadius = '8px'; box.style.fontSize = '0.85rem';
        box.innerHTML = `<strong>${p.name}</strong> (${p.email})<br><em>Reason:</em> ${p.reason}<br><button class="btn-primary" style="width: auto; padding: 6px 12px; margin-top: 8px;" onclick="approveStaffMember(${idx})">APPROVE AS LEVEL 1</button>`;
        pendingContainer.appendChild(box);
    });

    const active = JSON.parse(localStorage.getItem('gbc_approved_staff') || '[]');
    activeContainer.innerHTML = '';
    active.forEach((s, idx) => {
        const box = document.createElement('div');
        box.style.background = '#0a0a0a'; box.style.border = '1px solid var(--card-border)'; box.style.padding = '12px'; box.style.borderRadius = '8px'; box.style.fontSize = '0.85rem';
        box.innerHTML = `🛡️ <strong>${s.name}</strong> (${s.email}) <span style="float: right; color: var(--accent-gold);">Level: ${s.level || '1'}</span><br>
        <div style="margin-top: 8px; display: flex; gap: 8px;">
            <select id="levelSelect_${idx}" style="padding: 4px; background: #222; color: white; border-radius: 4px;">
                <option value="1">Level 1: Support Only</option>
                <option value="2">Level 2: Support + Orders</option>
                <option value="3">Level 3: Moderator</option>
                <option value="4">Level 4: Content & Homepage Manager</option>
                <option value="5">Level 5: Player Info Viewer</option>
                <option value="6">Level 6: Senior Admin</option>
                <option value="7">Level 7: Bank & Payments</option>
                <option value="8">Level 8: Owner</option>
            </select>
            <button class="btn-primary" style="width: auto; padding: 4px 10px;" onclick="updateStaffLevel(${idx})">UPDATE RANK</button>
        </div>`;
        activeContainer.appendChild(box);
    });
}

function approveStaffMember(index) {
    const pending = JSON.parse(localStorage.getItem('gbc_pending_staff') || '[]');
    const member = pending.splice(index, 1)[0];
    localStorage.setItem('gbc_pending_staff', JSON.stringify(pending));

    const active = JSON.parse(localStorage.getItem('gbc_approved_staff') || '[]');
    active.push({ name: member.name, email: member.email, pass: member.pass, level: '1', role: 'Level 1: Support Only' });
    localStorage.setItem('gbc_approved_staff', JSON.stringify(active));
    loadStaffManagementUI();
    alert(`Approved ${member.name}!`);
}

function updateStaffLevel(index) {
    const active = JSON.parse(localStorage.getItem('gbc_approved_staff') || '[]');
    const selectEl = document.getElementById(`levelSelect_${index}`);
    const lvlVal = selectEl.value;
    const roleNames = {
        '1': 'Level 1: Support Only',
        '2': 'Level 2: Support + Orders',
        '3': 'Level 3: Moderator',
        '4': 'Level 4: Content Manager',
        '5': 'Level 5: Administrator',
        '6': 'Level 6: Senior Admin',
        '7': 'Level 7: Controller',
        '8': 'Level 8: Owner'
    };
    
    active[index].level = lvlVal;
    active[index].role = roleNames[lvlVal];
    localStorage.setItem('gbc_approved_staff', JSON.stringify(active));
    loadStaffManagementUI();
    alert('Staff rank updated!');
}

function loadAdminsDirectory() {
    const container = document.getElementById('adminsDirectoryContainer');
    if(!container) return;
    const active = JSON.parse(localStorage.getItem('gbc_approved_staff') || '[]');
    container.innerHTML = '';
    active.forEach(a => {
        const box = document.createElement('div');
        box.style.background = '#0a0a0a'; box.style.border = '1px solid var(--card-border)'; box.style.padding = '10px'; box.style.borderRadius = '6px'; box.style.fontSize = '0.85rem';
        box.innerHTML = `🛡️ <strong>${a.name}</strong> - <span style="color: var(--accent-gold);">${a.role || 'Level 1'}</span> (${a.email})`;
        container.appendChild(box);
    });
}

function loadPlayersDirectory() {
    const container = document.getElementById('playersDirectoryContainer');
    if(!container) return;
    const users = JSON.parse(localStorage.getItem('gbc_registered_users') || '[]');
    container.innerHTML = '';
    users.forEach(u => {
        const box = document.createElement('div');
        box.style.background = '#0a0a0a'; box.style.border = '1px solid var(--card-border)'; box.style.padding = '10px'; box.style.borderRadius = '6px'; box.style.fontSize = '0.85rem';
        box.innerHTML = `👤 <strong>${u.username}</strong> - Email: ${u.email}`;
        container.appendChild(box);
    });
}

function saveBankAccountInfo() {
    const details = document.getElementById('bankInfoInput').value;
    localStorage.setItem('gbc_bank_account_info', details);
    alert('Bank account payment information saved!');
}

function loadBankSettings() {
    const input = document.getElementById('bankInfoInput');
    if(input) input.value = localStorage.getItem('gbc_bank_account_info') || '';
            }
        
