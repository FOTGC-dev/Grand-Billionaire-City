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
    const sectionMapping = {
        coins: 'coins-grid',
        donators: 'donators-grid',
        properties: 'properties-grid',
        business: 'business-grid',
        vehicles: 'vehicles-grid'
    };

    for (const [catKey, gridId] of Object.entries(sectionMapping)) {
        const grid = document.getElementById(gridId);
        if (!grid) continue;
        
        grid.innerHTML = '';
        const items = data[catKey] || [];

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            let imgHTML = item.image ? `<img class="card-img" src="${item.image}" alt="${item.title}">` : '';

            card.innerHTML = `
                ${imgHTML}
                <div class="card-body">
                    <span class="badge-tag">${item.tag}</span>
                    <div class="card-title">${item.title}</div>
                    <div class="card-desc">${item.desc}</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: var(--accent-gold); margin-bottom: 12px;">${item.price}</div>
                    <button class="btn-primary" onclick="addToCart('${item.title}', '${item.price}')">ADD TO CART</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}

// Shopping Cart Management
function getCart() {
    const saved = localStorage.getItem('gbc_cart_items');
    return saved ? JSON.parse(saved) : [];
}

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
        row.innerHTML = `
            <div>
                <strong>${item.title}</strong><br>
                <span style="color: var(--accent-gold);">${item.price}</span>
            </div>
            <button class="btn-primary btn-danger" style="width: auto; padding: 4px 8px; font-size: 0.75rem;" onclick="removeFromCart(${index})">✕</button>
        `;
        listEl.appendChild(row);
    });
}

function toggleCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if(drawer) drawer.classList.toggle('open');
}

// Enhanced WhatsApp Checkout Invoice System
function checkoutCartWhatsApp() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const orderId = 'GBC-' + Math.floor(100000 + Math.random() * 900000);
    const loggedUser = sessionStorage.getItem('gbc_logged_in_user') || 'Guest Player';
    let itemsText = cart.map(i => `• ${i.title} [${i.price}]`).join('\n');
    
    // Save to order logs for admin panel
    const orders = JSON.parse(localStorage.getItem('gbc_order_logs') || '[]');
    orders.unshift({ orderId, user: loggedUser, items: cart, date: new Date().toLocaleTimeString() });
    localStorage.setItem('gbc_order_logs', JSON.stringify(orders));

    const message = `🛒 *GRAND BILLIONAIRE CITY - INVOICE* 🛒\n\n🆔 *Order ID:* ${orderId}\n👤 *Customer:* ${loggedUser}\n\n*Ordered Items:*\n${itemsText}\n\n📌 Please verify payment and dispatch items in-game!`;
    const encoded = encodeURIComponent(message);
    
    // Clear cart after checkout trigger
    localStorage.removeItem('gbc_cart_items');
    updateCartUI();
    toggleCartDrawer();

    window.open(`https://wa.me/2348000000000?text=${encoded}`, '_blank');
}

// Live Chat Support Widget Logic
function toggleSupportChat() {
    const box = document.getElementById('supportChatBox');
    if(box) {
        box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
    }
}

function getChatMessages() {
    const saved = localStorage.getItem('gbc_live_chat_history');
    return saved ? JSON.parse(saved) : [{ sender: 'admin', text: 'Hello! How can we assist you with your Grand Billionaire City order today?' }];
}

function sendUserChatMessage() {
    const input = document.getElementById('chatInputMsg');
    if(!input || !input.value.trim()) return;

    const chat = getChatMessages();
    chat.push({ sender: 'user', text: input.value.trim() });
    localStorage.setItem('gbc_live_chat_history', JSON.stringify(chat));
    input.value = '';
    renderChatBox();
}

function handleChatEnter(e) {
    if(e.key === 'Enter') sendUserChatMessage();
}

function renderChatBox() {
    const body = document.getElementById('supportChatBody');
    if(!body) return;

    const chat = getChatMessages();
    body.innerHTML = '';
    chat.forEach(msg => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${msg.sender}`;
        bubble.innerText = msg.text;
        body.appendChild(bubble);
    });
    body.scrollTop = body.scrollHeight;
}

// Admin Panel Tab Switching & Features
function switchPanelTab(tabName, btnEl) {
    document.querySelectorAll('.panel-section').forEach(sec => sec.style.display = 'none');
    document.querySelectorAll('.tab-selector .tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`panelTab-${tabName}`).style.display = 'block';
    if(btnEl) btnEl.classList.add('active');
}

function loadAdminChatSession() {
    const log = document.getElementById('adminChatLog');
    if(!log) return;

    const chat = getChatMessages();
    log.innerHTML = '';
    chat.forEach(msg => {
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

function handleAdminEnter(e) {
    if(e.key === 'Enter') sendAdminReply();
}

function loadOrderLogs() {
    const container = document.getElementById('orderLogsContainer');
    if(!container) return;

    const orders = JSON.parse(localStorage.getItem('gbc_order_logs') || '[]');
    if (orders.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No orders recorded yet.</p>';
        return;
    }

    container.innerHTML = '';
    orders.forEach(ord => {
        const box = document.createElement('div');
        box.style.background = '#0a0a0a';
        box.style.border = '1px solid var(--card-border)';
        box.style.padding = '12px';
        box.style.borderRadius = '8px';
        box.style.fontSize = '0.85rem';

        let itemsSummary = ord.items.map(i => `${i.title} (${i.price})`).join(', ');
        box.innerHTML = `<strong>ID:</strong> ${ord.orderId} | <strong>User:</strong> ${ord.user} <span style="float: right; color: var(--text-muted);">${ord.date}</span><br><span style="color: var(--accent-gold);">Items:</span> ${itemsSummary}`;
        container.appendChild(box);
    });
}

// Authentication & Panel Routing
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');

    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabRegisterBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
    }
}

function handleUserRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUser').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;

    const users = JSON.parse(localStorage.getItem('gbc_registered_users') || '[]');
    if (users.some(u => u.username === username)) {
        alert('Username already exists!');
        return;
    }

    users.push({ username, email, pass });
    localStorage.setItem('gbc_registered_users', JSON.stringify(users));
    sessionStorage.setItem('gbc_logged_in_user', username);
    alert('Account created successfully!');
    checkUserAuth();
}

function handleUserLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    if (identifier === 'admin' && pass === 'gbc2026admin') {
        sessionStorage.setItem('gbc_logged_in_user', 'Administrator');
        checkUserAuth();
        return;
    }

    const users = JSON.parse(localStorage.getItem('gbc_registered_users') || '[]');
    const found = users.find(u => (u.username === identifier || u.email === identifier) && u.pass === pass);

    if (found) {
        sessionStorage.setItem('gbc_logged_in_user', found.username);
        checkUserAuth();
    } else {
        alert('Invalid credentials!');
    }
}

function userLogout() {
    sessionStorage.removeItem('gbc_logged_in_user');
    checkUserAuth();
}

function checkUserAuth() {
    const loggedUser = sessionStorage.getItem('gbc_logged_in_user');
    const authScreen = document.getElementById('authScreen');
    const panelScreen = document.getElementById('panelScreen');
    const logoutBtn = document.getElementById('logoutBtn');
    const welcomeBanner = document.getElementById('welcomeUserBanner');

    if (loggedUser) {
        if(authScreen) authScreen.style.display = 'none';
        if(panelScreen) panelScreen.style.display = 'block';
        if(logoutBtn) logoutBtn.style.display = 'block';
        if(welcomeBanner) welcomeBanner.innerText = `Logged in: ${loggedUser}`;
    } else {
        if(authScreen) authScreen.style.display = 'block';
        if(panelScreen) panelScreen.style.display = 'none';
        if(logoutBtn) logoutBtn.style.display = 'none';
    }
}

function switchImgInput(mode) {
    const urlBox = document.getElementById('urlInputBox');
    const fileBox = document.getElementById('fileInputBox');
    const btnUrl = document.getElementById('imgTabUrl');
    const btnFile = document.getElementById('imgTabFile');

    if (mode === 'url') {
        urlBox.style.display = 'block';
        fileBox.style.display = 'none';
        btnUrl.classList.add('active');
        btnFile.classList.remove('active');
    } else {
        urlBox.style.display = 'none';
        fileBox.style.display = 'block';
        btnFile.classList.add('active');
        btnUrl.classList.remove('active');
    }
}

function handleItemUpload(event) {
    event.preventDefault();
    const category = document.getElementById('itemCategory').value;
    const title = document.getElementById('itemTitle').value;
    const price = document.getElementById('itemPrice').value;
    const tag = document.getElementById('itemTag').value;
    const desc = document.getElementById('itemDesc').value;

    const fileInput = document.getElementById('itemFile');
    const urlInput = document.getElementById('itemImage').value;

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveNewItem(category, { title, price, tag, desc, image: e.target.result });
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveNewItem(category, { title, price, tag, desc, image: urlInput });
    }
}

function saveNewItem(category, newItem) {
    const data = getStoreData();
    if (!data[category]) data[category] = [];
    data[category].unshift(newItem);
    localStorage.setItem('gbc_store_data_categorized', JSON.stringify(data));
    alert('Item successfully published to marketplace category!');
    document.getElementById('uploadForm').reset();
                 }
            
// Homepage Authentication State Check
function checkIndexAuth() {
    const loggedUser = sessionStorage.getItem('gbc_logged_in_user');
    const loggedInView = document.getElementById('loggedInView');
    const loggedOutView = document.getElementById('loggedOutView');
    const displayUsername = document.getElementById('displayUsername');

    if (!loggedInView || !loggedOutView) return;

    if (loggedUser) {
        loggedInView.style.display = 'block';
        loggedOutView.style.display = 'none';
        if (displayUsername) displayUsername.innerText = loggedUser;
    } else {
        loggedInView.style.display = 'none';
        loggedOutView.style.display = 'block';
    }
}

// Override or extend login handlers to support homepage redirection state updates
const originalHandleUserLogin = handleUserLogin;
handleUserLogin = function(e) {
    originalHandleUserLogin(e);
    if(typeof checkIndexAuth === 'function') checkIndexAuth();
};

const originalHandleUserRegister = handleUserRegister;
handleUserRegister = function(e) {
    originalHandleUserRegister(e);
    if(typeof checkIndexAuth === 'function') checkIndexAuth();
};

const originalUserLogout = userLogout;
userLogout = function() {
    originalUserLogout();
    if(typeof checkIndexAuth === 'function') checkIndexAuth();
};
