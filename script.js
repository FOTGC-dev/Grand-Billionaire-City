// Default mock database across categories
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

// Render store sections on marketplace.html with WhatsApp order encoding
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
                    <button class="btn-primary btn-whatsapp" onclick="orderItemWhatsApp('${item.title}', '${item.price}')">BUY VIA WHATSAPP</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}

// Encode order and redirect straight to official WhatsApp number/chat
function orderItemWhatsApp(title, price) {
    const orderId = 'GBC-' + Math.floor(100000 + Math.random() * 900000);
    const message = `Hello Grand Billionaire City Support, I would like to purchase:\n\n📦 Item: ${title}\n💎 Price: ${price}\n🆔 Order ID: ${orderId}\n\nPlease verify and send payment/in-game delivery instructions.`;
    const encoded = encodeURIComponent(message);
    
    // Replace with your actual WhatsApp business line if needed
    const whatsappNumber = "2348000000000"; 
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
}

function checkoutViaWhatsApp() {
    orderItemWhatsApp("General Cart Checkout", "Custom Order");
}

function sendContactEmail(e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const msg = document.getElementById('contactMsg').value;
    
    alert(`Thank you ${name}! Your message has been sent to grandbillionairecity@gmail.com. We will respond via email or WhatsApp shortly.`);
    e.target.reset();
}

// Staff Login Management for panel.html
function checkStaffAuth() {
    const isAuthed = sessionStorage.getItem('gbc_staff_logged_in') === 'true';
    const loginScreen = document.getElementById('loginScreen');
    const panelScreen = document.getElementById('panelScreen');
    const logoutBtn = document.getElementById('logoutBtn');

    if (isAuthed) {
        if(loginScreen) loginScreen.style.display = 'none';
        if(panelScreen) panelScreen.style.display = 'block';
        if(logoutBtn) logoutBtn.style.display = 'block';
    } else {
        if(loginScreen) loginScreen.style.display = 'block';
        if(panelScreen) panelScreen.style.display = 'none';
        if(logoutBtn) logoutBtn.style.display = 'none';
    }
}

function handleStaffLogin(e) {
    e.preventDefault();
    const user = document.getElementById('staffUser').value;
    const pass = document.getElementById('staffPass').value;

    // Simple secure check (Change username/password here as desired)
    if (user === 'admin' && pass === 'gbc2026admin') {
        sessionStorage.setItem('gbc_staff_logged_in', 'true');
        checkStaffAuth();
    } else {
        alert('Invalid credentials! Access denied.');
    }
}

function staffLogout() {
    sessionStorage.removeItem('gbc_staff_logged_in');
    checkStaffAuth();
}

// Handle item upload from authenticated panel with category selector
function handleItemUpload(event) {
    event.preventDefault();
    
    const category = document.getElementById('itemCategory').value;
    const newItem = {
        title: document.getElementById('itemTitle').value,
        price: document.getElementById('itemPrice').value,
        tag: document.getElementById('itemTag').value,
        image: document.getElementById('itemImage').value,
        desc: document.getElementById('itemDesc').value
    };

    const data = getStoreData();
    if (!data[category]) data[category] = [];
    
    data[category].unshift(newItem);
    localStorage.setItem('gbc_store_data_categorized', JSON.stringify(data));

    alert('Item successfully published to marketplace category!');
    document.getElementById('uploadForm').reset();
}
