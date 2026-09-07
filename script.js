// Initialize Controller Admin on startup
(function initControllerAccount() {
    const users = JSON.parse(localStorage.getItem('gbc_registered_users') || '[]');
    if (!users.some(u => u.username === 'Theophilus')) {
        users.push({ username: 'Theophilus', email: 'otheophilus92@gmail.com', pass: '631111pw', role: 'Controller (Rank 7)' });
        localStorage.setItem('gbc_registered_users', JSON.stringify(users));
    }
    const staff = JSON.parse(localStorage.getItem('gbc_approved_staff') || '[]');
    if (!staff.some(s => s.name === 'Theophilus')) {
        staff.push({ name: 'Theophilus', email: 'otheophilus92@gmail.com', rank: '7', role: 'Controller / Senior Admin' });
        localStorage.setItem('gbc_approved_staff', JSON.stringify(staff));
    }
})();

const defaultStoreData = {
    coins: [
        { title: "1 GC COIN", price: "1 GC", tag: "INSTANT", desc: "$0.27 • ₦400", image: "" },
        { title: "5 GC COIN", price: "5 GC", tag: "POPULAR", desc: "$1.35 • ₦2,000", image: "" },
        { title: "10 GC COIN", price: "10 GC", tag: "VALUE", desc: "$2.70 • ₦4,000", image: "" },
        { title: "25 GC COIN", price: "25 GC", tag: "BUNDLE", desc: "$6.75 • ₦10,000", image: "" }
    ],
    donators: [
        { title: "Bronze Donator", price: "5 GC", tag: "TIER 1", desc: "50M Cash • Bronze Tag • 1 Car Slot", image: "" },
        { title: "Gold Donator", price: "13 GC", tag: "TIER 2", desc: "200M Cash • Gold Tag • 3 Car Slots • Custom Plate", image: "" },
        { title: "Diamond Donator", price: "20 GC", tag: "TIER 3", desc: "500M Cash • Diamond Tag • 5 Car Slots • Mansion Discount", image: "" }
    ],
    properties: [
        { title: "Vinwood Mansion", price: "17 GC", tag: "10% OFF", desc: "Hillside estate, pool access • Game: 38M", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80" },
        { title: "City Penthouse", price: "15 GC", tag: "10% OFF", desc: "High-rise, helipad included • Game: 32M", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80" },
        { title: "Beach Villa", price: "13 GC", tag: "10% OFF", desc: "Oceanfront, private dock • Game: 28M", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" }
    ],
    business: [
        { title: "Gas Station", price: "10 GC", tag: "BUSINESS", desc: "Passive income generation hub", image: "https://images.unsplash.com/photo-1527018270362-7a7c9f28d889?auto=format&fit=crop&w=600&q=80" },
        { title: "Nightclub", price: "10 GC", tag: "BUSINESS", desc: "High traffic entertainment venue", image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=80" }
    ],
    vehicles: [
        { title: "Porsche 911 Turbo S White", price: "34 GC", tag: "STOCK 5 • 10% OFF", desc: "Game Value: 75M • Ratio pricing applied", image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80" },
        { title: "Bugatti Chiron Super Sport", price: "63 GC", tag: "STOCK 5 • 10% OFF", desc: "Game Value: 140M • Ratio pricing applied", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80" }
    ]
};

function getStoreData() {
    const saved = localStorage.getItem('gbc_store_data_categorized');
    return saved ? JSON.parse(saved) : defaultStoreData;
}

function renderMarketplace() {
    const data = getStoreData();
    const sectionMapping = { coins: 'coins-grid', donators: 'donators-grid', properties: 'properties-grid', business: 'business-grid', vehicles: 'vehicles-grid' };
    for (const [catKey, gridId] of Object.entries(sectionMapping)) {
        const grid = document.getElementById(gridId);
        if (!grid) continue;
        grid.innerHTML = '';
        (data[catKey] || []).forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            let imgHTML = item.image ? `<img class="card-img" src="${item.image}" alt="${item.title}">` : '';
            card.innerHTML = `${imgHTML}<div class="card-body"><span class="badge-tag">${item.tag}</span><div class="card-title">${item.title}</div><div class="card-desc">${item.desc}</div><div style="font-size: 1.1rem; font-weight: 800; color: var(--accent-gold); margin-bottom: 12px;">${item.price}</div><button class="btn-primary" onclick="addToCart('${item.title}', '${item.price}')">ADD TO CART</button></div>`;
            grid.appendChild(card);
        });
    }
}

function getCart() { return JSON.parse(localStorage.getItem('gbc_cart_items') || '[]'); }
function addToCart(title, price) {
    const cart = getCart();
    cart.push({ title, price });
    localStorage.setItem('gbc_cart_items', JSON.stringify(cart));
    updateCartUI();
    toggleCartDrawer();
}
function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    localStorage.setItem('gbc_cart_items', JSON.stringify(cart));
    updateCartUI();
}
function updateCartUI() {
    const cart = getCart();
    const countEl = document.getElementById('cartCount');
    if(countEl) countEl.innerText = cart.length;
    const listEl = document.getElementById('cartItemsList');
    if(!listEl) return;
    if (cart.length === 0) {
        listEl.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 20px;">Your cart is empty.</p>';
        return;
    }
    listEl.innerHTML = '';
    cart.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `<div><strong>${item.title}</strong><br><span style="color: var(--accent-gold);">${item.price}</span></div><button class="btn-primary btn-danger" style="width: auto; padding: 4px 8px; font-size: 0.75rem;" onclick="removeFromCart(${index})">✕</button>`;
        listEl.appendChild(row);
    });
}
function toggleCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if(drawer) drawer.classList.toggle('open');
}

function checkoutCartWhatsApp() {
    const cart = getCart();
    if (cart.length === 0) { alert('Your cart is empty!'); return; }
    const orderId = 'GBC-' + Math.floor(100000 + Math.random() * 900000);
    const loggedUser = sessionStorage.getItem('gbc_logged_in_user') || 'Guest Player';
    let itemsText = cart.map(i => `• ${i.title} [${i.price}]`).join('\n');
    
    const orders = JSON.parse(localStorage.getItem('gbc_order_logs') || '[]');
    orders.unshift({ orderId, user: loggedUser, items: cart, date: new Date().toLocaleString() });
    localStorage.setItem('gbc_order_logs', JSON.stringify(orders));

    sendDiscordWebhookAlert(`📦 **New GBC Order (${orderId})**\nCustomer: ${loggedUser}\nItems:\n${itemsText}`);

    const message = `🛒 *GRAND BILLIONAIRE CITY - ORDER INVOICE* 🛒\n\n🆔 *Order ID:* ${orderId}\n👤 *Customer:* ${loggedUser}\n\n*Items Ordered:*\n${itemsText}\n\n📌 Please verify payment!`;
    localStorage.removeItem('gbc_cart_items');
    updateCartUI();
    toggleCartDrawer();
    window.open(`https://wa.me/2348000000000?text=${encodeURIComponent(message)}`, '_blank');
}

function loadUserOrderHistory(username) {
    const container = document.getElementById('userOrderHistory');
    if(!container) return;
    const orders = JSON.parse(localStorage.getItem('gbc_order_logs') || '[]').filter(o => o.user === username);
    if (orders.length === 0) { container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">You have no checkout history yet.</p>'; return; }
    container.innerHTML = '';
    orders.forEach(ord => {
        const box = document.createElement('div');
        box.style.background = '#0a0a0a'; box.style.border = '1px solid var(--card-border)'; box.style.padding = '12px'; box.style.borderRadius = '8px'; box.style.fontSize = '0.85rem';
        box.innerHTML = `<strong>Order ID:</strong> ${ord.orderId} <span style="float: right; color: var(--text-muted);">${ord.date}</span><br><span style="color: var(--accent-gold);">Items:</span> ${ord.items.map(i => `${i.title} (${i.price})`).join(', ')}`;
        container.appendChild(box);
    });
}

function toggleSupportChat() {
    const box = document.getElementById('supportChatBox');
    if(box) box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
}

function getChatMessages() {
    return JSON.parse(localStorage.getItem('gbc_live_chat_history') || JSON.stringify([{ sender: 'admin', text: 'Hello! How can we assist you with your order today?' }]));
}

function sendUserChatMessage() {
    const input = document.getElementById('chatInputMsg');
    if(!input || !input.value.trim()) return;
    const chat = getChatMessages();
    const msgText = input.value.trim();
    chat.push({ sender: 'user', text: msgText });
    localStorage.setItem('gbc_live_chat_history', JSON.stringify(chat));
    input.value = '';
    renderChatBox();
    sendDiscordWebhookAlert(`💬 **New Live Support Message**\nUser: ${sessionStorage.getItem('gbc_logged_in_user') || 'Player'}\nMessage: "${msgText}"`);
}

function handleChatEnter(e) { if(e.key === 'Enter') sendUserChatMessage(); }

function renderChatBox() {
    const body = document.getElementById('supportChatBody');
    if(!body) return;
    body.innerHTML = '';
    getChatMessages().forEach(msg => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${msg.sender}`;
        bubble.innerText = msg.text;
        body.appendChild(bubble);
    });
    body.scrollTop = body.scrollHeight;
}

function loadAdminChatSession() {
    const log = document.getElementById('adminChatLog');
    if(!log) return;
    log.innerHTML = '';
    getChatMessages().forEach(msg => {
        const row = document.createElement('div');
        row.style.textAlign = msg.sender === 'user' ? 'left' : 'right';
        row.innerHTML = `<span style="display: inline-block; background: ${msg.sender === 'user' ? '#222' : '#f3ce54'}; color: ${msg.sender === 'user' ? '#fff' : '#000'}; padding: 6px 10px; border-radius: 6px; font-size: 0.85rem;"><strong>${msg.sender.toUpperCase()}:</strong> ${msg.text}</span>`;
        log.appendChild(row);
    });
    log.scrollTop = log.scrollHeight;
}

function sendAdminReply() {
    const input = document.getElementById('adminReplyInput');
    if(!input || !input.value.trim()) return;
    const chat = getChatMessages();
    chat.push({ sender: 'admin', text: input.value.trim() });
    localStorage.setItem('gbc_live_chat_history', JSON.stringify(chat));
    input.value = '';
    loadAdminChatSession();
}

function handleAdminEnter(e) { if(e.key === 'Enter') sendAdminReply(); }

function loadOrderLogs() {
    const container = document.getElementById('orderLogsContainer');
    if(!container) return;
    const orders = JSON.parse(localStorage.getItem('gbc_order_logs') || '[]');
    if (orders.length === 0) { container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No orders recorded yet.</p>'; return; }
    container.innerHTML = '';
    orders.forEach(ord => {
        const box = document.createElement('div');
        box.style.background = '#0a0a0a'; box.style.border = '1px solid var(--card-border)'; box.style.padding = '12px'; box.style.borderRadius = '8px'; box.style.fontSize = '0.85rem';
        box.innerHTML = `<strong>ID:</strong> ${ord.orderId} | <strong>User:</strong> ${ord.user} <span style="float: right; color: var(--text-muted);">${ord.date}</span><br><span style="color: var(--accent-gold);">Items:</span> ${ord.items.map(i => `${i.title} (${i.price})`).join(', ')}`;
        container.appendChild(box);
    });
}

function loadPlayersDirectory() {
    const container = document.getElementById('playersDirectoryContainer');
    if(!container) return;
    const users = JSON.parse(localStorage.getItem('gbc_registered_users') || '[]');
    if (users.length === 0) { container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No players registered.</p>'; return; }
    container.innerHTML = '';
    users.forEach(u => {
        const box = document.createElement('div');
        box.style.background = '#0a0a0a'; box.style.border = '1px solid var(--card-border)'; box.style.padding = '12px'; box.style.borderRadius = '8px'; box.style.fontSize = '0.85rem';
        box.innerHTML = `👤 <strong>Username:</strong> ${u.username} | ✉️ <strong>Email:</strong> ${u.email} <span style="float: right; color: var(--accent-gold);">${u.role || 'Player'}</span>`;
        container.appendChild(box);
    });
}

function switchPanelTab(tabName, btnEl) {
    document.querySelectorAll('.panel-section').forEach(sec => sec.style.display = 'none');
    document.querySelectorAll('.tab-selector .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`panelTab-${tabName}`).style.display = 'block';
    if(btnEl) btnEl.classList.add('active');
}

function switchAuthTab(tab) {
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('staffRegForm').style.display = tab === 'staffreg' ? 'block' : 'none';
    document.getElementById('tabLoginBtn').classList.toggle('active', tab === 'login');
    document.getElementById('tabRegisterBtn').classList.toggle('active', tab === 'register');
    document.getElementById('tabStaffRegBtn').classList.toggle('active', tab === 'staffreg');
}

function handleUserRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUser').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    const users = JSON.parse(localStorage.getItem('gbc_registered_users') || '[]');
    if (users.some(u => u.username === username)) { alert('Username already exists!'); return; }
    users.push({ username, email, pass, role: 'Player' });
    localStorage.setItem('gbc_registered_users', JSON.stringify(users));
    sessionStorage.setItem('gbc_logged_in_user', username);
    alert('Player account created successfully!');
    checkIndexAuth();
}

function handleStaffRegistration(e) {
    e.preventDefault();
    const name = document.getElementById('staffRegName').value;
    const email = document.getElementById('staffRegEmail').value;
    const pass = document.getElementById('staffRegPass').value;
    const reason = document.getElementById('staffRegReason').value;

    const pending = JSON.parse(localStorage.getItem('gbc_pending_staff') || '[]');
    pending.push({ name, email, pass, reason, date: new Date().toLocaleString() });
    localStorage.setItem('gbc_pending_staff', JSON.stringify(pending));
    alert('Staff application submitted successfully! A senior admin will review and approve your account.');
    document.getElementById('staffRegForm').reset();
    switchAuthTab('login');
}

function handleUserLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    // Controller Login bypass
    if (identifier === 'Theophilus' && pass === '631111pw') {
        sessionStorage.setItem('gbc_logged_in_user', 'Theophilus');
        window.location.href = 'panel.html';
        return;
    }

    // Check if approved staff
    const staffList = JSON.parse(localStorage.getItem('gbc_approved_staff') || '[]');
    const staffMember = staffList.find(s => s.name === identifier);
    if (staffMember) {
        sessionStorage.setItem('gbc_logged_in_user', staffMember.name);
        window.location.href = 'panel.html';
        return;
    }

    const users = JSON.parse(localStorage.getItem('gbc_registered_users') || '[]');
    const found = users.find(u => (u.username === identifier || u.email === identifier) && u.pass === pass);
    if (found) {
        sessionStorage.setItem('gbc_logged_in_user', found.username);
        window.location.href = 'profile.html';
    } else {
        alert('Invalid credentials or staff account awaiting approval!');
    }
}

function userLogout() {
    sessionStorage.removeItem('gbc_logged_in_user');
    window.location.href = 'index.html';
}

function checkIndexAuth() {
    const loggedUser = sessionStorage.getItem('gbc_logged_in_user');
    const loggedInView = document.getElementById('loggedInView');
    const loggedOutView = document.getElementById('loggedOutView');
    const displayUsername = document.getElementById('displayUsername');
    const profileNav = document.getElementById('profileLinkNav');
    if (!loggedInView || !loggedOutView) return;
    if (loggedUser) {
        loggedInView.style.display = 'block';
        loggedOutView.style.display = 'none';
        if (displayUsername) displayUsername.innerText = loggedUser;
        if (profileNav) profileNav.style.display = 'inline-flex';
    } else {
        loggedInView.style.display = 'none';
        loggedOutView.style.display = 'block';
        if (profileNav) profileNav.style.display = 'none';
    }
}

function handleItemUpload(event) {
    event.preventDefault();
    const category = document.getElementById('itemCategory').value;
    const title = document.getElementById('itemTitle').value;
    const price = document.getElementById('itemPrice').value;
    const tag = document.getElementById('itemTag').value;
    const desc = document.getElementById('itemDesc').value;
    const image = document.getElementById('itemImage').value;
    const data = getStoreData();
    if (!data[category]) data[category] = [];
    data[category].unshift({ title, price, tag, desc, image });
    localStorage.setItem('gbc_store_data_categorized', JSON.stringify(data));
    alert('Item successfully published!');
    document.getElementById('uploadForm').reset();
}

// Staff & Rank 1-7 Management
function loadStaffManagementUI() {
    const pendingContainer = document.getElementById('pendingStaffContainer');
    const activeContainer = document.getElementById('activeStaffContainer');
    if(!pendingContainer || !activeContainer) return;

    const pending = JSON.parse(localStorage.getItem('gbc_pending_staff') || '[]');
    pendingContainer.innerHTML = pending.length === 0 ? '<p style="color: var(--text-muted); text-align: center;">No pending staff applications.</p>' : '';
    pending.forEach((p, idx) => {
        const box = document.createElement('div');
        box.style.background = '#0a0a0a'; box.style.border = '1px solid var(--card-border)'; box.style.padding = '12px'; box.style.borderRadius = '8px'; box.style.fontSize = '0.85rem';
        box.innerHTML = `<strong>Name:</strong> ${p.name} | <strong>Email:</strong> ${p.email}<br><em>Reason:</em> ${p.reason}<br><button class="btn-primary" style="width: auto; padding: 6px 12px; margin-top: 8px;" onclick="approveStaff(${idx})">APPROVE & ASSIGN RANK</button>`;
        pendingContainer.appendChild(box);
    });

    const active = JSON.parse(localStorage.getItem('gbc_approved_staff') || '[]');
    activeContainer.innerHTML = active.length === 0 ? '<p style="color: var(--text-muted); text-align: center;">No active staff.</p>' : '';
    active.forEach((s, idx) => {
        const box = document.createElement('div');
        box.style.background = '#0a0a0a'; box.style.border = '1px solid var(--card-border)'; box.style.padding = '12px'; box.style.borderRadius = '8px'; box.style.fontSize = '0.85rem';
        box.innerHTML = `🛡️ <strong>${s.name}</strong> (${s.email}) <span style="float: right; color: var(--accent-gold);">Rank: ${s.rank || '1'} (${s.role || 'Junior Support'})</span><br><div style="margin-top: 8px; display: flex; gap: 8px;"><select id="rankSelect_${idx}" style="padding: 4px; background: #222; color: white; border-radius: 4px;"><option value="1">Rank 1: Trainee</option><option value="2">Rank 2: Junior Support</option><option value="3">Rank 3: Moderator</option><option va
