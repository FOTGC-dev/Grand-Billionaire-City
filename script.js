// ==========================================
// SUPABASE CONFIGURATION & INITIALIZATION
// ==========================================
const SUPABASE_URL = 'https://blmpsybqewgbvmqjajmc.supabase.co';
const SUPABASE_ANON_KEY = 'Sb_publishable_3q_HCgN5TEmaSjO6luPbwA_rXE6CLHx';

// Create the global Supabase client instance
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const defaultSiteConfig = {
    hero: {
        navBadge: "GBC",
        heroBadge: "WELCOME TO GBC",
        title: "The Ultimate Roleplay Experience",
        description: "Build your legacy, acquire high-tier vehicles, claim luxury properties, and network with elite players across Grand Billionaire City."
    },
    store: {
        coins: [
            { id: 'c1', title: "1 GC COIN", price: "1 GC", tag: "INSTANT", desc: "$0.27 • ₦400" },
            { id: 'c2', title: "5 GC COIN", price: "5 GC", tag: "POPULAR", desc: "$1.35 • ₦2,000" }
        ],
        vehicles: [{ id: 'v1', title: "Porsche 911 Turbo S", price: "34 GC", tag: "STOCK 5", desc: "Game Value: 75M" }],
        properties: [{ id: 'p1', title: "Vinwood Mansion", price: "17 GC", tag: "ESTATE", desc: "Hillside luxury property" }]
    },
    bank: "Bank Name: OPay / Kuda\nAccount Number: 1234567890\nAccount Name: Grand Billionaire City"
};

(function initMasterSystem() {
    if (!localStorage.getItem('gbc_site_config')) localStorage.setItem('gbc_site_config', JSON.stringify(defaultSiteConfig));
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

function getSiteConfig() {
    const saved = localStorage.getItem('gbc_site_config');
    return saved ? JSON.parse(saved) : defaultSiteConfig;
}

function renderDynamicHomepage() {
    const config = getSiteConfig().hero;
    if(document.getElementById('navBadge')) document.getElementById('navBadge').innerText = config.navBadge;
    if(document.getElementById('heroBadge')) document.getElementById('heroBadge').innerText = config.heroBadge;
    if(document.getElementById('heroTitle')) document.getElementById('heroTitle').innerText = config.title;
    if(document.getElementById('heroDescription')) document.getElementById('heroDescription').innerText = config.description;
    if(document.getElementById('pageTitleMeta')) document.getElementById('pageTitleMeta').innerText = `${config.navBadge} - ${config.title}`;
}

function renderMarketplaceStorefront() {
    const grid = document.getElementById('liveMarketplaceGrid');
    if(!grid) return;
    const store = getSiteConfig().store;
    grid.innerHTML = '';
    for (const category in store) {
        store[category].forEach(item => {
            const card = document.createElement('div');
            card.style.cssText = 'background:#111; border:1px solid var(--card-border); border-radius:8px; padding:15px;';
            card.innerHTML = `<span style="background: var(--accent-gold); color: black; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${item.tag || category.toUpperCase()}</span><h4 style="color: white; margin: 10px 0 5px 0;">${item.title}</h4><p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 10px;">${item.desc}</p><div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;"><span style="color: var(--accent-gold); font-weight: bold;">${item.price}</span><button class="btn-primary" style="width: auto; padding: 6px 14px; font-size: 0.8rem;" onclick="openCheckoutModal('${item.title}', '${item.price}')">BUY NOW</button></div>`;
            grid.appendChild(card);
        });
    }
}

function openCheckoutModal(title, price) {
    const existingModal = document.getElementById('gbcCheckoutModal');
    if(existingModal) existingModal.remove();
    const bankDetails = getSiteConfig().bank.replace(/\n/g, '<br>');
    const currentUser = sessionStorage.getItem('gbc_logged_in_user') || 'Guest Player';
    const modal = document.createElement('div');
    modal.id = 'gbcCheckoutModal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; z-index:9999; padding:20px;';
    modal.innerHTML = `
        <div style="background:#111; border:1px solid var(--accent-gold); border-radius:12px; padding:25px; max-width:450px; width:100%; box-shadow:0 10px 30px rgba(0,0,0,0.7);">
            <h3 style="color:var(--accent-gold); margin-bottom:10px; text-align:center;">Secure Bank Checkout</h3>
            <div style="background:#0a0a0a; padding:12px; border-radius:6px; margin-bottom:15px; border:1px solid var(--card-border);">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="color:var(--text-muted);">Item:</span><strong style="color:white;">${title}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-muted);">Total Price:</span><strong style="color:var(--accent-gold);">${price}</strong></div>
            </div>
            <div style="background:#1a1a1a; padding:15px; border-radius:6px; margin-bottom:20px; border-left:4px solid var(--accent-gold);">
                <span style="font-size:0.75rem; color:var(--accent-gold); font-weight:bold; display:block; margin-bottom:5px;">⚠️ APPROVED TRANSFER ACCOUNT:</span>
                <p style="font-size:0.9rem; color:white; line-height:1.5;">${bankDetails}</p>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="btn-primary" style="background:transparent; border:1px solid var(--card-border); color:white;" onclick="document.getElementById('gbcCheckoutModal').remove()">CANCEL</button>
                <button class="btn-primary" onclick="generateDigitalReceipt('${title}', '${price}', '${currentUser}')">I HAVE TRANSFERRED</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
}

function generateDigitalReceipt(title, price, user) {
    const orderId = 'GBC-' + Math.floor(100000 + Math.random() * 900000);
    const timestamp = new Date().toLocaleString();
    const orders = JSON.parse(localStorage.getItem('gbc_placed_orders') || '[]');
    orders.push({ orderId, title, price, user, timestamp, status: 'Pending Verification' });
    localStorage.setItem('gbc_placed_orders', JSON.stringify(orders));
    const modalContent = document.getElementById('gbcCheckoutModal').querySelector('div');
    modalContent.innerHTML = `<div style="text-align:center;"><h3 style="color:white; margin-bottom:5px;">Transfer Notice Received!</h3><p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:20px;">Order ID: <strong style="color:var(--accent-gold);">${orderId}</strong></p><button class="btn-primary" onclick="document.getElementById('gbcCheckoutModal').remove()">CLOSE</button></div>`;
}

function handleUserLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    const users = JSON.parse(localStorage.getItem('gbc_registered_users') || '[]');
    const found = users.find(u => (u.username === identifier || u.email === identifier) && u.pass === pass);
    if (found) { sessionStorage.setItem('gbc_logged_in_user', found.username); window.location.href = 'index.html'; } else { alert('Invalid credentials!'); }
}

function userLogout() { sessionStorage.removeItem('gbc_logged_in_user'); window.location.href = 'index.html'; }

function handleStaffLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('staffUser').value;
    const pass = document.getElementById('staffPass').value;
    if (identifier === 'Theophilus' && pass === '631111pw') { sessionStorage.setItem('gbc_logged_in_user', 'Theophilus'); window.location.href = 'panel.html'; return; }
    const staffList = JSON.parse(localStorage.getItem('gbc_approved_staff') || '[]');
    const staffMember = staffList.find(s => s.name === identifier && s.pass === pass);
    if (staffMember) { sessionStorage.setItem('gbc_logged_in_user', staffMember.name); window.location.href = 'panel.html'; } else { alert('Invalid credentials.'); }
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
    alert('Application submitted!');
    document.getElementById('staffApplyForm').reset();
}

function initializeStaffPanel(username) {
    const staffList = JSON.parse(localStorage.getItem('gbc_approved_staff') || '[]');
    let currentStaff = staffList.find(s => s.name === username) || (username === 'Theophilus' ? { level: '8', role: 'Level 8: Owner' } : { level: '1', role: 'Level 1: Support' });
    const userLevel = parseInt(currentStaff.level || '1');
    document.getElementById('welcomeUserBanner').innerText = `${username} (${currentStaff.role || 'Level 1 Support'})`;
    if (userLevel >= 2) document.getElementById('tabOrdersBtn').style.display = 'block';
    if (userLevel >= 4) document.getElementById('tabHomepageBtn').style.display = 'block';
    if (userLevel >= 5) document.getElementById('tabPlayersBtn').style.display = 'block';
    if (userLevel >= 6) document.getElementById('tabAdminsBtn').style.display = 'block';
    if (userLevel >= 7) document.getElementById('tabBankBtn').style.display = 'block';
    if (userLevel >= 8) document.getElementById('tabStaffApprovalBtn').style.display = 'block';
    if (userLevel >= 2) loadOrdersManager();
    if (userLevel >= 4) { loadWebsiteEditorValues(); loadStoreItemsManager(); }
}

function switchPanelTab(tabName, btnEl) {
    document.querySelectorAll('.panel-section').forEach(sec => sec.style.display = 'none');
    document.querySelectorAll('.tab-selector .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`panelTab-${tabName}`).style.display = 'block';
    if(btnEl) btnEl.classList.add('active');
}

function loadOrdersManager() {
    const container = document.getElementById('ordersContainer');
    if(!container) return;
    const orders = JSON.parse(localStorage.getItem('gbc_placed_orders') || '[]');
    container.innerHTML = orders.length === 0 ? '<p style="color: var(--text-muted);">No pending orders.</p>' : '';
    orders.forEach((o, index) => {
        const box = document.createElement('div');
        box.style.cssText = 'background:#0a0a0a; border:1px solid var(--card-border); padding:12px; border-radius:8px; font-size:0.85rem; margin-bottom:8px;';
        box.innerHTML = `<strong style="color:var(--accent-gold);">${o.orderId}</strong> - ${o.title} (${o.price})<br>Buyer: ${o.user}<br><button class="btn-primary" style="width:auto; padding:4px 10px; margin-top:8px;" onclick="fulfillOrder(${index})">MARK AS FULFILLED</button>`;
        container.appendChild(box);
    });
}

function fulfillOrder(index) {
    const orders = JSON.parse(localStorage.getItem('gbc_placed_orders') || '[]');
    orders[index].status = 'Completed / Fulfilled';
    localStorage.setItem('gbc_placed_orders', JSON.stringify(orders));
    loadOrdersManager();
}

function loadWebsiteEditorValues() {
    const config = getSiteConfig().hero;
    if(document.getElementById('editNavBadge')) document.getElementById('editNavBadge').value = config.navBadge;
    if(document.getElementById('editHeroBadge')) document.getElementById('editHeroBadge').value = config.heroBadge;
    if(document.getElementById('editHeroTitle')) document.getElementById('editHeroTitle').value = config.title;
    if(document.getElementById('editHeroDesc')) document.getElementById('editHeroDesc').value = config.description;
}

function handleSaveHeroSettings(e) {
    e.preventDefault();
    const config = getSiteConfig();
    config.hero.navBadge = document.getElementById('editNavBadge').value;
    config.hero.heroBadge = document.getElementById('editHeroBadge').value;
    config.hero.title = document.getElementById('editHeroTitle').value;
    config.hero.description = document.getElementById('editHeroDesc').value;
    localStorage.setItem('gbc_site_config', JSON.stringify(config));
    alert('Homepage updated!');
}

function loadStoreItemsManager() {
    const container = document.getElementById('storeItemsContainer');
    if(!container) return;
    const store = getSiteConfig().store;
    container.innerHTML = '';
    for (const category in store) {
        store[category].forEach((item, index) => {
            const card = document.createElement('div');
            card.style.cssText = 'background:#0a0a0a; border:1px solid var(--card-border); padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;';
            card.innerHTML = `<div><strong style="color: white;">${item.title}</strong><small style="display:block; color: var(--text-muted);">${item.price}</small></div><button class="btn-primary" style="width: auto; padding: 6px 12px; background: #c0392b;" onclick="deleteStoreItem('${category}', ${index})">DELETE</button>`;
            container.appendChild(card);
        });
    }
}

function handleAddStoreItem(e) {
    e.preventDefault();
    const category = document.getElementById('itemCategorySelect').value;
    const title = document.getElementById('itemTitleInput').value;
    const price = document.getElementById('itemPriceInput').value;
    const tag = document.getElementById('itemTagInput').value;
    const desc = document.getElementById('itemDescInput').value;
    const config = getSiteConfig();
    if(!config.store[category]) config.store[category] = [];
    config.store[category].push({ id: 'item_' + Date.now(), title, price, tag, desc });
    localStorage.setItem('gbc_site_config', JSON.stringify(config));
    document.getElementById('addItemForm').reset();
    loadStoreItemsManager();
}

function deleteStoreItem(category, index) {
    const config = getSiteConfig();
    if(config.store[category]) {
        config.store[category].splice(index, 1);
        localStorage.setItem('gbc_site_config', JSON.stringify(config));
        loadStoreItemsManager();
    }
}

function saveBankAccountInfo() {
    const config = getSiteConfig();
    config.bank = document.getElementById('bankInfoInput').value;
    localStorage.setItem('gbc_site_config', JSON.stringify(config));
    alert('Bank updated!');
}
